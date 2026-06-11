/**
 * 护照接口
 */
import {getJson, postJson} from './http';
import type {PassportVisaPurchaseQuery, PassportVO} from './types';

export function getPassport(playerId: number): Promise<PassportVO> {
  return getJson<PassportVO>(`/passport/${playerId}`);
}

export function purchaseVisa(query: PassportVisaPurchaseQuery): Promise<PassportVO> {
  return postJson<PassportVO>('/passport/visa', query);
}
