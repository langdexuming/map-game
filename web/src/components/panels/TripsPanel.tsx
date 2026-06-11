import type {GameSession} from '../../state/useGameSession';
import {cityLabel} from '../../state/derive';
import {clamp} from '../../map/draw';
import {VEHICLE_ICON} from '../../game/mockData';
import {formatStr} from '../../i18n/strings';

interface Props {
  session: GameSession;
}

export function TripsPanel({session}: Props) {
  const {t, activeTrips, resources, cancelTrip, rescheduleTrip} = session;
  if (activeTrips.length === 0) {
    return <p className="text-[11px] opacity-75">{t.noTrips}</p>;
  }
  return (
    <>
      {activeTrips.map((trip) => {
        const totalTurns = trip.plan.totalTurn + trip.delayTurn;
        const progress = trip.status === 'BOOKED'
          ? 0
          : Math.round((trip.elapsedTurn / Math.max(1, totalTurns)) * 100);
        const waitTurns = Math.max(0, trip.departureTurn - resources.turn);
        return (
          <div key={trip.id} className="game-inset p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-black">
                {formatStr(t.tripRoute, {
                  trip: formatStr(t.tripNo, {n: trip.id}),
                  from: cityLabel(trip.from),
                  to: cityLabel(trip.to),
                })}
              </div>
              <div className="text-[10px] opacity-70">
                {trip.status === 'BOOKED'
                  ? formatStr(t.scheduleNext, {n: waitTurns || trip.scheduleOffset})
                  : trip.status === 'PAUSED'
                    ? t.eventPending
                    : t.resolved}
              </div>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{width: `${clamp(progress, 0, 100)}%`}} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono opacity-75">
              <span>{formatStr(t.turnFraction, {elapsed: trip.elapsedTurn, total: totalTurns})}</span>
              <span>{trip.plan.vehicleChain.map((v) => VEHICLE_ICON[v as keyof typeof VEHICLE_ICON]).join(' ')}</span>
            </div>
            {trip.status === 'BOOKED' ? (
              <div className="flex gap-2">
                <button type="button" className="game-button flex-1 text-[10px]" onClick={() => rescheduleTrip(trip.id, trip.scheduleOffset + 2)}>
                  {t.tripReschedule}
                </button>
                <button type="button" className="game-button flex-1 text-[10px]" onClick={() => cancelTrip(trip.id)}>
                  {t.tripCancel}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
