/**
 * S1 · MapLayer 地图图层
 * 负责把城市坐标映射到屏幕, 创建 NodeSprite 子节点, 切换视图时调用对应 Renderer
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { CityVO, MapViewVO } from '../api/types';
import { ExplorerRenderer } from './renderers/ExplorerRenderer';
import { MapViewRenderer } from './renderers/MapViewRenderer';
import { ResourceRenderer } from './renderers/ResourceRenderer';
import { TeamRenderer } from './renderers/TeamRenderer';
import { TravelRenderer } from './renderers/TravelRenderer';
import { NodeSprite } from './NodeSprite';

const { ccclass, property } = _decorator;

@ccclass('MapLayer')
export class MapLayer extends Component {

    @property(Prefab)
    nodeSpritePrefab: Prefab = null!;

    @property(Node)
    nodeContainer: Node = null!;

    @property(Node)
    routeContainer: Node = null!;

    private spriteByCityId: Map<number, NodeSprite> = new Map();

    private renderers: Record<string, MapViewRenderer> = {
        EXPLORER: new ExplorerRenderer(),
        RESOURCE: new ResourceRenderer(),
        TEAM: new TeamRenderer(),
        TRAVEL: new TravelRenderer(),
    };

    renderAll(cities: CityVO[]): void {
        this.nodeContainer.removeAllChildren();
        this.spriteByCityId.clear();
        for (const c of cities) {
            const node = instantiate(this.nodeSpritePrefab);
            node.setPosition(this.lngLatToScreen(c.lng, c.lat));
            this.nodeContainer.addChild(node);
            const sprite = node.getComponent(NodeSprite)!;
            sprite.bind(c);
            this.spriteByCityId.set(c.id, sprite);
        }
    }

    applyView(vo: MapViewVO): void {
        const r = this.renderers[vo.viewType];
        if (!r) {
            return;
        }
        r.render(this.nodeContainer, this.routeContainer, vo);
    }

    /**
     * 经纬度 -> 屏幕坐标
     * 简易等距投影, 后续接真实底图时可改 Mercator
     */
    private lngLatToScreen(lng: number, lat: number): Vec3 {
        const x = lng * 8;
        const y = lat * 8;
        return new Vec3(x, y, 0);
    }
}
