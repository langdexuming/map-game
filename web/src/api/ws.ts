/**
 * 路上事件 WebSocket 订阅
 */
import type {TripEventPushVO} from './types';

export type TripEventHandler = (event: TripEventPushVO) => void;

function wsBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_WS_BASE_URL;
  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv.replace(/\/$/, '');
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}`;
}

/**
 * 订阅玩家路上事件推送
 * @param playerId 玩家ID
 * @param onEvent 事件回调
 * @returns 关闭连接的函数
 */
export function connectTripEvents(playerId: number, onEvent: TripEventHandler): () => void {
  const url = `${wsBaseUrl()}/api/ws/trip?playerId=${playerId}`;
  let socket: WebSocket | null = null;
  let closed = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (closed) {
      return;
    }
    socket = new WebSocket(url);
    socket.onmessage = (msg) => {
      try {
        const data = JSON.parse(String(msg.data)) as TripEventPushVO;
        onEvent(data);
      } catch {
        // ignore malformed
      }
    };
    socket.onclose = () => {
      if (!closed) {
        retryTimer = setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return () => {
    closed = true;
    if (retryTimer != null) {
      clearTimeout(retryTimer);
    }
    socket?.close();
  };
}
