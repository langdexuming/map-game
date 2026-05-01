/**
 * S1 · WorldScene 主场景脚本
 * 挂在 Scene 根节点; 负责拉数据、组装图层、监听视图切换
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Component, Node } from 'cc';
import { WorldApi } from '../api/WorldApi';
import { MapViewType } from '../api/types';
import { EVT, EventBus } from '../core/EventBus';
import { GameStore } from '../core/GameStore';
import { MapLayer } from './MapLayer';

const { ccclass, property } = _decorator;

@ccclass('WorldScene')
export class WorldScene extends Component {

    @property(MapLayer)
    mapLayer: MapLayer = null!;

    async start(): Promise<void> {
        try {
            const world = await WorldApi.getWorld(GameStore.worldId);
            GameStore.setWorld(world);
            const regions = await WorldApi.listRegions(GameStore.worldId);
            GameStore.setRegions(regions);
            this.mapLayer.renderAll(GameStore.allCities());
        } catch (e) {
            console.error('[WorldScene] 初始化失败:', e);
        }

        EventBus.on(EVT.VIEW_CHANGE, (v) => this.onViewChange(v as MapViewType));
        EventBus.on(EVT.NODE_CLICK, (id) => console.log('[WorldScene] node click', id));
    }

    private async onViewChange(view: MapViewType): Promise<void> {
        try {
            const vo = await WorldApi.getMapView({ worldId: GameStore.worldId, viewType: view });
            this.mapLayer.applyView(vo);
        } catch (e) {
            console.error('[WorldScene] 切换视图失败:', e);
        }
    }
}
