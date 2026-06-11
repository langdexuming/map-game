/**
 * 与后端 Result / VO / Query 对齐的前端类型
 */

export interface Result<T> {
  code: number;
  message: string;
  data?: T;
}

export type MapViewType = 'EXPLORER' | 'RESOURCE' | 'TEAM' | 'TRAVEL';

export interface WorldVO {
  id: number;
  name: string;
  turnNo: number;
  /** 主基地等级 1-5（在线存档由后端持久化） */
  hqLevel?: number;
}

export interface CityVO {
  id: number;
  name: string;
  level: number;
  lng: number;
  lat: number;
  unlocked: boolean;
}

export interface RegionVO {
  id: number;
  name: string;
  theme: string;
  mapBgUrl?: string;
  cities: CityVO[];
}

export interface MapViewLayerItem {
  layerType: string;
  fromCityId: number;
  toCityId: number;
  payload: string;
}

export interface MapViewVO {
  viewType: MapViewType;
  cities: CityVO[];
  layers: MapViewLayerItem[];
}

export interface MapViewQuery {
  worldId: number;
  viewType: MapViewType;
}

export interface CityLevelUpgradeQuery {
  targetLevel: number;
}

export interface WorldHqLevelUpgradeQuery {
  targetLevel: number;
}

export interface WorldBootstrapVO {
  world: WorldVO;
  regions: RegionVO[];
  mapView: MapViewVO;
}

export interface AgentListQuery {
  playerId: number;
  agentClass?: string;
  minLevel?: number;
}

export interface AgentRestQuery {
  playerId: number;
  atHq?: boolean;
}

export interface AgentVO {
  id: number;
  name: string;
  avatar?: string;
  agentClass: string;
  hp: number;
  maxHp: number;
  defense: number;
  level: number;
  fatigue: number;
  status?: string;
  assignedTripId?: number;
}

export interface RouteSegmentVO {
  routeId: number;
  fromCityId: number;
  toCityId: number;
  vehicleType: string;
  distance: number;
  price: number;
  turn: number;
}

export interface TripPlanVO {
  planNo: number;
  segments: RouteSegmentVO[];
  vehicleChain: string[];
  totalTurn: number;
  totalPrice: number;
  fuelCost: number;
  fatigueCost: number;
  eventExpect: number;
  bonusDesc: string;
  planBadge: string;
  transferCombo?: boolean;
  tripleCombo?: boolean;
  riskScore?: number;
  planStyle?: string;
}

export interface TripPlanQuery {
  fromCityId: number;
  toCityId: number;
  teamId: number;
  playerId?: number;
  worldId?: number;
  preference?: number;
}

export interface TripBookQuery {
  planNo: number;
  fromCityId: number;
  toCityId: number;
  teamId: number;
  playerId: number;
  leadAgentId?: number;
  missionId?: number;
  worldId?: number;
  departureOffset?: number;
  forceDepart?: boolean;
}

export interface TripInTransitQuery {
  playerId: number;
}

export interface TripVO {
  id: number;
  teamId: number;
  playerId: number;
  fromCityId: number;
  toCityId: number;
  status: string;
  startTurn?: number;
  arriveTurn?: number;
  departureTurn?: number;
  elapsedTurn?: number;
  delayTurn?: number;
  paidCoin?: number;
  paidFuel?: number;
  progressPercent?: number;
  scheduleOffset?: number;
  leadAgentId?: number;
  plan?: TripPlanVO;
  pendingEvent?: TripEventPushVO;
}

export interface TripRefundVO {
  refundCoin: number;
  feeCoin: number;
  tripId: number;
}

export interface PassportVisaPurchaseQuery {
  playerId: number;
  regionId: number;
}

export interface PlayerVO {
  id: number;
  name: string;
  coin: number;
  clue: number;
  star: number;
  fuel: number;
  currentTeamId?: number;
}

export interface TripRescheduleQuery {
  playerId: number;
  departureOffset: number;
}

export interface TripEventEffectVO {
  coin?: number;
  clue?: number;
  star?: number;
  fuel?: number;
  delay?: number;
  label?: string;
}

export interface TripEventChoiceVO {
  key: string;
  label: string;
  requireCoin?: number;
  effect: TripEventEffectVO;
}

export interface TripEventPushVO {
  tripId: number;
  eventId: number;
  eventCode: string;
  title: string;
  body: string;
  d100: number;
  choices: TripEventChoiceVO[];
}

export interface TripEventResolveQuery {
  playerId: number;
  choiceKey: string;
}

export interface PassportVO {
  playerId: number;
  mileage: number;
  goldenCoating: boolean;
  stamps: Record<number, boolean>;
  visas: Record<number, boolean>;
  specialStamps: string[];
  globalPass: boolean;
  ticketDiscount: number;
}
