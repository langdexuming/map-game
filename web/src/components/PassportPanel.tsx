import {X} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {displayRegionName} from '../i18n/zhDisplay';
import {MILEAGE_GOAL, VISA_REQUIREMENTS} from '../game/passport';
import {formatStr} from '../i18n/strings';

interface Props {
  session: GameSession;
}

export function PassportPanel({session}: Props) {
  const {t, showPassport, setShowPassport, passport, regions, purchaseVisa, resources} = session;
  if (!showPassport) {
    return null;
  }

  return (
    <div className="modal-overlay anim-fade">
      <div className="passport-panel anim-scale-in">
        <button type="button" className="planner-close game-button" onClick={() => setShowPassport(false)} aria-label="close">
          <X size={14} />
        </button>
        <div className="passport-grid">
          <section>
            <div className="feed-title ribbon-blue">{t.passportTitle}</div>
            <div className="passport-profile">
              <div className="agent-avatar large">奇</div>
              <div>
                <div className="agent-name">{t.captainLevel}</div>
                <div className="agent-title">阿尔法·小奇</div>
              </div>
            </div>
            <div className="stamp-grid">
              {regions.map((region) => (
                <div key={region.id} className={`stamp ${passport.stamps[region.id] ? 'is-stamped' : 'is-empty'}`}>
                  {passport.stamps[region.id] ? displayRegionName(region.name) : `${displayRegionName(region.name)} ${t.passportLocked}`}
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="feed-title ribbon-green">{t.passportVisas}</div>
            {Object.entries(VISA_REQUIREMENTS).map(([regionId, req]) => {
              const region = regions.find((item) => item.id === Number(regionId));
              if (!region) {
                return null;
              }
              const owned = passport.visas[Number(regionId)];
              return (
                <div key={regionId} className="visa-row">
                  <span>{displayRegionName(region.name)} 签证</span>
                  <span>
                    {req.clue != null ? `线索 ×${req.clue}` : ''}
                    {req.star != null ? `星星 ×${req.star}` : ''}
                  </span>
                  {owned ? (
                    <span>{t.passportStamped}</span>
                  ) : (
                    <button type="button" className="game-button text-[11px]" onClick={() => purchaseVisa(Number(regionId))}>
                      {t.passportBuyVisa}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="mileage-row">
              <span>{t.passportMileage}</span>
              <div className="research-bar wide"><div style={{width: `${Math.min(100, (passport.mileage / MILEAGE_GOAL) * 100)}%`}} /></div>
              <span>{passport.mileage}/{MILEAGE_GOAL}</span>
            </div>
            <p className="feed-body">{formatStr(t.passportMileageGoal, {n: MILEAGE_GOAL})}</p>
            <p className="feed-body">{t.passportGlobalPassHint}</p>
            {passport.specialStamps['triple-combo'] ? (
              <div className="stamp is-stamped">{t.specialStampTriple}</div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
