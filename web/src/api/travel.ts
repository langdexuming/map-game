/**
 * S4 出行接口
 */
import {postJson} from './http';
import {getJson} from './http';
import type {
  TripBookQuery,
  TripEventPushVO,
  TripEventResolveQuery,
  TripInTransitQuery,
  TripPlanQuery,
  TripPlanVO,
  TripRefundVO,
  TripRescheduleQuery,
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

export function rescheduleTrip(tripId: number, body: TripRescheduleQuery): Promise<TripVO> {
  return postJson<TripVO>(`/travel/trip/${tripId}/reschedule`, body);
}

export function resolveTripEvent(tripId: number, body: TripEventResolveQuery): Promise<TripVO> {
  return postJson<TripVO>(`/travel/trip/${tripId}/resolve-event`, body);
}

export function listPendingEvents(playerId: number): Promise<TripEventPushVO[]> {
  return getJson<TripEventPushVO[]>(`/travel/pending-events/${playerId}`);
}
