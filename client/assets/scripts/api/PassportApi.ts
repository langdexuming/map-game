/**
 * 护照接口封装
 * @author make java
 * @since 2026-06-11
 */
import { HttpClient } from './HttpClient';
import { PassportVO } from './types';

export interface PassportVisaPurchaseQuery {
    playerId: number;
    regionId: number;
}

export class PassportApi {

    static getPassport(playerId: number): Promise<PassportVO> {
        return HttpClient.get<PassportVO>(`/passport/${playerId}`);
    }

    static purchaseVisa(query: PassportVisaPurchaseQuery): Promise<PassportVO> {
        return HttpClient.post<PassportVO>('/passport/visa', query);
    }
}
