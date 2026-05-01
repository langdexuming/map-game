/**
 * 行程规划算法 (浏览器端 Dijkstra)
 * 与后端 TravelService.planTrip 保持一致语义
 * @author make java
 * @since 2026-05-01
 */
import { CITIES, ROUTES, VEHICLE_NAME } from './data.js';

const PREFERENCE = { FAST: 1, CHEAP: 2, SAFE: 3 };

function buildGraph() {
    const adj = new Map();
    for (const c of CITIES) {
        adj.set(c.id, []);
    }
    for (const r of ROUTES) {
        adj.get(r.fromCity).push(r);
    }
    return adj;
}

function weight(route, pref) {
    if (pref === PREFERENCE.FAST) {
        return route.baseTurn;
    }
    if (pref === PREFERENCE.CHEAP) {
        return route.basePrice + 0.01;
    }
    const eventRate = route.vehicleType === 2 ? 0.30 : route.vehicleType === 5 ? 0.40 : 0.20;
    return eventRate * 100;
}

function dijkstra(from, to, pref) {
    const adj = buildGraph();
    const dist = new Map();
    const prev = new Map();
    const prevRoute = new Map();
    for (const c of CITIES) {
        dist.set(c.id, Infinity);
    }
    dist.set(from, 0);

    const visited = new Set();
    while (visited.size < CITIES.length) {
        let u = null;
        let best = Infinity;
        for (const c of CITIES) {
            if (!visited.has(c.id) && dist.get(c.id) < best) {
                best = dist.get(c.id);
                u = c.id;
            }
        }
        if (u === null || best === Infinity) {
            break;
        }
        if (u === to) {
            break;
        }
        visited.add(u);
        for (const r of adj.get(u)) {
            const w = weight(r, pref);
            const nd = dist.get(u) + w;
            if (nd < dist.get(r.toCity)) {
                dist.set(r.toCity, nd);
                prev.set(r.toCity, u);
                prevRoute.set(r.toCity, r);
            }
        }
    }

    if (dist.get(to) === Infinity) {
        return null;
    }
    const routes = [];
    let cur = to;
    while (cur !== from) {
        const r = prevRoute.get(cur);
        if (!r) {
            return null;
        }
        routes.unshift(r);
        cur = prev.get(cur);
    }
    return routes;
}

function toPlan(planNo, routes, bonusDesc) {
    const totalTurn = routes.reduce((s, r) => s + r.baseTurn, 0);
    const totalPrice = routes.reduce((s, r) => s + r.basePrice, 0);
    const vehicleChain = routes.map(r => VEHICLE_NAME[r.vehicleType]);
    const eventExpect = Math.round(totalTurn * 0.25);
    return { planNo, routes, totalTurn, totalPrice, vehicleChain, eventExpect, bonusDesc };
}

export function planTrip(fromCityId, toCityId) {
    if (fromCityId === toCityId) {
        return { error: '起终点相同' };
    }
    const fast = dijkstra(fromCityId, toCityId, PREFERENCE.FAST);
    const cheap = dijkstra(fromCityId, toCityId, PREFERENCE.CHEAP);
    const safe = dijkstra(fromCityId, toCityId, PREFERENCE.SAFE);

    if (!fast && !cheap && !safe) {
        return { error: '无法到达' };
    }

    const plans = [];
    if (fast) {
        plans.push(toPlan(1, fast, '⚡ 最快抵达'));
    }
    if (cheap && JSON.stringify(cheap) !== JSON.stringify(fast)) {
        plans.push(toPlan(2, cheap, '💰 最省金币 +1 Clue'));
    }
    if (safe && JSON.stringify(safe) !== JSON.stringify(fast) && JSON.stringify(safe) !== JSON.stringify(cheap)) {
        plans.push(toPlan(3, safe, '🛡 最低风险'));
    }
    return { plans };
}
