/**
 * 路上事件弹窗（WebSocket / 回合推送）
 * @author make java
 * @since 2026-06-11
 */
import { _decorator, Component, Label, Node } from 'cc';
import { TripEventPushVO } from '../api/types';
import { EVT, EventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('TripEventDialog')
export class TripEventDialog extends Component {

    @property(Node)
    panel: Node = null!;

    @property(Label)
    titleLabel: Label = null!;

    @property(Label)
    bodyLabel: Label = null!;

    @property(Label)
    diceLabel: Label = null!;

    private pending: TripEventPushVO | null = null;

    start(): void {
        if (this.panel) {
            this.panel.active = false;
        }
        EventBus.on(EVT.TRIP_EVENT, (payload) => this.show(payload as TripEventPushVO));
    }

    show(event: TripEventPushVO): void {
        this.pending = event;
        if (this.panel) {
            this.panel.active = true;
        }
        this.titleLabel.string = event.title;
        this.bodyLabel.string = event.body;
        this.diceLabel.string = `d100 = ${event.d100}`;
    }

    hide(): void {
        this.pending = null;
        if (this.panel) {
            this.panel.active = false;
        }
    }
}
