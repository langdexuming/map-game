/**
 * 与后端 VO/Query 一一对应的共享类型
 * @author make java
 * @since 2026-05-01
 */

export interface Result<T> {
    code: number;
    message: string;
    data?: T;
}

export enum MapViewType {
    EXPLORER = 'EXPLORER',
    RESOURCE = 'RESOURCE',
    TEAM = 'TEAM',
    TRAVEL = 'TRAVEL',
}

export interface WorldVO {
    id: number;
    name: string;
    turnNo: number;
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

export interface PlayerVO {
    id: number;
    name: string;
    coin: number;
    clue: number;
    star: number;
    fuel: number;
    currentTeamId?: number;
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

export interface TeamVO {
    id: number;
    name: string;
    members: AgentVO[];
}

export interface MissionBriefVO {
    id: number;
    title: string;
    type: string;
    status: string;
    rewardCoin: number;
    rewardStar: number;
    targetCityName: string;
    expireInTurn: number;
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
    segments?: RouteSegmentVO[];
    vehicleChain: string[];
    totalTurn: number;
    totalPrice: number;
    fuelCost?: number;
    fatigueCost?: number;
    eventExpect: number;
    bonusDesc: string;
    planBadge?: string;
    transferCombo?: boolean;
    tripleCombo?: boolean;
    planStyle?: string;
}

export interface TripVO {
    id: number;
    teamId: number;
    playerId?: number;
    fromCityId?: number;
    toCityId?: number;
    status: string;
    startTurn?: number;
    arriveTurn?: number;
    departureTurn?: number;
    elapsedTurn?: number;
    delayTurn?: number;
    paidCoin?: number;
    progressPercent: number;
    scheduleOffset?: number;
    leadAgentId?: number;
    plan?: TripPlanVO;
}

export interface TripRefundVO {
    refundCoin: number;
    feeCoin: number;
    tripId: number;
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

export interface TripEventPushVO {
    tripId: number;
    eventId: number;
    eventCode: string;
    title: string;
    body: string;
    d100: number;
    choices: TripEventChoiceVO[];
}

export interface TripEventChoiceVO {
    key: string;
    label: string;
    requireCoin?: number;
    effect: {
        coin?: number;
        clue?: number;
        star?: number;
        fuel?: number;
        delay?: number;
        label?: string;
    };
}
