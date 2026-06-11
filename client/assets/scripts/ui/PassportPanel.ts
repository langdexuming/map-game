/**
 * 护照收集册面板
 * @author make java
 * @since 2026-06-11
 */
import { _decorator, Component, Label, Node } from 'cc';
import { PassportApi } from '../api/PassportApi';
import { PassportVO } from '../api/types';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('PassportPanel')
export class PassportPanel extends Component {

    @property(Node)
    panel: Node = null!;

    @property(Label)
    mileageLabel: Label = null!;

    @property(Label)
    stampLabel: Label = null!;

    @property(Label)
    visaLabel: Label = null!;

    private readonly playerId = 1;

    start(): void {
        if (this.panel) {
            this.panel.active = false;
        }
    }

    /**
     * 打开护照面板并加载数据
     */
    async open(): Promise<void> {
        if (this.panel) {
            this.panel.active = true;
        }
        try {
            const passport = await PassportApi.getPassport(this.playerId);
            GameStore.setPassport(passport);
            this.render(passport);
        } catch (e) {
            console.warn('[PassportPanel] 加载失败:', e);
            this.mileageLabel.string = '护照加载失败';
        }
    }

    close(): void {
        if (this.panel) {
            this.panel.active = false;
        }
    }

    private render(passport: PassportVO): void {
        const stampCount = Object.values(passport.stamps ?? {}).filter(Boolean).length;
        const visaCount = Object.values(passport.visas ?? {}).filter(Boolean).length;
        this.mileageLabel.string = `里程 ${passport.mileage}${passport.goldenCoating ? ' · 金色涂装' : ''}`;
        this.stampLabel.string = `印章 ${stampCount}/5${passport.globalPass ? ' · 环球通票' : ''}`;
        this.visaLabel.string = `签证 ${visaCount} · 折扣 ${Math.round((passport.ticketDiscount ?? 0) * 100)}%`;
    }
}
