/**
 * S1 World 接口封装
 * @author make java
 * @since 2026-05-01
 */
import { HttpClient } from './HttpClient';
import { MapViewQuery, MapViewVO, RegionVO, WorldVO } from './types';

export class WorldApi {

    static getWorld(worldId: number): Promise<WorldVO> {
        return HttpClient.get<WorldVO>(`/world/${worldId}`);
    }

    static listRegions(worldId: number): Promise<RegionVO[]> {
        return HttpClient.get<RegionVO[]>(`/world/${worldId}/regions`);
    }

    static getMapView(query: MapViewQuery): Promise<MapViewVO> {
        return HttpClient.post<MapViewVO>('/world/view', query);
    }
}
