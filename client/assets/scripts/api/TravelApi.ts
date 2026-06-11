/**
 * S4 Travel 接口封装
 * @author make java
 * @since 2026-05-01
 */
import { HttpClient } from './HttpClient';
import { TripPlanVO, TripRefundVO, TripVO } from './types';

export interface TripPlanQuery {
    fromCityId: number;
    toCityId: number;
    teamId: number;
    playerId?: number;
    worldId?: number;
    preference?: 1 | 2 | 3;
}

export interface TripBookQuery {
    planNo: number;
    fromCityId: number;
    toCityId: number;
    teamId: number;
    playerId: number;
    leadAgentId?: number;
    missionId?: number;
    worldId?: number;
    departureOffset?: number;
    forceDepart?: boolean;
}

export interface TripRescheduleQuery {
    playerId: number;
    departureOffset: number;
}

export class TravelApi {

    static planTrip(query: TripPlanQuery): Promise<TripPlanVO[]> {
        return HttpClient.post<TripPlanVO[]>('/travel/plan', query);
    }

    static bookTrip(query: TripBookQuery): Promise<TripVO> {
        return HttpClient.post<TripVO>('/travel/book', query);
    }

    static cancelTrip(tripId: number, playerId: number): Promise<TripRefundVO> {
        return HttpClient.post<TripRefundVO>(`/travel/trip/${tripId}/cancel?playerId=${playerId}`, {});
    }

    static rescheduleTrip(tripId: number, query: TripRescheduleQuery): Promise<TripVO> {
        return HttpClient.post<TripVO>(`/travel/trip/${tripId}/reschedule`, query);
    }

    static listActiveTrips(playerId: number): Promise<TripVO[]> {
        return HttpClient.post<TripVO[]>('/travel/in-transit', { playerId });
    }
}
