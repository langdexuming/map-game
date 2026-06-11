import {Building2, FlaskConical, Handshake, Plane, Play, Search, Shield, Truck, Users} from 'lucide-react';
import type {GameSession} from '../state/useGameSession';
import {formatStr} from '../i18n/strings';

interface Props {
  session: GameSession;
  onOpenPanel: (panel: 'hq' | 'missions' | 'trips' | 'log' | 'regions') => void;
}

export function BottomBar({session, onOpenPanel}: Props) {
  const {t, nextScheduleTurn, setShowTimetable, startDepartFlow, switchView} = session;

  return (
    <footer className="bottom-bar">
      <button type="button" className="schedule-clock" onClick={() => setShowTimetable(true)}>
        <span className="clock-face">⏰</span>
        <span>{formatStr(t.scheduleNext, {n: nextScheduleTurn})}</span>
      </button>

      <div className="bottom-group">
        <div className="bottom-label">{t.buildMenu}</div>
        <div className="bottom-actions">
          <button type="button" className="round-action" onClick={() => onOpenPanel('hq')} title={t.buildBase}><Building2 size={18} /></button>
          <button type="button" className="round-action" onClick={() => onOpenPanel('log')} title={t.buildResearch}><FlaskConical size={18} /></button>
          <button type="button" className="round-action" onClick={() => onOpenPanel('regions')} title={t.buildUnits}><Truck size={18} /></button>
          <button type="button" className="round-action" onClick={() => onOpenPanel('missions')} title={t.buildTrade}><Handshake size={18} /></button>
          <button type="button" className="round-action is-highlight" onClick={() => switchView('TRAVEL')} title={t.buildTransit}><Plane size={18} /></button>
        </div>
      </div>

      <div className="bottom-group">
        <div className="bottom-label">{t.activeUnit}</div>
        <div className="bottom-actions">
          <button type="button" className="round-action is-green" onClick={() => startDepartFlow()} title={t.actionDepart}><Play size={18} /></button>
          <button type="button" className="round-action" onClick={() => onOpenPanel('trips')} title={t.actionTeam}><Users size={18} /></button>
          <button type="button" className="round-action" onClick={() => switchView('EXPLORER')} title={t.actionScout}><Search size={18} /></button>
          <button type="button" className="round-action" onClick={() => onOpenPanel('missions')} title={t.actionEscort}><Shield size={18} /></button>
          <button type="button" className="round-action is-highlight" onClick={() => switchView('TRAVEL')} title={t.actionTravel}><Plane size={18} /></button>
        </div>
      </div>
    </footer>
  );
}
