/**
 * S4 出行接口
 */
import {postJson} from './http';
import type {
  TripBookQuery,
  TripInTransitQuery,
  TripPlanQuery,
  TripPlanVO,
  TripRefundVO,
  TripVO,
} from './types';

export function planTrip(query: TripPlanQuery): Promise<TripPlanVO[]> {
  return postJson<TripPlanVO[]>('/travel/plan', query);
}

export function bookTrip(query: TripBookQuery): Promise<TripVO> {
  return postJson<TripVO>('/travel/book', query);
}

export function cancelTrip(tripId: number, playerId: number): Promise<TripRefundVO> {
  return postJson<TripRefundVO>(`/travel/trip/${tripId}/cancel?playerId=${playerId}`, {});
}

export function listActiveTrips(query: TripInTransitQuery): Promise<TripVO[]> {
  return postJson<TripVO[]>('/travel/in-transit', query);
}
