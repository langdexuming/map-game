/**
 * 全局事件总线 (UI 解耦, WS 推送派发)
 * @author make java
 * @since 2026-05-01
 */
type Listener = (payload?: unknown) => void;

export class EventBus {

    private static listeners: Map<string, Set<Listener>> = new Map();

    static on(event: string, fn: Listener): void {
        if (!EventBus.listeners.has(event)) {
            EventBus.listeners.set(event, new Set());
        }
        EventBus.listeners.get(event)!.add(fn);
    }

    static off(event: string, fn: Listener): void {
        EventBus.listeners.get(event)?.delete(fn);
    }

    static emit(event: string, payload?: unknown): void {
        const set = EventBus.listeners.get(event);
        if (!set) {
            return;
        }
        for (const fn of set) {
            try {
                fn(payload);
            } catch (e) {
                console.error(`[EventBus] ${event} listener error:`, e);
            }
        }
    }
}

export const EVT = {
    NODE_CLICK: 'node-click',
    VIEW_CHANGE: 'view-change',
    TURN_ADVANCE: 'turn-advance',
    MISSION_ACCEPTED: 'mission-accepted',
    MISSION_COMPLETED: 'mission-completed',
    TRIP_BOOKED: 'trip-booked',
    TRIP_EVENT: 'trip-event',
    TRIP_ARRIVED: 'trip-arrived',
    EVENT_POP: 'event-pop',
    BALANCE_CHANGED: 'balance-changed',
} as const;
