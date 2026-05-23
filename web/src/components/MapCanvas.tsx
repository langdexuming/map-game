import {Loader2, Lock, Unlock} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {clamp} from '../map/draw';
import {cityLabel} from '../state/derive';
import {formatStr} from '../i18n/strings';

interface Props {
  session: GameSession;
  onCityClick: (cityId: number, anchor: {xPct: number; yPct: number}) => void;
}

export function MapCanvas({session, onCityClick}: Props) {
  const {
    t,
    loading,
    mapView,
    project,
    regionMarkers,
    visibleRoutes,
    highlightedTripSegments,
    activeTripTokens,
    citiesForMap,
    selectedCityId,
    travelFromId,
    travelToId,
    mapBackdropStyle,
  } = session;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={
        mapBackdropStyle ?? {
          background:
            'radial-gradient(ellipse at center, #2a2520 0%, #14110d 70%, #0a0806 100%)',
        }
      }
    >
      {loading && !mapView ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-amber-200">
          <Loader2 className="animate-spin mb-3" size={40} />
          <span className="text-sm font-bold">{t.loading}</span>
        </div>
      ) : null}

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#fde68a" strokeWidth="0.06" strokeOpacity="0.08" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {visibleRoutes.map((route) => (
          <path
            key={route.key}
            d={route.path}
            fill="none"
            stroke={route.color}
            strokeWidth="0.45"
            strokeDasharray={route.dash}
            strokeOpacity="0.75"
            style={route.dash ? {animation: 'anim-route-dash 1.6s linear infinite'} : undefined}
          />
        ))}

        {highlightedTripSegments.map((seg) => (
          <path key={seg.key} d={seg.path} fill="none" stroke={seg.color} strokeWidth="0.9" />
        ))}
      </svg>

      {project
        ? regionMarkers.map((marker, idx) => (
            <div
              key={marker.id}
              className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 anim-fade anim-stagger-${(idx % 3) + 1}`}
              style={{left: `${marker.left}%`, top: `${marker.top}%`}}
            >
              <span className="text-[13px] font-black text-amber-200/12 tracking-widest whitespace-nowrap uppercase">
                {marker.name}
              </span>
            </div>
          ))
        : null}

      {project
        ? citiesForMap.map((city) => {
            const point = project(city.lng, city.lat);
            const active = selectedCityId === city.id;
            const asStart = travelFromId === city.id;
            const asEnd = travelToId === city.id;
            return (
              <button
                key={city.id}
                type="button"
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full"
                style={{left: `${point.xPct}%`, top: `${point.yPct}%`}}
                onClick={() => onCityClick(city.id, point)}
                title={cityLabel(city)}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-[3px] border-amber-50 shadow-xl transition-transform duration-200 hover:scale-110 ${
                    active ? 'bg-amber-400 text-stone-900 ring-4 ring-amber-300/40 anim-pulse-ring' : 'bg-stone-800/95 text-amber-100'
                  } ${asStart ? 'ring-4 ring-emerald-400/50' : ''} ${asEnd ? 'ring-4 ring-rose-400/50' : ''} ${
                    city.unlocked ? '' : 'opacity-60'
                  }`}
                >
                  {city.unlocked ? <Unlock size={16} /> : <Lock size={16} />}
                </span>
                <span
                  className={`mt-1 block text-center text-[10px] font-black px-2 py-0.5 rounded-md shadow whitespace-nowrap max-w-[140px] truncate mx-auto backdrop-blur-sm ${
                    active
                      ? 'bg-amber-400 text-stone-900'
                      : 'bg-black/60 text-amber-100 border border-amber-300/30'
                  }`}
                >
                  {cityLabel(city)}
                </span>
              </button>
            );
          })
        : null}

      {project
        ? activeTripTokens.map((trip) => (
            <div
              key={trip.id}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{left: `${trip.point.xPct}%`, top: `${trip.point.yPct}%`}}
            >
              <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] flex items-center justify-center text-lg">
                {trip.icon}
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-500 text-white border border-rose-300 text-[9px] font-black text-center shadow">
                {formatStr(t.tripProgressPct, {n: clamp(trip.progress, 0, 100)})}
              </div>
            </div>
          ))
        : null}
    </div>
  );
}
