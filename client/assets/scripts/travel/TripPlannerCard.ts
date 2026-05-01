/**
 * ★ S4 行程规划器浮层
 * 监听 NODE_CLICK 事件, 收到第二个点击后弹出 3 套方案卡
 * @author make java
 * @since 2026-05-01
 */
import { _decorator, Component, Label, Node } from 'cc';
import { TravelApi } from '../api/TravelApi';
import { TripPlanVO } from '../api/types';
import { EVT, EventBus } from '../core/EventBus';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('TripPlannerCard')
export class TripPlannerCard extends Component {

    @property(Node)
    panel: Node = null!;

    @property(Label)
    fromLabel: Label = null!;

    @property(Label)
    toLabel: Label = null!;

    @property(Label)
    plansLabel: Label = null!;

    private fromCityId: number | null = null;
    private toCityId: number | null = null;

    start(): void {
        this.panel.active = false;
        EventBus.on(EVT.NODE_CLICK, (id) => this.onNodeClick(id as number));
    }

    private async onNodeClick(cityId: number): Promise<void> {
        if (this.fromCityId === null) {
            this.fromCityId = cityId;
            return;
        }
        if (cityId === this.fromCityId) {
            return;
        }
        this.toCityId = cityId;
        await this.openPlanner();
        this.fromCityId = null;
        this.toCityId = null;
    }

    private async openPlanner(): Promise<void> {
        if (this.fromCityId === null || this.toCityId === null) {
            return;
        }
        try {
            const plans = await TravelApi.planTrip({
                fromCityId: this.fromCityId,
                toCityId: this.toCityId,
                teamId: 1,
                preference: 1,
            });
            this.fromLabel.string = `${GameStore.findCity(this.fromCityId)?.name ?? this.fromCityId}`;
            this.toLabel.string = `${GameStore.findCity(this.toCityId)?.name ?? this.toCityId}`;
            this.plansLabel.string = this.formatPlans(plans);
            this.panel.active = true;
        } catch (e) {
            console.warn('[TripPlanner] 规划失败 (后端 S4 未就绪也属正常):', e);
            this.panel.active = false;
        }
    }

    private formatPlans(plans: TripPlanVO[]): string {
        if (!plans || plans.length === 0) {
            return '暂无可达方案';
        }
        const rows: string[] = [];
        for (const p of plans) {
            rows.push(`Plan ${p.planNo}  ${p.vehicleChain.join('+')}  ${p.totalTurn}回合  ¥${p.totalPrice}  ${p.bonusDesc ?? ''}`);
        }
        return rows.join('\n');
    }
}
