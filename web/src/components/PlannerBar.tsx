import {X} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {cityLabel} from '../state/derive';
import {VEHICLE_ICON} from '../game/mockData';
import {VEHICLE_PNG, POPUP_ASSET} from '../game/popupAssets';
import {formatStr} from '../i18n/strings';
import {Ribbon} from './Ribbon';

interface Props {
  session: GameSession;
}

export function PlannerBar({session}: Props) {
  const {t, plannerPlans, travelFrom, travelTo, bookPlan, resetTravelSelection} = session;
  if (plannerPlans.length === 0 || !travelFrom || !travelTo) return null;

  return (
    <div className="fixed bottom-3 left-1/2 z-30 pointer-events-auto w-[min(1100px,calc(100vw-32px))] anim-slide-up">
      <div className="floating-card p-3 pt-8 relative">
        <Ribbon
          src={POPUP_ASSET.ribbonPlanner}
          title={t.plannerTitle}
          className="absolute left-1/2 -top-8 -translate-x-1/2 w-[55%] max-w-[360px] z-10 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
        />
        <button
          type="button"
          onClick={() => resetTravelSelection()}
          className="game-button !p-1.5 absolute top-2 right-2 z-20"
          aria-label="close"
        >
          <X size={14} />
        </button>
        <div className="flex items-center justify-center gap-2 text-[12px] mb-3 pt-1">
          <span className="font-bold text-emerald-700">{cityLabel(travelFrom)}</span>
          <span className="opacity-50">→</span>
          <span className="font-bold text-rose-700">{cityLabel(travelTo)}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plannerPlans.map((plan, idx) => (
            <div key={plan.planNo} className={`game-inset p-3 space-y-2 anim-scale-in anim-stagger-${idx + 1}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black">{formatStr(t.planNo, {n: plan.planNo})}</div>
                  <div className="text-[10px] opacity-70">{plan.bonusDesc}</div>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <div>{formatStr(t.turnCount, {n: plan.totalTurn})}</div>
                  <div className="text-amber-800 font-bold">{formatStr(t.priceCoins, {n: plan.totalPrice})}</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 min-h-[36px]">
                {plan.vehicleChain.map((v, i) => {
                  const png = VEHICLE_PNG[v];
                  return png ? (
                    <img
                      key={`${v}-${i}`}
                      src={png}
                      alt={v}
                      className="w-8 h-8 select-none drop-shadow"
                      onError={(e) => {
                        e.currentTarget.replaceWith(Object.assign(document.createElement('span'), {textContent: VEHICLE_ICON[v], className: 'text-xl'}));
                      }}
                    />
                  ) : (
                    <span key={`${v}-${i}`} className="text-xl">{VEHICLE_ICON[v]}</span>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="rounded border border-[#dcd2ba] bg-white/70 px-2 py-1 text-center">
                  {t.planFuel} {plan.fuelCost}
                </div>
                <div className="rounded border border-[#dcd2ba] bg-white/70 px-2 py-1 text-center">
                  {t.planEvent} {plan.eventExpect}
                </div>
                <div className="rounded border border-[#dcd2ba] bg-white/70 px-2 py-1 text-center">
                  {t.planRisk} {plan.riskScore}
                </div>
              </div>
              <button type="button" onClick={() => bookPlan(plan)} className="game-button w-full text-xs font-black">
                {t.bookPlan}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
