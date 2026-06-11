/**
 * S2 左栏队伍面板
 * @author make java
 * @since 2026-06-11
 */
import { _decorator, Component, Label, Node } from 'cc';
import { AgentApi } from '../api/AgentApi';
import { AgentVO } from '../api/types';
import { EVT, EventBus } from '../core/EventBus';
import { GameStore } from '../core/GameStore';

const { ccclass, property } = _decorator;

@ccclass('LeftTeamPanel')
export class LeftTeamPanel extends Component {

    @property(Label)
    teamSummary: Label = null!;

    @property(Node)
    slotContainer: Node = null!;

    @property([Label])
    slotLabels: Label[] = [];

    private readonly playerId = 1;

    start(): void {
        EventBus.on(EVT.TEAM_CHANGED, () => this.refresh());
        void this.refresh();
    }

    /**
     * 从后端拉取队伍并刷新 UI
     */
    async refresh(): Promise<void> {
        try {
            const agents = await AgentApi.listAgents({ playerId: this.playerId });
            GameStore.setAgents(agents.slice(0, 5));
            this.renderAgents(agents.slice(0, 5));
        } catch (e) {
            console.warn('[LeftTeamPanel] 加载失败:', e);
            this.teamSummary.string = '队伍加载失败';
        }
    }

    private renderAgents(agents: AgentVO[]): void {
        const totalHp = agents.reduce((sum, agent) => sum + (agent.hp ?? 0), 0);
        const totalDef = agents.reduce((sum, agent) => sum + (agent.defense ?? 0), 0);
        this.teamSummary.string = `队伍 HP ${totalHp} · 防御 ${totalDef}`;
        for (let i = 0; i < this.slotLabels.length; i++) {
            const agent = agents[i];
            const label = this.slotLabels[i];
            if (!label) {
                continue;
            }
            if (!agent) {
                label.string = `槽位 ${i + 1} · 空`;
                continue;
            }
            label.string = `${agent.name}\n疲劳 ${agent.fatigue ?? 0} · ${agent.status ?? 'IDLE'}`;
        }
    }
}
