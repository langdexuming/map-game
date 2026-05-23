import {Coins, Compass, Droplet, Loader2, RefreshCw, Sparkles, Star, StepForward, Map as MapIcon} from 'lucide-react';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import type {MapViewType} from '../api/types';
import type {GameSession} from '../state/useGameSession';
import {displayWorldName} from '../i18n/zhDisplay';
import {formatStr, type Strings} from '../i18n/strings';

interface Props {
  session: GameSession;
}

type BumpKey = 'coin' | 'clue' | 'star' | 'fuel';
type BumpMap = Partial<Record<BumpKey, 'up' | 'down'>>;

const VIEW_OPTIONS: {type: MapViewType; key: keyof Strings}[] = [
  {type: 'TRAVEL', key: 'travel'},
  {type: 'EXPLORER', key: 'explorer'},
  {type: 'RESOURCE', key: 'resource'},
  {type: 'TEAM', key: 'team'},
];

export function TopHud({session}: Props) {
  const {t, world, resources, fuelCap, loading, advanceTurnBusy, usingFallback, viewType, reloadAll, advanceTurn, switchView} =
    session;
  const [viewOpen, setViewOpen] = useState(false);

  const prevRef = useRef<Record<BumpKey, number>>({coin: 0, clue: 0, star: 0, fuel: 0});
  const [bump, setBump] = useState<BumpMap>({});

  useEffect(() => {
    const next: BumpMap = {};
    (['coin', 'clue', 'star', 'fuel'] as const).forEach((k) => {
      const prev = prevRef.current[k];
      const curr = resources[k];
      if (prev !== 0 && curr !== prev) {
        next[k] = curr > prev ? 'up' : 'down';
      }
      prevRef.current[k] = curr;
    });
    if (Object.keys(next).length === 0) return;
    setBump(next);
    const tid = setTimeout(() => setBump({}), 700);
    return () => clearTimeout(tid);
  }, [resources.coin, resources.clue, resources.star, resources.fuel]);

  const resources_: {icon: ReactNode; value: string | number; label: string; tint: string; bumpKey: BumpKey}[] = [
    {icon: <Coins size={14} />, value: resources.coin, label: t.labelCoins, tint: 'text-amber-200', bumpKey: 'coin'},
    {icon: <Sparkles size={14} />, value: resources.clue, label: t.labelClues, tint: 'text-sky-200', bumpKey: 'clue'},
    {icon: <Star size={14} />, value: resources.star, label: t.labelStars, tint: 'text-violet-200', bumpKey: 'star'},
    {icon: <Droplet size={14} />, value: `${resources.fuel}/${fuelCap}`, label: t.fuel, tint: 'text-emerald-200', bumpKey: 'fuel'},
  ];

  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex items-center gap-3 pointer-events-none anim-fade">
      <div className="hud-chip pointer-events-auto !py-1.5 !px-3">
        <Compass size={16} className="text-amber-300" />
        <span className="text-amber-100 text-sm font-black tracking-wide">
          {world ? displayWorldName(world.name) : t.emDash}
        </span>
        <span className="text-amber-300/70 text-[11px] ml-1">{formatStr(t.turnNth, {n: resources.turn})}</span>
        {usingFallback ? (
          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/30 text-amber-200 border border-amber-300/40 anim-pulse-ring">
            {t.offlineMode}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5 pointer-events-auto">
        {resources_.map((card) => {
          const bumpClass = bump[card.bumpKey] === 'up' ? 'anim-bump-up' : bump[card.bumpKey] === 'down' ? 'anim-bump-down' : '';
          return (
            <div key={card.label} className="hud-chip" title={card.label}>
              <span className={card.tint}>{card.icon}</span>
              <span className={`text-amber-50 inline-block ${bumpClass}`}>{card.value}</span>
            </div>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-1.5 pointer-events-auto relative">
        <button
          type="button"
          className="hud-pill"
          title={t.mapViews}
          data-active={viewOpen ? 'true' : 'false'}
          onClick={() => setViewOpen((v) => !v)}
        >
          <MapIcon size={18} />
        </button>
        {viewOpen ? (
          <div className="absolute top-12 right-0 flex flex-col gap-1 p-1.5 rounded-lg bg-black/75 border border-amber-300/30 backdrop-blur-md shadow-xl anim-scale-in origin-top-right">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  switchView(opt.type);
                  setViewOpen(false);
                }}
                className={`px-3 py-1.5 rounded text-xs font-black text-left transition-colors ${
                  viewType === opt.type ? 'bg-amber-400 text-stone-900' : 'text-amber-100 hover:bg-amber-500/20'
                }`}
              >
                {t[opt.key]}
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void reloadAll()}
          disabled={loading}
          className="hud-pill"
          title={t.refresh}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        </button>

        <button
          type="button"
          onClick={() => void advanceTurn()}
          disabled={loading || advanceTurnBusy}
          className="hud-pill !w-auto !px-3 gap-2 disabled:opacity-50"
          title={advanceTurnBusy ? t.actionBusy : t.nextTurn}
        >
          {advanceTurnBusy ? <Loader2 size={16} className="animate-spin" /> : <StepForward size={16} />}
          <span className="text-xs font-black">{t.nextTurn}</span>
        </button>
      </div>
    </header>
  );
}
