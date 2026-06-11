package com.mapgame.modules.travel.domain;

import com.mapgame.common.config.Configuration;
import com.mapgame.modules.travel.entity.Route;
import com.mapgame.modules.travel.enums.VehicleType;
import com.mapgame.modules.travel.vo.RouteSegmentVO;
import com.mapgame.modules.travel.vo.TripPlanVO;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 出行路径规划（Dijkstra 三方案）
 * @author make java
 * @since 2026-06-11
 */
public final class TravelPathPlanner {

    private static final Set<Long> VISA_GATED_REGIONS = Set.of(3L, 5L);

    private TravelPathPlanner() {
    }

    /**
     * 计算多套行程方案
     * @param fromCityId 出发城市
     * @param toCityId 目的城市
     * @param routes 可用路径
     * @param ctx 解锁上下文
     * @return 方案列表
     */
    public static List<TripPlanVO> plan(Long fromCityId, Long toCityId, List<Route> routes, TravelUnlockContext ctx) {
        if (Objects.equals(fromCityId, toCityId)) {
            return List.of();
        }
        List<Route> unlocked = routes.stream().filter(route -> routeUnlocked(route, ctx)).toList();
        List<Route> fast = dijkstra(fromCityId, toCityId, unlocked, Preference.FAST);
        List<Route> cheap = dijkstra(fromCityId, toCityId, unlocked, Preference.CHEAP);
        List<Route> safe = dijkstra(fromCityId, toCityId, unlocked, Preference.SAFE);

        Set<String> seen = new HashSet<>();
        List<TripPlanVO> plans = new ArrayList<>();
        addPlan(plans, seen, fast, "直飞特快 · 直达", "最快", Preference.FAST, ctx);
        addPlan(plans, seen, cheap, "联运方案 · 线索 +1 · 换乘奖励", "最省", Preference.CHEAP, ctx);
        addPlan(plans, seen, safe, "隐秘小路 · 免费 · 发现率↑", "最稳", Preference.SAFE, ctx);
        return plans;
    }

    private static void addPlan(
            List<TripPlanVO> plans,
            Set<String> seen,
            List<Route> routeList,
            String bonusDesc,
            String planBadge,
            Preference style,
            TravelUnlockContext ctx) {
        if (routeList == null || routeList.isEmpty()) {
            return;
        }
        String signature = routeList.stream()
                .map(route -> route.getFromCity() + "-" + route.getToCity() + "-" + route.getVehicleType())
                .reduce((a, b) -> a + "|" + b)
                .orElse("");
        if (seen.contains(signature)) {
            return;
        }
        seen.add(signature);
        plans.add(buildPlan(plans.size() + 1, routeList, bonusDesc, planBadge, style, ctx));
    }

    private static TripPlanVO buildPlan(
            int planNo,
            List<Route> routes,
            String bonusDesc,
            String planBadge,
            Preference style,
            TravelUnlockContext ctx) {
        List<RouteSegmentVO> segments = new ArrayList<>();
        List<String> vehicleChain = new ArrayList<>();
        int totalTurn = 0;
        int rawPrice = 0;
        int fuelCost = 0;
        int fatigueCost = 0;
        double riskScore = 0;
        for (Route route : routes) {
            VehicleType vehicle = VehicleType.fromCode(route.getVehicleType());
            int turn = Math.max(1, route.getBaseTurn());
            int price = effectivePrice(route, vehicle);
            RouteSegmentVO segment = new RouteSegmentVO();
            segment.setRouteId(route.getId());
            segment.setFromCityId(route.getFromCity());
            segment.setToCityId(route.getToCity());
            segment.setVehicleType(vehicle.getLabel());
            segment.setDistance(route.getDistance());
            segment.setPrice(price);
            segment.setTurn(turn);
            segments.add(segment);
            vehicleChain.add(vehicle.getLabel());
            totalTurn += turn;
            rawPrice += price;
            fuelCost += vehicle == VehicleType.FOOT ? 0 : 10;
            fatigueCost += vehicle.getFatigue();
            riskScore += vehicle.getRisk();
        }
        double discount = Math.min(0.35, Math.max(0, ctx.getPriceDiscount()));
        int totalPrice = Math.max(0, (int) Math.round(rawPrice * (1 - discount)));
        Set<String> uniqueVehicles = new HashSet<>(vehicleChain);
        TripPlanVO vo = new TripPlanVO();
        vo.setPlanNo(planNo);
        vo.setSegments(segments);
        vo.setVehicleChain(vehicleChain);
        vo.setTotalTurn(totalTurn);
        vo.setTotalPrice(totalPrice);
        vo.setFuelCost(fuelCost);
        vo.setFatigueCost(fatigueCost);
        vo.setEventExpect(Math.max(1, (int) Math.round(totalTurn * 0.25)));
        vo.setBonusDesc(bonusDesc);
        vo.setPlanBadge(planBadge);
        vo.setTransferCombo(uniqueVehicles.size() >= 2);
        vo.setTripleCombo(uniqueVehicles.size() >= 3);
        vo.setRiskScore((int) Math.round(riskScore * 100));
        vo.setPlanStyle(style.name());
        return vo;
    }

    private static int effectivePrice(Route route, VehicleType vehicle) {
        double factor = switch (vehicle) {
            case PLANE -> Configuration.PLANE_PRICE_FACTOR;
            case SHIP -> Configuration.SHIP_PRICE_FACTOR;
            case TRAIN -> Configuration.TRAIN_PRICE_FACTOR;
            default -> 1.0;
        };
        return Math.max(0, (int) Math.round(route.getBasePrice() * factor));
    }

    private static boolean routeUnlocked(Route route, TravelUnlockContext ctx) {
        if (route.getDisabled() != null && route.getDisabled() == 1) {
            return false;
        }
        if (ctx.getRegionIdOfCity() != null && ctx.getVisaRegionIds() != null) {
            Long destRegion = ctx.getRegionIdOfCity().apply(route.getToCity());
            if (destRegion != null && VISA_GATED_REGIONS.contains(destRegion) && !ctx.getVisaRegionIds().contains(destRegion)) {
                return false;
            }
        }
        return true;
    }

    private static List<Route> dijkstra(Long fromCityId, Long toCityId, List<Route> routes, Preference preference) {
        Map<Long, List<Route>> graph = new HashMap<>();
        Set<Long> cityIds = new HashSet<>();
        for (Route route : routes) {
            cityIds.add(route.getFromCity());
            cityIds.add(route.getToCity());
            graph.computeIfAbsent(route.getFromCity(), key -> new ArrayList<>()).add(route);
        }
        Map<Long, Double> dist = new HashMap<>();
        Map<Long, Long> prev = new HashMap<>();
        Map<Long, Route> prevRoute = new HashMap<>();
        Set<Long> visited = new HashSet<>();
        for (Long id : cityIds) {
            dist.put(id, Double.POSITIVE_INFINITY);
        }
        dist.put(fromCityId, 0.0);
        while (visited.size() < cityIds.size()) {
            Long nextCity = null;
            double best = Double.POSITIVE_INFINITY;
            for (Long id : cityIds) {
                if (!visited.contains(id)) {
                    double score = dist.getOrDefault(id, Double.POSITIVE_INFINITY);
                    if (score < best) {
                        best = score;
                        nextCity = id;
                    }
                }
            }
            if (nextCity == null || best == Double.POSITIVE_INFINITY) {
                break;
            }
            if (Objects.equals(nextCity, toCityId)) {
                break;
            }
            visited.add(nextCity);
            for (Route route : graph.getOrDefault(nextCity, List.of())) {
                double score = best + routeWeight(route, preference);
                double old = dist.getOrDefault(route.getToCity(), Double.POSITIVE_INFINITY);
                if (score < old) {
                    dist.put(route.getToCity(), score);
                    prev.put(route.getToCity(), nextCity);
                    prevRoute.put(route.getToCity(), route);
                }
            }
        }
        if (dist.getOrDefault(toCityId, Double.POSITIVE_INFINITY) == Double.POSITIVE_INFINITY) {
            return null;
        }
        List<Route> result = new ArrayList<>();
        Long cursor = toCityId;
        while (!Objects.equals(cursor, fromCityId)) {
            Route route = prevRoute.get(cursor);
            Long prevCity = prev.get(cursor);
            if (route == null || prevCity == null) {
                return null;
            }
            result.add(0, route);
            cursor = prevCity;
        }
        return result;
    }

    private static double routeWeight(Route route, Preference preference) {
        VehicleType vehicle = VehicleType.fromCode(route.getVehicleType());
        int turn = Math.max(1, route.getBaseTurn());
        int price = effectivePrice(route, vehicle);
        return switch (preference) {
            case FAST -> turn;
            case CHEAP -> price + turn * 0.01;
            case SAFE -> vehicle.getRisk() * 100 + turn * 0.1;
        };
    }

    private enum Preference {
        FAST, CHEAP, SAFE
    }
}
