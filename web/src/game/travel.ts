import type {CityVO} from '../api/types';
import {calcTripFatigue} from './fatigue';
import {
  cityById,
  MOCK_ROUTES,
  TRIP_EVENTS,
  type RouteDef,
  type TripEffect,
  type TripEventChoice,
  type TripEventDef,
  VEHICLE_RISK,
} from './mockData';
import {regionRequiresVisa} from './passport';

export interface TravelUnlockContext {
  hqLevel: number;
  cityLevel: (cityId: number) => number;
  regionIdOfCity?: (cityId: number) => number | undefined;
  hasVisa?: (regionId: number) => boolean;
}

export interface TripPlan {
  planNo: number;
  routes: RouteDef[];
  totalTurn: number;
  totalPrice: number;
  fuelCost: number;
  fatigueCost: number;
  vehicleChain: string[];
  eventExpect: number;
  bonusDesc: string;
  planBadge: string;
  transferCombo: boolean;
  tripleCombo: boolean;
  /** 相对无倍率航线的风险加权，用于 UI 提示 */
  riskScore: number;
  planStyle: Preference;
}

export interface PlannedTripResult {
  error?: string;
  plans?: TripPlan[];
}

export interface ActiveTrip {
  id: number;
  from: CityVO;
  to: CityVO;
  plan: TripPlan;
  elapsedTurn: number;
  delayTurn: number;
  status: 'BOOKED' | 'IN_TRANSIT' | 'ARRIVED' | 'PAUSED';
  departureTurn: number;
  scheduleOffset: number;
  paidPrice: number;
  lastEventCode?: string;
  d100Roll?: number;
  leadAgentId: number;
  forceDepart?: boolean;
}

export interface TriggeredEvent {
  event: TripEventDef;
  tripId: number;
}

type Preference = 'FAST' | 'CHEAP' | 'SAFE';

export function routeUnlocked(route: RouteDef, ctx: TravelUnlockContext): boolean {
  if (route.requiresHqLevel != null && ctx.hqLevel < route.requiresHqLevel) {
    return false;
  }
  if (route.requiresFromCityLevel != null && ctx.cityLevel(route.fromCityId) < route.requiresFromCityLevel) {
    return false;
  }
  if (route.requiresToCityLevel != null && ctx.cityLevel(route.toCityId) < route.requiresToCityLevel) {
    return false;
  }
  if (ctx.regionIdOfCity && ctx.hasVisa) {
    const destRegionId = ctx.regionIdOfCity(route.toCityId);
    if (destRegionId != null && regionRequiresVisa(destRegionId) && !ctx.hasVisa(destRegionId)) {
      return false;
    }
  }
  return true;
}

export function effectiveRouteTurn(route: RouteDef): number {
  return Math.max(1, Math.round(route.baseTurn * (route.turnScale ?? 1)));
}

export function effectiveRoutePrice(route: RouteDef): number {
  return Math.max(0, Math.round(route.basePrice * (route.priceScale ?? 1)));
}

export function effectiveRouteRisk(route: RouteDef): number {
  return VEHICLE_RISK[route.vehicleType] * (route.riskScale ?? 1);
}

function buildGraph(ctx: TravelUnlockContext): Map<number, RouteDef[]> {
  const graph = new Map<number, RouteDef[]>();
  for (const route of MOCK_ROUTES) {
    if (!routeUnlocked(route, ctx)) {
      continue;
    }
    const bucket = graph.get(route.fromCityId) ?? [];
    bucket.push(route);
    graph.set(route.fromCityId, bucket);
  }
  return graph;
}

function buildGraphAll(): Map<number, RouteDef[]> {
  const graph = new Map<number, RouteDef[]>();
  for (const route of MOCK_ROUTES) {
    const bucket = graph.get(route.fromCityId) ?? [];
    bucket.push(route);
    graph.set(route.fromCityId, bucket);
  }
  return graph;
}

function bfsReachable(fromCityId: number, toCityId: number, graph: Map<number, RouteDef[]>): boolean {
  const queue: number[] = [fromCityId];
  const seen = new Set<number>(queue);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toCityId) {
      return true;
    }
    for (const route of graph.get(current) ?? []) {
      if (!seen.has(route.toCityId)) {
        seen.add(route.toCityId);
        queue.push(route.toCityId);
      }
    }
  }
  return false;
}

export function explainTravelFailure(
  fromCityId: number,
  toCityId: number,
  ctx: TravelUnlockContext,
): string {
  const strictGraph = buildGraph(ctx);
  const looseGraph = buildGraphAll();
  if (!bfsReachable(fromCityId, toCityId, looseGraph)) {
    return '当前没有可达路线（图论断连）';
  }
  if (!bfsReachable(fromCityId, toCityId, strictGraph)) {
    return '存在航线但被设施等级或主基地权限锁定：升级主基地、提升相关城市等级后再试';
  }
  return '规划失败';
}

function routeWeight(route: RouteDef, preference: Preference): number {
  if (preference === 'FAST') {
    return effectiveRouteTurn(route);
  }
  if (preference === 'CHEAP') {
    return effectiveRoutePrice(route) + effectiveRouteTurn(route) * 0.01;
  }
  return Math.round(effectiveRouteRisk(route) * 100) + effectiveRouteTurn(route) * 0.1;
}

function dijkstra(
  fromCityId: number,
  toCityId: number,
  preference: Preference,
  ctx: TravelUnlockContext,
): RouteDef[] | null {
  const graph = buildGraph(ctx);
  const cityIds = Array.from(new Set(MOCK_ROUTES.flatMap((route) => [route.fromCityId, route.toCityId])));
  const dist = new Map<number, number>(cityIds.map((id) => [id, Number.POSITIVE_INFINITY]));
  const prev = new Map<number, number>();
  const prevRoute = new Map<number, RouteDef>();
  const visited = new Set<number>();

  dist.set(fromCityId, 0);

  while (visited.size < cityIds.length) {
    let nextCity: number | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const id of cityIds) {
      const score = dist.get(id) ?? Number.POSITIVE_INFINITY;
      if (!visited.has(id) && score < best) {
        best = score;
        nextCity = id;
      }
    }
    if (nextCity == null || best === Number.POSITIVE_INFINITY) {
      break;
    }
    if (nextCity === toCityId) {
      break;
    }
    visited.add(nextCity);
    for (const route of graph.get(nextCity) ?? []) {
      const score = best + routeWeight(route, preference);
      if (score < (dist.get(route.toCityId) ?? Number.POSITIVE_INFINITY)) {
        dist.set(route.toCityId, score);
        prev.set(route.toCityId, nextCity);
        prevRoute.set(route.toCityId, route);
      }
    }
  }

  if ((dist.get(toCityId) ?? Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY) {
    return null;
  }

  const routes: RouteDef[] = [];
  let cursor = toCityId;
  while (cursor !== fromCityId) {
    const route = prevRoute.get(cursor);
    const prevCity = prev.get(cursor);
    if (!route || prevCity == null) {
      return null;
    }
    routes.unshift(route);
    cursor = prevCity;
  }
  return routes;
}

function buildPlan(
  planNo: number,
  routes: RouteDef[],
  bonusDesc: string,
  planBadge: string,
  priceDiscount: number,
  planStyle: Preference,
): TripPlan {
  const totalTurn = routes.reduce((sum, route) => sum + effectiveRouteTurn(route), 0);
  const rawPrice = routes.reduce((sum, route) => sum + effectiveRoutePrice(route), 0);
  const discount = Math.min(0.35, Math.max(0, priceDiscount));
  const totalPrice = Math.max(0, Math.round(rawPrice * (1 - discount)));
  const fuelCost = routes.reduce((sum, route) => sum + (route.vehicleType === 'FOOT' ? 0 : 10), 0);
  const vehicleChain = routes.map((route) => route.vehicleType);
  const uniqueVehicles = new Set(vehicleChain);
  const riskScore = Math.round(routes.reduce((sum, route) => sum + effectiveRouteRisk(route), 0) * 100);
  return {
    planNo,
    routes,
    totalTurn,
    totalPrice,
    fuelCost,
    fatigueCost: calcTripFatigue(vehicleChain),
    vehicleChain,
    eventExpect: Math.max(1, Math.round(totalTurn * 0.25)),
    bonusDesc,
    planBadge,
    transferCombo: uniqueVehicles.size >= 2,
    tripleCombo: uniqueVehicles.size >= 3,
    riskScore,
    planStyle,
  };
}

export interface PlanTripOptions {
  priceDiscount?: number;
  unlock?: TravelUnlockContext;
}

export function planTrip(
  fromCityId: number,
  toCityId: number,
  options?: PlanTripOptions,
): PlannedTripResult {
  if (fromCityId === toCityId) {
    return {error: '起点和终点不能相同'};
  }
  if (!cityById(fromCityId) || !cityById(toCityId)) {
    return {error: '城市不存在'};
  }

  const priceDiscount = options?.priceDiscount ?? 0;
  const ctx: TravelUnlockContext =
    options?.unlock ?? {
      hqLevel: 1,
      cityLevel: () => 1,
    };

  const fast = dijkstra(fromCityId, toCityId, 'FAST', ctx);
  const cheap = dijkstra(fromCityId, toCityId, 'CHEAP', ctx);
  const safe = dijkstra(fromCityId, toCityId, 'SAFE', ctx);

  if (!fast && !cheap && !safe) {
    return {error: explainTravelFailure(fromCityId, toCityId, ctx)};
  }

  const seen = new Set<string>();
  const plans: TripPlan[] = [];
  const candidates: Array<[RouteDef[] | null, string, string, Preference]> = [
    [fast, '直飞特快 · 2 回合直达', '最快', 'FAST'],
    [cheap, '联运方案 · 线索 +1 · 换乘奖励', '最省', 'CHEAP'],
    [safe, '隐秘小路 · 免费 · 发现率↑', '最稳', 'SAFE'],
  ];

  for (const [routeList, bonusDesc, planBadge, planStyle] of candidates) {
    if (!routeList) {
      continue;
    }
    const signature = routeList.map((route) => `${route.fromCityId}-${route.toCityId}-${route.vehicleType}`).join('|');
    if (seen.has(signature)) {
      continue;
    }
    seen.add(signature);
    plans.push(buildPlan(plans.length + 1, routeList, bonusDesc, planBadge, priceDiscount, planStyle));
  }

  return {plans};
}

export function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function pickTripEventByD100(d100: number): TripEventDef {
  if (d100 <= 25) {
    return TRIP_EVENTS.find((event) => event.code === 'NONE') ?? TRIP_EVENTS[0];
  }
  if (d100 <= 50) {
    return TRIP_EVENTS.find((event) => event.code === 'CLUE_FOUND') ?? TRIP_EVENTS[0];
  }
  if (d100 <= 70) {
    return TRIP_EVENTS.find((event) => event.code === 'TROUBLE') ?? TRIP_EVENTS[0];
  }
  if (d100 <= 85) {
    return TRIP_EVENTS.find((event) => event.code === 'STORM') ?? TRIP_EVENTS[0];
  }
  if (d100 <= 95) {
    return TRIP_EVENTS.find((event) => event.code === 'PIRATE') ?? TRIP_EVENTS[0];
  }
  return TRIP_EVENTS.find((event) => event.code === 'HIDDEN') ?? TRIP_EVENTS[0];
}

export function pickRandomTripEvent(): {event: TripEventDef; d100: number} {
  const d100 = rollD100();
  return {event: pickTripEventByD100(d100), d100};
}

export function countUniqueVehicles(plan: TripPlan): number {
  return new Set(plan.vehicleChain).size;
}

export function applyTripEffect(base: TripEffect, effect: TripEffect): TripEffect {
  return {
    coin: (base.coin ?? 0) + (effect.coin ?? 0),
    clue: (base.clue ?? 0) + (effect.clue ?? 0),
    star: (base.star ?? 0) + (effect.star ?? 0),
    fuel: (base.fuel ?? 0) + (effect.fuel ?? 0),
    delay: (base.delay ?? 0) + (effect.delay ?? 0),
  };
}

export function formatChoice(choice: TripEventChoice): string {
  return choice.effect.label ?? choice.label;
}
