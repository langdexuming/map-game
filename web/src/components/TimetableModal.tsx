import {X} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {cityLabel} from '../state/derive';
import {slotPrice} from '../game/timetable';
import {formatStr} from '../i18n/strings';

interface Props {
  session: GameSession;
}

export function TimetableModal({session}: Props) {
  const {t, showTimetable, setShowTimetable, selectedPlan, scheduleSlots, selectedSlotOffset, selectScheduleSlot, travelFrom, travelTo, resources} = session;
  if (!showTimetable || !selectedPlan) {
    return null;
  }

  return (
    <div className="modal-overlay anim-fade">
      <div className="timetable-modal anim-scale-in">
        <button type="button" className="planner-close game-button" onClick={() => setShowTimetable(false)} aria-label="close">
          <X size={14} />
        </button>
        <div className="feed-title ribbon-blue">{t.timetableTitle}</div>
        {travelFrom && travelTo ? (
          <p className="planner-route">{cityLabel(travelFrom)} ⇄ {cityLabel(travelTo)}</p>
        ) : null}
        <div className="timetable-slots modal-slots">
          {scheduleSlots.map((slot) => (
            <button
              key={slot.offset}
              type="button"
              className={`timetable-slot ${selectedSlotOffset === slot.offset ? 'is-active' : ''}`}
              onClick={() => selectScheduleSlot(slot.offset)}
            >
              <div>T+{slot.offset}</div>
              <div>{slot.label}</div>
              <div>{formatStr(t.priceCoins, {n: slotPrice(selectedPlan.totalPrice, slot, slot.offset <= 1)})}</div>
            </button>
          ))}
        </div>
        <div className="timetable-rules">
          <span>{t.timetableRuleEarly}</span>
          <span>{t.timetableRuleLate}</span>
          <span>{t.timetableRuleChange}</span>
        </div>
        <div className="planner-actions">
          <button type="button" className="game-button" onClick={() => setShowTimetable(false)}>{t.cancelBooking}</button>
          <button type="button" className="game-button-primary" onClick={() => setShowTimetable(false)}>{t.confirmBooking}</button>
        </div>
      </div>
    </div>
  );
}
