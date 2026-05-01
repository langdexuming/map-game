/**
 * 全局游戏状态 (轻量响应式, 不引第三方)
 * @author make java
 * @since 2026-05-01
 */
import { CityVO, MapViewType, RegionVO, WorldVO } from '../api/types';
import { EVT, EventBus } from './EventBus';

class GameStoreImpl {

    worldId: number = 1;
    world: WorldVO | null = null;
    regions: RegionVO[] = [];
    selectedCityId: number | null = null;
    currentView: MapViewType = MapViewType.EXPLORER;

    coin: number = 0;
    clue: number = 0;
    star: number = 0;
    fuel: number = 0;

    setWorld(w: WorldVO): void {
        this.world = w;
    }

    setRegions(rs: RegionVO[]): void {
        this.regions = rs;
    }

    allCities(): CityVO[] {
        const out: CityVO[] = [];
        for (const r of this.regions) {
            for (const c of r.cities) {
                out.push(c);
            }
        }
        return out;
    }

    findCity(cityId: number): CityVO | undefined {
        return this.allCities().find(c => c.id === cityId);
    }

    selectCity(cityId: number | null): void {
        this.selectedCityId = cityId;
        EventBus.emit(EVT.NODE_CLICK, cityId);
    }

    switchView(v: MapViewType): void {
        this.currentView = v;
        EventBus.emit(EVT.VIEW_CHANGE, v);
    }
}

export const GameStore = new GameStoreImpl();
