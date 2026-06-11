package com.mapgame.modules.travel.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mapgame.common.api.ResultCode;
import com.mapgame.common.config.Configuration;
import com.mapgame.common.exception.BizException;
import com.mapgame.modules.agent.entity.Agent;
import com.mapgame.modules.agent.mapper.AgentMapper;
import com.mapgame.modules.passport.service.PassportService;
import com.mapgame.modules.player.entity.Player;
import com.mapgame.modules.player.mapper.PlayerMapper;
import com.mapgame.modules.travel.domain.TravelPathPlanner;
import com.mapgame.modules.travel.domain.TravelUnlockContext;
import com.mapgame.modules.travel.entity.Route;
import com.mapgame.modules.travel.entity.Trip;
import com.mapgame.modules.travel.mapper.RouteMapper;
import com.mapgame.modules.travel.mapper.TripMapper;
import com.mapgame.modules.travel.query.TripBookQuery;
import com.mapgame.modules.travel.query.TripInTransitQuery;
import com.mapgame.modules.travel.query.TripPlanQuery;
import com.mapgame.modules.travel.service.TravelService;
import com.mapgame.modules.travel.vo.TripPlanVO;
import com.mapgame.modules.travel.vo.TripRefundVO;
import com.mapgame.modules.travel.vo.TripVO;
import com.mapgame.modules.world.entity.City;
import com.mapgame.modules.world.entity.World;
import com.mapgame.modules.world.mapper.CityMapper;
import com.mapgame.modules.world.mapper.WorldMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 出行服务实现
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelServiceImpl implements TravelService {

    private final RouteMapper routeMapper;
    private final TripMapper tripMapper;
    private final PlayerMapper playerMapper;
    private final AgentMapper agentMapper;
    private final CityMapper cityMapper;
    private final WorldMapper worldMapper;
    @Lazy
    private final PassportService passportService;

    @Override
    public List<TripPlanVO> planTrip(TripPlanQuery query) {
        validatePlanQuery(query);
        if (Objects.equals(query.getFromCityId(), query.getToCityId())) {
            throw new BizException(ResultCode.BIZ_TRIP_SAME_CITY);
        }
        List<Route> routes = loadActiveRoutes();
        TravelUnlockContext ctx = buildUnlockContext(query.getWorldId(), query.getPlayerId());
        List<TripPlanVO> plans = TravelPathPlanner.plan(query.getFromCityId(), query.getToCityId(), routes, ctx);
        if (plans.isEmpty()) {
            throw new BizException(ResultCode.BIZ_TRIP_UNREACHABLE);
        }
        return plans;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripVO bookTrip(TripBookQuery query) {
        if (Objects.isNull(query) || Objects.isNull(query.getPlanNo())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "订票参数不完整");
        }
        TripPlanQuery planQuery = new TripPlanQuery();
        planQuery.setFromCityId(query.getFromCityId());
        planQuery.setToCityId(query.getToCityId());
        planQuery.setTeamId(query.getTeamId());
        planQuery.setPlayerId(query.getPlayerId());
        planQuery.setWorldId(query.getWorldId());
        List<TripPlanVO> plans = planTrip(planQuery);
        TripPlanVO plan = plans.stream()
                .filter(item -> Objects.equals(item.getPlanNo(), query.getPlanNo()))
                .findFirst()
                .orElseThrow(() -> new BizException(ResultCode.BIZ_NOT_FOUND, "方案不存在 planNo=" + query.getPlanNo()));

        Player player = playerMapper.selectById(query.getPlayerId());
        if (Objects.isNull(player)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "玩家不存在");
        }
        int price = plan.getTotalPrice();
        int fuel = plan.getFuelCost() == null ? 0 : plan.getFuelCost();
        if ((player.getCoin() == null ? 0 : player.getCoin()) < price) {
            throw new BizException(ResultCode.BIZ_NOT_ENOUGH_COIN);
        }
        if ((player.getFuel() == null ? 0 : player.getFuel()) < fuel) {
            throw new BizException(ResultCode.BIZ_NOT_ENOUGH_FUEL);
        }

        Long leadAgentId = query.getLeadAgentId();
        if (leadAgentId != null) {
            Agent agent = agentMapper.selectById(leadAgentId);
            if (agent == null || !Objects.equals(agent.getPlayerId(), query.getPlayerId())) {
                throw new BizException(ResultCode.BIZ_AGENT_NOT_FOUND);
            }
            int fatigue = agent.getFatigue() == null ? 0 : agent.getFatigue();
            int tripFatigue = plan.getFatigueCost() == null ? 0 : plan.getFatigueCost();
            boolean force = Boolean.TRUE.equals(query.getForceDepart());
            if (!force && fatigue + tripFatigue >= 70) {
                throw new BizException(ResultCode.BIZ_PARAM_INVALID, "疲劳过高，需休整或强行出发");
            }
            agent.setFatigue(Math.min(100, fatigue + tripFatigue));
            agent.setStatus("STANDBY");
            agentMapper.updateById(agent);
        }

        player.setCoin(player.getCoin() - price);
        player.setFuel(Math.max(0, player.getFuel() - fuel));
        if (Boolean.TRUE.equals(plan.getTransferCombo())) {
            player.setClue((player.getClue() == null ? 0 : player.getClue()) + 1);
        }
        playerMapper.updateById(player);

        World world = loadWorld(query.getWorldId());
        int currentTurn = world.getTurnNo() == null ? 1 : world.getTurnNo();
        int offset = query.getDepartureOffset() == null ? 0 : query.getDepartureOffset();

        Trip trip = new Trip();
        trip.setTeamId(query.getTeamId());
        trip.setPlayerId(query.getPlayerId());
        trip.setMissionId(query.getMissionId());
        trip.setFromCityId(query.getFromCityId());
        trip.setToCityId(query.getToCityId());
        trip.setLeadAgentId(leadAgentId);
        trip.setStatus("BOOKED");
        trip.setDepartureTurn(currentTurn + offset);
        trip.setPaidCoin(price);
        trip.setPaidFuel(fuel);
        trip.setForceDepart(Boolean.TRUE.equals(query.getForceDepart()) ? 1 : 0);
        trip.setDelayTurn(0);
        trip.setElapsedTurn(0);
        trip.setPlanJson(JSONUtil.toJsonStr(plan));
        trip.setRouteIds(plan.getSegments().stream()
                .map(segment -> String.valueOf(segment.getRouteId()))
                .collect(Collectors.joining(",")));
        tripMapper.insert(trip);

        if (leadAgentId != null) {
            Agent agent = agentMapper.selectById(leadAgentId);
            if (agent != null) {
                agent.setAssignedTripId(trip.getId());
                agentMapper.updateById(agent);
            }
        }

        log.info("订票成功 tripId={} playerId={} {} -> {}", trip.getId(), query.getPlayerId(), query.getFromCityId(), query.getToCityId());
        return toTripVO(trip, plan);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TripRefundVO cancelTrip(Long tripId, Long playerId) {
        Trip trip = loadOwnedTrip(tripId, playerId);
        if (!"BOOKED".equals(trip.getStatus())) {
            throw new BizException(ResultCode.BIZ_TRIP_NOT_BOOKED);
        }
        int paid = trip.getPaidCoin() == null ? 0 : trip.getPaidCoin();
        double feeRate = Configuration.REFUND_FEE_RATE;
        int fee = (int) Math.round(paid * feeRate);
        int refund = Math.max(0, paid - fee);
        Player player = playerMapper.selectById(playerId);
        if (player != null) {
            player.setCoin((player.getCoin() == null ? 0 : player.getCoin()) + refund);
            playerMapper.updateById(player);
        }
        trip.setStatus("CANCELLED");
        tripMapper.updateById(trip);
        clearAgentAssignment(trip.getLeadAgentId());

        TripRefundVO vo = new TripRefundVO();
        vo.setTripId(tripId);
        vo.setRefundCoin(refund);
        vo.setFeeCoin(fee);
        log.info("退票 tripId={} refund={} fee={}", tripId, refund, fee);
        return vo;
    }

    @Override
    public List<TripVO> listActiveTrips(TripInTransitQuery query) {
        if (Objects.isNull(query) || Objects.isNull(query.getPlayerId())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "playerId 不能为空");
        }
        QueryWrapper<Trip> wrapper = new QueryWrapper<>();
        wrapper.eq("player_id", query.getPlayerId());
        wrapper.in("status", "BOOKED", "IN_TRANSIT", "PAUSED");
        wrapper.orderByDesc("id");
        List<Trip> trips = tripMapper.selectList(wrapper);
        List<TripVO> result = new ArrayList<>(trips.size());
        for (Trip trip : trips) {
            result.add(toTripVO(trip, parsePlan(trip)));
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void advanceTrips(Long worldId, Integer currentTurn) {
        QueryWrapper<Trip> wrapper = new QueryWrapper<>();
        wrapper.in("status", "BOOKED", "IN_TRANSIT", "PAUSED");
        List<Trip> trips = tripMapper.selectList(wrapper);
        for (Trip trip : trips) {
            TripPlanVO plan = parsePlan(trip);
            int totalTurn = plan == null || plan.getTotalTurn() == null ? 1 : plan.getTotalTurn();
            int delay = trip.getDelayTurn() == null ? 0 : trip.getDelayTurn();

            if ("BOOKED".equals(trip.getStatus())) {
                int departTurn = trip.getDepartureTurn() == null ? currentTurn : trip.getDepartureTurn();
                if (currentTurn >= departTurn) {
                    trip.setStatus("IN_TRANSIT");
                    trip.setStartTurn(currentTurn);
                    trip.setElapsedTurn(0);
                    tripMapper.updateById(trip);
                    if (trip.getLeadAgentId() != null) {
                        Agent agent = agentMapper.selectById(trip.getLeadAgentId());
                        if (agent != null) {
                            agent.setStatus("IN_TRANSIT");
                            agentMapper.updateById(agent);
                        }
                    }
                }
                continue;
            }

            if ("PAUSED".equals(trip.getStatus())) {
                continue;
            }

            if ("IN_TRANSIT".equals(trip.getStatus())) {
                int elapsed = (trip.getElapsedTurn() == null ? 0 : trip.getElapsedTurn()) + 1;
                trip.setElapsedTurn(elapsed);
                if (elapsed >= totalTurn + delay) {
                    trip.setStatus("ARRIVED");
                    trip.setArriveTurn(currentTurn);
                    tripMapper.updateById(trip);
                    onTripArrived(trip, plan);
                } else {
                    tripMapper.updateById(trip);
                }
            }
        }
    }

    private void onTripArrived(Trip trip, TripPlanVO plan) {
        clearAgentAssignment(trip.getLeadAgentId());
        if (trip.getLeadAgentId() != null) {
            Agent agent = agentMapper.selectById(trip.getLeadAgentId());
            if (agent != null) {
                int fatigue = agent.getFatigue() == null ? 0 : agent.getFatigue();
                agent.setStatus(fatigue >= 70 ? "NEED_REST" : "IDLE");
                agent.setAssignedTripId(null);
                agentMapper.updateById(agent);
            }
        }
        if (plan != null && trip.getPlayerId() != null && trip.getToCityId() != null) {
            int distance = plan.getSegments() == null ? 0
                    : plan.getSegments().stream().mapToInt(segment -> segment.getDistance() == null ? 0 : segment.getDistance()).sum();
            Long regionId = resolveRegionId(trip.getToCityId());
            passportService.onTripArrived(trip.getPlayerId(), trip.getId(), regionId, distance, plan);
        }
    }

    private void clearAgentAssignment(Long agentId) {
        if (agentId == null) {
            return;
        }
        Agent agent = agentMapper.selectById(agentId);
        if (agent != null) {
            agent.setAssignedTripId(null);
            agentMapper.updateById(agent);
        }
    }

    private Long resolveRegionId(Long cityId) {
        City city = cityMapper.selectById(cityId);
        return city == null ? null : city.getRegionId();
    }

    private Trip loadOwnedTrip(Long tripId, Long playerId) {
        Trip trip = tripMapper.selectById(tripId);
        if (trip == null || !Objects.equals(trip.getPlayerId(), playerId)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "行程不存在");
        }
        return trip;
    }

    private void validatePlanQuery(TripPlanQuery query) {
        if (query == null || query.getFromCityId() == null || query.getToCityId() == null) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "起终点不能为空");
        }
    }

    private List<Route> loadActiveRoutes() {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.and(w -> w.eq("disabled", 0).or().isNull("disabled"));
        return routeMapper.selectList(wrapper);
    }

    private TravelUnlockContext buildUnlockContext(Long worldId, Long playerId) {
        World world = loadWorld(worldId);
        int hqLevel = world.getHqLevel() == null ? 1 : world.getHqLevel();
        List<City> cities = cityMapper.selectList(null);
        Map<Long, City> cityMap = cities.stream().collect(Collectors.toMap(City::getId, city -> city, (a, b) -> a));
        Set<Long> visas = new HashSet<>();
        double discount = 0;
        if (playerId != null) {
            visas.addAll(passportService.listVisaRegionIds(playerId));
            discount = passportService.ticketDiscount(playerId);
        }
        return TravelUnlockContext.builder()
                .hqLevel(hqLevel)
                .cityLevel(cityId -> {
                    City city = cityMap.get(cityId);
                    return city == null || city.getLevel() == null ? 1 : city.getLevel();
                })
                .regionIdOfCity(cityId -> {
                    City city = cityMap.get(cityId);
                    return city == null ? null : city.getRegionId();
                })
                .visaRegionIds(visas)
                .priceDiscount(discount)
                .build();
    }

    private World loadWorld(Long worldId) {
        Long id = worldId == null ? 1L : worldId;
        World world = worldMapper.selectById(id);
        if (world == null) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "世界不存在 id=" + id);
        }
        return world;
    }

    private TripPlanVO parsePlan(Trip trip) {
        if (trip.getPlanJson() == null || trip.getPlanJson().isBlank()) {
            return null;
        }
        return JSONUtil.toBean(trip.getPlanJson(), TripPlanVO.class);
    }

    private TripVO toTripVO(Trip trip, TripPlanVO plan) {
        TripVO vo = new TripVO();
        BeanUtil.copyProperties(trip, vo);
        vo.setPlan(plan);
        int total = plan == null || plan.getTotalTurn() == null ? 1 : plan.getTotalTurn();
        int delay = trip.getDelayTurn() == null ? 0 : trip.getDelayTurn();
        int elapsed = trip.getElapsedTurn() == null ? 0 : trip.getElapsedTurn();
        int denom = Math.max(1, total + delay);
        vo.setProgressPercent(Math.min(100, (int) Math.round(elapsed * 100.0 / denom)));
        return vo;
    }
}
