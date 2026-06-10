import {Loader2, X} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {cityLabel, cityUpgradeMaterials, effectiveCityLevel, levelLabel} from '../state/derive';
import {formatStr} from '../i18n/strings';
import {POPUP_ASSET} from '../game/popupAssets';
import {Ribbon} from './Ribbon';

interface Props {
  session: GameSession;
  anchor: {xPct: number; yPct: number};
  onClose: () => void;
  onSetStart: () => void;
  onSetEnd: () => void;
}

export function CityPopover({session, anchor, onClose, onSetStart, onSetEnd}: Props) {
  const {t, selectedCity, regionNameByCityId, cityLevels, cityUpgradeBusy, upgradeSelectedCity, travelFromId, travelToId} =
    session;
  if (!selectedCity) return null;

  const lv = effectiveCityLevel(selectedCity, cityLevels);
  const upgradeCost = cityUpgradeMaterials(lv);
  const isStart = travelFromId === selectedCity.id;
  const isEnd = travelToId === selectedCity.id;

  const verticallyAbove = anchor.yPct > 60;

  return (
    <div
      className="absolute z-40 -translate-x-1/2 pointer-events-auto"
      style={{
        left: `${Math.min(85, Math.max(15, anchor.xPct))}%`,
        top: verticallyAbove ? undefined : `calc(${anchor.yPct}% + 50px)`,
        bottom: verticallyAbove ? `calc(${100 - anchor.yPct}% + 50px)` : undefined,
      }}
    >
      <div className={`floating-card w-[280px] p-3 pt-7 space-y-2 text-[#4a3f35] anim-scale-in relative ${verticallyAbove ? 'origin-bottom' : 'origin-top'}`}>
        <Ribbon
          src={POPUP_ASSET.ribbonCity}
          title={cityLabel(selectedCity)}
          className="absolute left-1/2 -top-7 -translate-x-1/2 w-[85%] z-10 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
        />
        <button
          type="button"
          onClick={onClose}
          className="game-button !p-1 absolute top-2 right-2 z-20"
          aria-label="close"
        >
          <X size={12} />
        </button>

        <div className="flex items-center gap-2">
          <img
            src={lv >= 4 ? POPUP_ASSET.iconHq : selectedCity.unlocked ? POPUP_ASSET.pinUnlocked : POPUP_ASSET.pinLocked}
            alt=""
            aria-hidden
            className="w-9 h-9 select-none shrink-0"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="text-[10px] opacity-70 truncate">{regionNameByCityId.get(selectedCity.id) ?? t.emDash}</div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="font-bold bg-white/70 px-2 py-0.5 rounded border border-[#dcd2ba]">
            {formatStr(t.levelShort, {n: lv})} · {levelLabel(lv, t)}
          </span>
          <span className={`font-bold px-2 py-0.5 rounded border ${selectedCity.unlocked ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-stone-100 border-stone-300 text-stone-600'}`}>
            {selectedCity.unlocked ? t.unlocked : t.locked}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSetStart}
            disabled={!selectedCity.unlocked}
            className={`game-button text-[11px] font-black flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              isStart ? 'bg-emerald-100 border-emerald-300' : ''
            }`}
          >
            <img
              src={POPUP_ASSET.flagStart}
              alt=""
              aria-hidden
              className="w-5 h-5 select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {t.departure}
          </button>
          <button
            type="button"
            onClick={onSetEnd}
            disabled={!selectedCity.unlocked || travelFromId == null}
            className={`game-button text-[11px] font-black flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              isEnd ? 'bg-rose-100 border-rose-300' : ''
            }`}
          >
            <img
              src={POPUP_ASSET.flagEnd}
              alt=""
              aria-hidden
              className="w-5 h-5 select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {t.destination}
          </button>
        </div>

        {upgradeCost ? (
          <div className="space-y-1 border-t border-[#dcd2ba]/70 pt-2">
            <div className="text-[10px] font-mono opacity-80">
              {t.cityUpgradeCost} {upgradeCost.coin} {t.labelCoins} / {upgradeCost.clue} {t.labelClues} / {upgradeCost.star}{' '}
              {t.labelStars}
            </div>
            <button
              type="button"
              onClick={() => void upgradeSelectedCity()}
              disabled={cityUpgradeBusy}
              className="game-button w-full text-[11px] font-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cityUpgradeBusy ? <Loader2 size={13} className="animate-spin" /> : null}
              {t.cityUpgrade}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-bold text-amber-800 pt-1 border-t border-[#dcd2ba]/70">{t.cityMax}</div>
        )}
      </div>
    </div>
  );
}
