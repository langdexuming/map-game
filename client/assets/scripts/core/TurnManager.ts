/**
 * 回合管理器 (前端按钮触发 / WS 回合广播驱动)
 * @author make java
 * @since 2026-05-01
 */
import { EVT, EventBus } from './EventBus';
import { GameStore } from './GameStore';

export class TurnManager {

    /**
     * 推进 1 回合 (本地立即更新, 后端持久化由 server 调度)
     */
    static advance(): void {
        if (!GameStore.world) {
            return;
        }
        GameStore.world.turnNo += 1;
        EventBus.emit(EVT.TURN_ADVANCE, GameStore.world.turnNo);
    }

    static currentTurn(): number {
        return GameStore.world?.turnNo ?? 0;
    }
}
