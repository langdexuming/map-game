import {Loader2, RefreshCw, StepForward} from 'lucide-react';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import type {GameSession} from '../state/useGameSession';
import {formatStr, type Strings} from '../i18n/strings';
import {POPUP_ASSET} from '../game/popupAssets';

interface Props {
  session: GameSession;
}

type BumpKey = 'coin' | 'clue' | 'star' | 'fuel';
type BumpMap = Partial<Record<BumpKey, 'up' | 'down'>>;

export function TopHud({session}: Props) {
  const {t, resources, fuelCap, loading, advanceTurnBusy, usingFallback, reloadAll, advanceTurn, setShowPassport, captainXp} = session;
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
    if (Object.keys(next).length === 0) {
      return;
    }
    setBump(next);
    const tid = setTimeout(() => setBump({}), 700);
    return () => clearTimeout(tid);
  }, [resources.coin, resources.clue, resources.star, resources.fuel]);

  const resIcon = (src: string, alt: string): ReactNode => (
    <img src={src} alt={alt} aria-hidden className="hud-icon-img" draggable={false} />
  );

  const resources_: {icon: ReactNode; value: string | number; label: keyof Strings; bumpKey: BumpKey}[] = [
    {icon: resIcon(POPUP_ASSET.iconCoin, 'coin'), value: resources.coin, label: 'labelCoins', bumpKey: 'coin'},
    {icon: resIcon(POPUP_ASSET.iconClue, 'clue'), value: resources.clue, label: 'labelClues', bumpKey: 'clue'},
    {icon: resIcon(POPUP_ASSET.iconStar, 'star'), value: resources.star, label: 'labelStars', bumpKey: 'star'},
    {icon: resIcon(POPUP_ASSET.iconFuel, 'fuel'), value: `${resources.fuel}/${fuelCap}`, label: 'fuel', bumpKey: 'fuel'},
  ];

  return (
    <header className="top-hud anim-fade">
      <button type="button" className="captain-chip" onClick={() => setShowPassport(true)}>
        <div className="captain-avatar">奇</div>
        <div className="captain-meta">
          <div>{t.captainLevel}</div>
          <div className="xp-bar"><div className="xp-fill" style={{width: `${(captainXp.current / captainXp.max) * 100}%`}} /></div>
          <div className="captain-xp">{formatStr(t.captainXp, {current: captainXp.current, max: captainXp.max})}</div>
        </div>
      </button>

      <div className="title-ribbon">{t.title}</div>

      <div className="resource-row">
        {resources_.map((card) => {
          const bumpClass = bump[card.bumpKey] === 'up' ? 'anim-bump-up' : bump[card.bumpKey] === 'down' ? 'anim-bump-down' : '';
          return (
            <div key={card.label} className="resource-chip" title={t[card.label]}>
              {card.icon}
              <span className={bumpClass}>{card.value}</span>
            </div>
          );
        })}
        <div className="resource-chip turn-chip">{formatStr(t.turnNth, {n: resources.turn})}</div>
        {usingFallback ? <span className="offline-badge">{t.offlineMode}</span> : null}
      </div>

      <div className="hud-actions">
        <button type="button" onClick={() => void reloadAll()} disabled={loading} className="game-button" title={t.refresh}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        </button>
        <button type="button" onClick={() => void advanceTurn()} disabled={loading || advanceTurnBusy} className="game-button-primary" title={t.nextTurn}>
          {advanceTurnBusy ? <Loader2 size={16} className="animate-spin" /> : <StepForward size={16} />}
          <span>{t.nextTurn}</span>
        </button>
      </div>
    </header>
  );
}
