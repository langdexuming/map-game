/**
 * S1 世界地图接口
 */
import {getJson, postJson} from './http';
import type {
  CityLevelUpgradeQuery,
  CityVO,
  MapViewQuery,
  MapViewType,
  MapViewVO,
  RegionVO,
  WorldBootstrapVO,
  WorldHqLevelUpgradeQuery,
  WorldVO,
} from './types';

export function bootstrapWorld(worldId: number, viewType?: MapViewType): Promise<WorldBootstrapVO> {
  const qs = viewType ? `?viewType=${viewType}` : '';
  return getJson<WorldBootstrapVO>(`/world/${worldId}/bootstrap${qs}`);
}

export function getWorld(worldId: number): Promise<WorldVO> {
  return getJson<WorldVO>(`/world/${worldId}`);
}

export function listRegions(worldId: number): Promise<RegionVO[]> {
  return getJson<RegionVO[]>(`/world/${worldId}/regions`);
}

export function getMapView(query: MapViewQuery): Promise<MapViewVO> {
  return postJson<MapViewVO>('/world/view', query);
}

export function upgradeCityLevel(worldId: number, cityId: number, body: CityLevelUpgradeQuery): Promise<CityVO> {
  return postJson<CityVO>(`/world/${worldId}/cities/${cityId}/level`, body);
}

export function advanceWorldTurn(worldId: number): Promise<WorldVO> {
  return postJson<WorldVO>(`/world/${worldId}/turn`, {});
}

export function upgradeWorldHq(worldId: number, body: WorldHqLevelUpgradeQuery): Promise<WorldVO> {
  return postJson<WorldVO>(`/world/${worldId}/hq/level`, body);
}
