import {useEffect, useState} from 'react';
import type {GameSession} from '../state/useGameSession';
import {POPUP_ASSET} from '../game/popupAssets';
import {formatStr} from '../i18n/strings';
import {Ribbon} from './Ribbon';

interface Props {
  session: GameSession;
}

const EVENT_THEME: Record<string, string> = {
  STORM: 'ribbon-blue',
  PIRATE: 'ribbon-orange',
  CLUE_FOUND: 'ribbon-green',
};

export function EventModal({session}: Props) {
  const {t, pendingEvent, resources, resolveInteractiveChoice} = session;
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [showDice, setShowDice] = useState(false);

  useEffect(() => {
    if (!pendingEvent) {
      return;
    }
    setSecondsLeft(10);
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    const timeout = window.setTimeout(() => {
      const safeChoice = pendingEvent.choices[pendingEvent.choices.length - 1];
      resolveInteractiveChoice(safeChoice.key);
    }, 10000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [pendingEvent, resolveInteractiveChoice]);

  if (!pendingEvent) {
    return null;
  }

  const theme = EVENT_THEME[pendingEvent.eventCode] ?? 'ribbon-orange';

  return (
    <div className="modal-overlay anim-fade">
      <div className="event-card anim-scale-in">
        <Ribbon src={POPUP_ASSET.ribbonEvent} title={pendingEvent.title} className="planner-ribbon" />
        <div className="event-dice" onMouseDown={() => setShowDice(true)} onMouseUp={() => setShowDice(false)} onMouseLeave={() => setShowDice(false)}>
          🎲 {t.eventDice}
          {showDice ? <span className="dice-roll">{formatStr(t.eventDiceRoll, {n: pendingEvent.d100})}</span> : null}
        </div>
        <p className="event-body">{pendingEvent.body}</p>
        <p className="event-timeout">{t.eventTimeout} · {secondsLeft}s</p>
        <div className="event-choices">
          {pendingEvent.choices.map((choice) => {
            const blocked = choice.requireCoin != null && resources.coin < choice.requireCoin;
            return (
              <button
                key={choice.key}
                type="button"
                onClick={() => resolveInteractiveChoice(choice.key)}
                disabled={blocked}
                className={`game-button ${choice.key === 'fight' || choice.key === 'take' ? 'game-button-primary' : ''}`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
