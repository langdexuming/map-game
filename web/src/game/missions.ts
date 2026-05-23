import type {CityVO} from '../api/types';

export interface MissionReward {
  coin: number;
  clue: number;
  star: number;
  fuel?: number;
}

export interface MissionPrereq {
  minHqLevel?: number;
  minFromCityLevel?: number;
  minToCityLevel?: number;
  minClue?: number;
  minStar?: number;
}

export interface MissionDef {
  code: string;
  title: string;
  briefing: string;
  reward: MissionReward;
  maxTurns: number;
  /** 接取/展示门槛：当前持有金币低于此值时 UI 提示（仍可按规则完成） */
  minCoin?: number;
  prereq?: MissionPrereq;
  /** 条件全满时的奖励倍率 */
  rewardScaleFull?: number;
  /** 条件不满时的奖励倍率 */
  rewardScalePartial?: number;
}

export interface MissionState extends MissionDef {
  id: number;
  fromCityId: number;
  toCityId: number;
  acceptedTurn: number;
  deadlineTurn: number;
  status: 'OPEN' | 'COMPLETED' | 'FAILED';
}

export interface MissionRuntimeContext {
  hqLevel: number;
  cityLevel: (cityId: number) => number;
  clue: number;
  star: number;
}

export type MissionPrereqGap =
  | {type: 'hq'; required: number; current: number}
  | {type: 'cityFrom'; required: number; current: number}
  | {type: 'cityTo'; required: number; current: number}
  | {type: 'clue'; required: number; current: number}
  | {type: 'star'; required: number; current: number};

const ROUTE_PAIRS: Array<[number, number]> = [
  [1, 2],
  [3, 6],
  [4, 5],
  [2, 6],
  [1, 3],
  [6, 5],
];

const MISSION_LIBRARY: MissionDef[] = [
  {
    code: 'VIP',
    title: 'VIP 护送',
    briefing: '护送重要访客安全抵达目的地。',
    reward: {coin: 320, clue: 24, star: 2},
    maxTurns: 5,
    minCoin: 400,
    prereq: {minHqLevel: 2, minFromCityLevel: 2},
    rewardScaleFull: 1,
    rewardScalePartial: 0.45,
  },
  {
    code: 'TRACE',
    title: '轨迹追踪',
    briefing: '沿既定路线追踪异常行李轨迹。',
    reward: {coin: 160, clue: 38, star: 1},
    maxTurns: 6,
    rewardScaleFull: 1,
    rewardScalePartial: 0.55,
  },
  {
    code: 'CUSTOMS',
    title: '走私拦截',
    briefing: '在口岸前完成拦截并提交证据。',
    reward: {coin: 380, clue: 22, star: 3},
    maxTurns: 5,
    minCoin: 800,
    prereq: {minClue: 720, minStar: 1},
    rewardScaleFull: 1,
    rewardScalePartial: 0.4,
  },
  {
    code: 'WEATHER',
    title: '极端天气补给',
    briefing: '抢在天气恶化前送达补给物资。',
    reward: {coin: 200, clue: 20, star: 2, fuel: 18},
    maxTurns: 4,
    prereq: {minFromCityLevel: 2},
    rewardScaleFull: 1,
    rewardScalePartial: 0.5,
  },
  {
    code: 'BACKPACK',
    title: '背包客挑战',
    briefing: '以低预算完成远途穿越并收集沿途情报。',
    reward: {coin: 120, clue: 48, star: 1},
    maxTurns: 7,
    minCoin: 1200,
    prereq: {minHqLevel: 3},
    rewardScaleFull: 1,
    rewardScalePartial: 0.42,
  },
];

function deterministicIndex(seed: number, length: number): number {
  return Math.abs(seed * 17 + 11) % length;
}

export interface MissionRouteEndpoints {
  fromCityId: number;
  toCityId: number;
}

export function missionPrereqGaps(
  mission: MissionDef,
  endpoints: MissionRouteEndpoints,
  ctx: MissionRuntimeContext,
): MissionPrereqGap[] {
  const p = mission.prereq;
  if (!p) {
    return [];
  }
  const gaps: MissionPrereqGap[] = [];
  if (p.minHqLevel != null && ctx.hqLevel < p.minHqLevel) {
    gaps.push({type: 'hq', required: p.minHqLevel, current: ctx.hqLevel});
  }
  if (p.minFromCityLevel != null && ctx.cityLevel(endpoints.fromCityId) < p.minFromCityLevel) {
    gaps.push({
      type: 'cityFrom',
      required: p.minFromCityLevel,
      current: ctx.cityLevel(endpoints.fromCityId),
    });
  }
  if (p.minToCityLevel != null && ctx.cityLevel(endpoints.toCityId) < p.minToCityLevel) {
    gaps.push({
      type: 'cityTo',
      required: p.minToCityLevel,
      current: ctx.cityLevel(endpoints.toCityId),
    });
  }
  if (p.minClue != null && ctx.clue < p.minClue) {
    gaps.push({type: 'clue', required: p.minClue, current: ctx.clue});
  }
  if (p.minStar != null && ctx.star < p.minStar) {
    gaps.push({type: 'star', required: p.minStar, current: ctx.star});
  }
  return gaps;
}

export function missionPrereqMet(mission: MissionDef, endpoints: MissionRouteEndpoints, ctx: MissionRuntimeContext): boolean {
  return missionPrereqGaps(mission, endpoints, ctx).length === 0;
}

export function scaleMissionReward(base: MissionReward, scale: number): MissionReward {
  return {
    coin: Math.round(base.coin * scale),
    clue: Math.round(base.clue * scale),
    star: Math.max(0, Math.round(base.star * scale)),
    fuel: base.fuel != null ? Math.max(0, Math.round(base.fuel * scale)) : undefined,
  };
}

export function computeMissionPayout(mission: MissionState, ctx: MissionRuntimeContext): {
  reward: MissionReward;
  tier: 'full' | 'partial';
} {
  const full = missionPrereqMet(
    mission,
    {fromCityId: mission.fromCityId, toCityId: mission.toCityId},
    ctx,
  );
  const scale = full ? (mission.rewardScaleFull ?? 1) : (mission.rewardScalePartial ?? 0.4);
  return {
    reward: scaleMissionReward(mission.reward, scale),
    tier: full ? 'full' : 'partial',
  };
}

export function createMissionSet(cities: CityVO[], acceptedTurn: number, startId = 1): MissionState[] {
  const missions: MissionState[] = [];
  const ordered = [...cities].sort((a, b) => a.id - b.id);

  for (let index = 0; index < 3; index += 1) {
    const [fromId, toId] = ROUTE_PAIRS[index];
    const fallbackFrom = ordered[index % ordered.length];
    const fallbackTo = ordered[(index + 1) % ordered.length];
    const fromCity = ordered.find((city) => city.id === fromId) ?? fallbackFrom;
    const toCity = ordered.find((city) => city.id === toId) ?? fallbackTo;
    const def = MISSION_LIBRARY[deterministicIndex(startId + index, MISSION_LIBRARY.length)];
    missions.push({
      ...def,
      id: startId + index,
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      acceptedTurn,
      deadlineTurn: acceptedTurn + def.maxTurns,
      status: 'OPEN',
    });
  }

  return missions;
}

export function createMissionBatch(
  cities: CityVO[],
  acceptedTurn: number,
  startId: number,
  count = 1,
  excludeRouteKeys: string[] = [],
): MissionState[] {
  const ordered = [...cities].sort((a, b) => a.id - b.id);
  const exclude = new Set(excludeRouteKeys);
  const missions: MissionState[] = [];
  let cursor = 0;

  while (missions.length < count && cursor < ROUTE_PAIRS.length * 2) {
    const pairIndex = (startId + cursor) % ROUTE_PAIRS.length;
    const [fromId, toId] = ROUTE_PAIRS[pairIndex];
    const routeKey = `${fromId}-${toId}`;
    cursor += 1;
    if (exclude.has(routeKey)) {
      continue;
    }
    const fallbackFrom = ordered[cursor % ordered.length];
    const fallbackTo = ordered[(cursor + 1) % ordered.length];
    const fromCity = ordered.find((city) => city.id === fromId) ?? fallbackFrom;
    const toCity = ordered.find((city) => city.id === toId) ?? fallbackTo;
    const def = MISSION_LIBRARY[deterministicIndex(startId + cursor, MISSION_LIBRARY.length)];
    missions.push({
      ...def,
      id: startId + missions.length,
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      acceptedTurn,
      deadlineTurn: acceptedTurn + def.maxTurns,
      status: 'OPEN',
    });
    exclude.add(routeKey);
  }

  return missions;
}

export function findMissionCities(mission: MissionState, cities: CityVO[]): {from?: CityVO; to?: CityVO} {
  return {
    from: cities.find((city) => city.id === mission.fromCityId),
    to: cities.find((city) => city.id === mission.toCityId),
  };
}
