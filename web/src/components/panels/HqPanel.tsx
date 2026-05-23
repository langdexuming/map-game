import {Home, Loader2, Target} from 'lucide-react';
import type {GameSession} from '../../state/useGameSession';
import {formatStr} from '../../i18n/strings';

interface Props {
  session: GameSession;
}

export function HqPanel({session}: Props) {
  const {t, hqLevel, fuelCap, nextHqMaterials, hqUpgradeBusy, upgradeHq, missionStats, resources} = session;
  const goalDone = missionStats.completed >= 2;

  return (
    <>
      <div className="game-inset p-3 space-y-2 text-[11px]">
        <div className="flex items-center gap-2 font-black text-sm text-amber-950">
          <Home size={16} />
          {t.baseTitle} {formatStr(t.levelShort, {n: hqLevel})}
        </div>
        <div className="opacity-80 text-[10px]">
          {t.baseFuelCap}: <span className="font-mono">{fuelCap}</span>
        </div>
        <p className="opacity-70 text-[10px] leading-relaxed">{t.baseDiscountHint}</p>
        {nextHqMaterials ? (
          <div className="space-y-2">
            <div className="text-[10px] font-mono opacity-80">
              {t.baseUpgradeCost} {nextHqMaterials.coin} {t.labelCoins} / {nextHqMaterials.clue} {t.labelClues} /{' '}
              {nextHqMaterials.star} {t.labelStars}
            </div>
            <button
              type="button"
              onClick={() => void upgradeHq()}
              disabled={hqUpgradeBusy}
              className="game-button w-full text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {hqUpgradeBusy ? <Loader2 size={14} className="animate-spin" /> : null}
              {t.baseUpgrade}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-bold text-amber-800">{t.baseMax}</div>
        )}
      </div>

      <div className="game-inset p-3 space-y-2 text-[11px] border-t-4 border-amber-400">
        <div className="flex items-center gap-1.5 font-black text-[12px] text-amber-900">
          <Target size={14} className="text-amber-700" />
          {t.commandGoal}
        </div>
        <div className="opacity-80 text-[10px]">{t.winCondition}</div>
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
          <span>
            {t.victoryProgress}: {missionStats.completed}/2
          </span>
          <span>{formatStr(t.turnProgress, {current: resources.turn, max: 8})}</span>
        </div>
        <div className="xp-bar">
          <div
            className={`xp-fill transition-all duration-500 ${goalDone ? '!bg-gradient-to-r !from-emerald-400 !to-emerald-500' : ''}`}
            style={{width: `${Math.min(100, missionStats.completed * 50)}%`}}
          />
        </div>
        {missionStats.goalMet ? <div className="text-emerald-700 font-black text-[11px]">{t.goalMetText}</div> : null}
        {missionStats.goalMissed ? <div className="text-red-700 font-black text-[11px]">{t.goalMissed}</div> : null}
      </div>
    </>
  );
}
