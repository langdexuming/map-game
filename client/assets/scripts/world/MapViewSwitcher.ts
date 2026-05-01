/**
 * S1 · MapViewSwitcher 4 个视图按钮的互斥控制
 * 挂在 MapViews 父节点; 子节点是 4 个 Button
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Button, Color, Component, Sprite } from 'cc';
import { MapViewType } from '../api/types';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('MapViewSwitcher')
export class MapViewSwitcher extends Component {

    @property(Button)
    explorerBtn: Button = null!;

    @property(Button)
    resourceBtn: Button = null!;

    @property(Button)
    teamBtn: Button = null!;

    @property(Button)
    travelBtn: Button = null!;

    start(): void {
        this.explorerBtn.node.on('click', () => this.choose(MapViewType.EXPLORER), this);
        this.resourceBtn.node.on('click', () => this.choose(MapViewType.RESOURCE), this);
        this.teamBtn.node.on('click', () => this.choose(MapViewType.TEAM), this);
        this.travelBtn.node.on('click', () => this.choose(MapViewType.TRAVEL), this);
        this.choose(MapViewType.EXPLORER);
    }

    private choose(view: MapViewType): void {
        GameStore.switchView(view);
        this.refreshActive(view);
    }

    private refreshActive(active: MapViewType): void {
        const map: Record<string, Button> = {
            EXPLORER: this.explorerBtn,
            RESOURCE: this.resourceBtn,
            TEAM: this.teamBtn,
            TRAVEL: this.travelBtn,
        };
        for (const k of Object.keys(map)) {
            const btn = map[k];
            const sp = btn.node.getComponent(Sprite);
            if (sp) {
                sp.color = k === active ? new Color(255, 215, 102) : Color.WHITE;
            }
        }
    }
}
