/**
 * S4 Travel 接口封装 (占位, 待后端 S4 实现)
 * @author make java
 * @since 2026-05-01
 */
import { HttpClient } from './HttpClient';
import { TripPlanVO, TripVO } from './types';

export interface TripPlanQuery {
    fromCityId: number;
    toCityId: number;
    teamId: number;
    preference: 1 | 2 | 3;
}

export interface TripBookQuery {
    planNo: number;
    fromCityId: number;
    toCityId: number;
    teamId: number;
    missionId?: number;
}

export class TravelApi {

    static planTrip(query: TripPlanQuery): Promise<TripPlanVO[]> {
        return HttpClient.post<TripPlanVO[]>('/travel/plan', query);
    }

    static bookTrip(query: TripBookQuery): Promise<TripVO> {
        return HttpClient.post<TripVO>('/travel/book', query);
    }

    static cancelTrip(tripId: number): Promise<{ refundCoin: number; feeCoin: number }> {
        return HttpClient.post(`/travel/trip/${tripId}/cancel`, {});
    }
}
