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
