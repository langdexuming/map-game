/**
 * S1 · NodeSprite 单个城市节点
 * 显示头像/名字, 处理 hover 和 click
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Color, Component, EventTouch, Label, Sprite } from 'cc';
import { CityVO } from '../api/types';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('NodeSprite')
export class NodeSprite extends Component {

    @property(Sprite)
    icon: Sprite = null!;

    @property(Label)
    nameLabel: Label = null!;

    private city: CityVO | null = null;

    bind(city: CityVO): void {
        this.city = city;
        this.nameLabel.string = city.name;
        this.icon.color = city.unlocked ? Color.WHITE : Color.GRAY;
        this.scheduleOnce(() => this.bindTouch(), 0);
    }

    private bindTouch(): void {
        this.node.on(Node.EventType.TOUCH_END, (_e: EventTouch) => this.onClick(), this);
    }

    private onClick(): void {
        if (!this.city) {
            return;
        }
        GameStore.selectCity(this.city.id);
    }
}
