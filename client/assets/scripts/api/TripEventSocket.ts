/**
 * 路上事件 WebSocket 客户端
 * @author make java
 * @since 2026-06-11
 */
import { TripEventPushVO } from './types';
import { EVT, EventBus } from '../core/EventBus';
import { HttpClient } from './HttpClient';

export class TripEventSocket {

    private socket: WebSocket | null = null;
    private closed = false;

    /**
     * 连接玩家事件通道
     * @param playerId 玩家ID
     */
    connect(playerId: number): void {
        this.closed = false;
        const base = HttpClient.getBaseUrl().replace(/^http/, 'ws').replace(/\/api$/, '');
        const url = `${base}/api/ws/trip?playerId=${playerId}`;
        this.open(url);
    }

    disconnect(): void {
        this.closed = true;
        this.socket?.close();
        this.socket = null;
    }

    private open(url: string): void {
        if (this.closed) {
            return;
        }
        this.socket = new WebSocket(url);
        this.socket.onmessage = (msg) => {
            try {
                const event = JSON.parse(String(msg.data)) as TripEventPushVO;
                EventBus.emit(EVT.TRIP_EVENT, event);
            } catch (e) {
                console.warn('[TripEventSocket] 消息解析失败:', e);
            }
        };
        this.socket.onclose = () => {
            if (!this.closed) {
                setTimeout(() => this.open(url), 3000);
            }
        };
    }
}
