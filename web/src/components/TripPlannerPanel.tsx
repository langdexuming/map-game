import {Crown, X} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {cityLabel} from '../state/derive';
import {VEHICLE_PNG, POPUP_ASSET} from '../game/popupAssets';
import {VEHICLE_ICON} from '../game/mockData';
import {formatStr} from '../i18n/strings';
import {Ribbon} from './Ribbon';

interface Props {
  session: GameSession;
}

export function TripPlannerPanel({session}: Props) {
  const {
    t,
    plannerPlans,
    travelFrom,
    travelTo,
    selectedPlanNo,
    selectedSlotOffset,
    scheduleSlots,
    selectedPlan,
    bookingPreview,
    selectPlan,
    selectScheduleSlot,
    confirmBooking,
    resetTravelSelection,
  } = session;

  if (plannerPlans.length === 0 || !travelFrom || !travelTo) {
    return null;
  }

  return (
    <div className="trip-planner-panel anim-scale-in">
      <Ribbon
        src={POPUP_ASSET.ribbonPlanner}
        title={t.plannerTitle}
        className="planner-ribbon"
      />
      <button type="button" className="planner-close game-button" onClick={() => resetTravelSelection()} aria-label="close">
        <X size={14} />
      </button>
      <div className="planner-route">
        <span>{cityLabel(travelFrom)}</span>
        <span>→</span>
        <span>{cityLabel(travelTo)}</span>
      </div>

      <div className="planner-plans">
        {plannerPlans.map((plan) => {
          const selected = (selectedPlanNo ?? plannerPlans[0]?.planNo) === plan.planNo;
          return (
            <button
              key={plan.planNo}
              type="button"
              className={`planner-plan-card ${selected ? 'is-selected' : ''}`}
              onClick={() => selectPlan(plan.planNo)}
            >
              {selected ? <Crown size={14} className="plan-crown" /> : null}
              <div className="plan-badge">{plan.planBadge}</div>
              <div className="plan-title">{formatStr(t.planNo, {n: plan.planNo})}</div>
              <div className="plan-desc">{plan.bonusDesc}</div>
              <div className="plan-tags">
                <span>{formatStr(t.turnCount, {n: plan.totalTurn})}</span>
                <span>{formatStr(t.priceCoins, {n: plan.totalPrice})}</span>
                {plan.transferCombo ? <span>{t.planTransferReward}</span> : null}
              </div>
              <div className="plan-vehicles">
                {plan.vehicleChain.map((vehicle, index) => {
                  const png = VEHICLE_PNG[vehicle as keyof typeof VEHICLE_PNG];
                  return png ? (
                    <img key={`${vehicle}-${index}`} src={png} alt={vehicle} className="plan-veh-icon" />
                  ) : (
                    <span key={`${vehicle}-${index}`}>{VEHICLE_ICON[vehicle as keyof typeof VEHICLE_ICON]}</span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {selectedPlan ? (
        <>
          <div className="timetable-strip">
            <div className="timetable-label">{t.timetableTitle}</div>
            <div className="timetable-slots">
              {scheduleSlots.map((slot) => (
                <button
                  key={slot.offset}
                  type="button"
                  className={`timetable-slot ${selectedSlotOffset === slot.offset ? 'is-active' : ''}`}
                  onClick={() => selectScheduleSlot(slot.offset)}
                >
                  <div>T+{slot.offset}</div>
                  <div>{slot.tag ?? slot.label}</div>
                  {slot.peak ? <span className="peak-tag">{t.timetablePeak}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {bookingPreview ? (
            <div className="budget-bar">
              <span className={bookingPreview.canAffordFuel ? '' : 'is-danger'}>{t.planFuel} -{bookingPreview.fuel}</span>
              <span className={bookingPreview.fatigueBlocked ? 'is-danger' : ''}>
                {t.planFatigue} +{bookingPreview.fatigue}
                {bookingPreview.fatigueHint ? ` (${bookingPreview.fatigueHint})` : ''}
              </span>
              <span className={bookingPreview.canAffordCoin ? '' : 'is-danger'}>
                {formatStr(t.priceCoins, {n: bookingPreview.price})}
              </span>
            </div>
          ) : null}

          <div className="planner-actions">
            <button type="button" className="game-button" onClick={() => resetTravelSelection()}>{t.cancelBooking}</button>
            {bookingPreview?.fatigueBlocked ? (
              <button type="button" className="game-button planner-force-btn" onClick={() => confirmBooking(true)}>
                {t.agentForceDepart}
              </button>
            ) : null}
            <button
              type="button"
              className="game-button-primary"
              onClick={() => confirmBooking()}
              disabled={!bookingPreview || !bookingPreview.canAffordCoin || !bookingPreview.canAffordFuel || bookingPreview.fatigueBlocked}
            >
              {t.confirmBooking}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
