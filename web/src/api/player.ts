/**
 * 玩家资源接口
 */
import {getJson} from './http';
import type {PlayerVO} from './types';

export function getPlayer(playerId: number): Promise<PlayerVO> {
  return getJson<PlayerVO>(`/player/${playerId}`);
}
