/**
 * 顶部状态栏: Coins / Clues / Stars / Fuel / Day · Turn
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Component, Label } from 'cc';
import { EVT, EventBus } from '../core/EventBus';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('TopStatusBar')
export class TopStatusBar extends Component {

    @property(Label)
    coinLabel: Label = null!;

    @property(Label)
    clueLabel: Label = null!;

    @property(Label)
    starLabel: Label = null!;

    @property(Label)
    fuelLabel: Label = null!;

    @property(Label)
    turnLabel: Label = null!;

    start(): void {
        this.refresh();
        EventBus.on(EVT.TURN_ADVANCE, () => this.refresh());
    }

    private refresh(): void {
        this.coinLabel.string = `${GameStore.coin}`;
        this.clueLabel.string = `${GameStore.clue}`;
        this.starLabel.string = `${GameStore.star}`;
        this.fuelLabel.string = `${GameStore.fuel}`;
        this.turnLabel.string = `Day ${Math.floor((GameStore.world?.turnNo ?? 0) / 10) + 1} · Turn ${GameStore.world?.turnNo ?? 0}`;
    }
}
