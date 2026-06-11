/**
 * 后端 VO 与前端游戏状态映射
 */
import type {CityVO} from './types';
import type {Agent} from '../game/agents';
import type {VehicleType} from '../game/mockData';
import type {PassportState} from '../game/passport';
import type {ActiveTrip, TripPlan} from '../game/travel';
import type {AgentVO, PassportVO, TripEventPushVO, TripPlanVO, TripVO} from './types';

export interface SyncedPendingEvent {
  tripId: number;
  title: string;
  body: string;
  eventCode: string;
  d100: number;
  choices: Array<{
    key: string;
    label: string;
    requireCoin?: number;
    effect: {coin?: number; clue?: number; star?: number; fuel?: number; delay?: number; label?: string};
  }>;
}

function mapAgentStatus(status?: string): Agent['status'] {
  if (status === 'IN_TRANSIT') {
    return 'IN_TRANSIT';
  }
  if (status === 'NEED_REST') {
    return 'NEED_REST';
  }
  if (status === 'RESTING') {
    return 'RESTING';
  }
  return 'STANDBY';
}

export function passportVoToState(vo: PassportVO): PassportState {
  const specialStamps: Record<string, boolean> = {};
  for (const key of vo.specialStamps ?? []) {
    specialStamps[key] = true;
  }
  return {
    stamps: vo.stamps ?? {},
    visas: vo.visas ?? {},
    mileage: vo.mileage ?? 0,
    goldenCoating: vo.goldenCoating ?? false,
    specialStamps,
  };
}

export function mergeAgentsFromVo(local: Agent[], remote: AgentVO[]): Agent[] {
  const remoteMap = new Map(remote.map((agent) => [agent.id, agent]));
  return local.map((agent) => {
    const synced = remoteMap.get(agent.id);
    if (!synced) {
      return agent;
    }
    return {
      ...agent,
      fatigue: synced.fatigue ?? agent.fatigue,
      status: mapAgentStatus(synced.status),
      assignedTripId: synced.assignedTripId,
    };
  });
}

export function tripPlanVoToLocal(vo: TripPlanVO): TripPlan {
  const routes = (vo.segments ?? []).map((seg) => ({
    fromCityId: seg.fromCityId,
    toCityId: seg.toCityId,
    vehicleType: seg.vehicleType as VehicleType,
    distance: seg.distance,
    basePrice: seg.price,
    baseTurn: seg.turn,
  }));
  return {
    planNo: vo.planNo,
    routes,
    totalTurn: vo.totalTurn,
    totalPrice: vo.totalPrice,
    fuelCost: vo.fuelCost ?? 0,
    fatigueCost: vo.fatigueCost ?? 0,
    vehicleChain: vo.vehicleChain ?? [],
    eventExpect: vo.eventExpect,
    bonusDesc: vo.bonusDesc,
    planBadge: vo.planBadge ?? '',
    transferCombo: vo.transferCombo ?? false,
    tripleCombo: vo.tripleCombo ?? false,
    riskScore: vo.riskScore ?? 0,
    planStyle: (vo.planStyle ?? 'FAST') as TripPlan['planStyle'],
  };
}

export function tripVoToActiveTrip(vo: TripVO, cityById: Map<number, CityVO>, currentTurn: number): ActiveTrip | null {
  const from = cityById.get(vo.fromCityId);
  const to = cityById.get(vo.toCityId);
  if (!from || !to || !vo.plan) {
    return null;
  }
  const plan = tripPlanVoToLocal(vo.plan);
  const status =
    vo.status === 'IN_TRANSIT' || vo.status === 'BOOKED' || vo.status === 'PAUSED' || vo.status === 'ARRIVED'
      ? vo.status
      : 'BOOKED';
  return {
    id: vo.id,
    from,
    to,
    plan,
    elapsedTurn: vo.elapsedTurn ?? 0,
    delayTurn: vo.delayTurn ?? 0,
    status: status === 'ARRIVED' ? 'ARRIVED' : status,
    departureTurn: vo.departureTurn ?? currentTurn,
    scheduleOffset: vo.scheduleOffset ?? Math.max(0, (vo.departureTurn ?? currentTurn) - currentTurn),
    paidPrice: vo.paidCoin ?? plan.totalPrice,
    leadAgentId: vo.leadAgentId ?? 1,
    forceDepart: false,
  };
}

export function syncActiveTripsFromVo(trips: TripVO[], cityById: Map<number, CityVO>, currentTurn: number): ActiveTrip[] {
  return trips
    .map((trip) => tripVoToActiveTrip(trip, cityById, currentTurn))
    .filter((trip): trip is ActiveTrip => trip != null);
}

export function pendingEventFromPush(push: TripEventPushVO): SyncedPendingEvent {
  return {
    tripId: push.tripId,
    title: push.title,
    body: push.body,
    eventCode: push.eventCode,
    d100: push.d100,
    choices: (push.choices ?? []).map((choice) => ({
      key: choice.key,
      label: choice.label,
      requireCoin: choice.requireCoin,
      effect: {
        coin: choice.effect?.coin,
        clue: choice.effect?.clue,
        star: choice.effect?.star,
        fuel: choice.effect?.fuel,
        delay: choice.effect?.delay,
        label: choice.effect?.label,
      },
    })),
  };
}

export function findPendingEventFromTrips(trips: TripVO[]): SyncedPendingEvent | null {
  for (const trip of trips) {
    if (trip.pendingEvent) {
      return pendingEventFromPush(trip.pendingEvent);
    }
  }
  return null;
}
