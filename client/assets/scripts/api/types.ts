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

export interface AgentVO {
    id: number;
    name: string;
    avatar: string;
    agentClass: string;
    hp: number;
    maxHp: number;
    defense: number;
    level: number;
    fatigue: number;
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

export interface TripPlanVO {
    planNo: number;
    vehicleChain: string[];
    totalTurn: number;
    totalPrice: number;
    eventExpect: number;
    bonusDesc: string;
}

export interface TripVO {
    id: number;
    teamId: number;
    status: string;
    startTurn: number;
    arriveTurn: number;
    progressPercent: number;
}
