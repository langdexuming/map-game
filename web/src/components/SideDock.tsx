import {Castle, ClipboardList, Globe2, Plane, ScrollText} from 'lucide-react';
import type {ReactNode} from 'react';
import type {GameSession} from '../state/useGameSession';

export type PanelKey = 'regions' | 'missions' | 'trips' | 'log' | 'hq' | null;

interface Props {
  session: GameSession;
  active: PanelKey;
  onToggle: (key: NonNullable<PanelKey>) => void;
}

export function SideDock({session, active, onToggle}: Props) {
  const {t, missions, activeTrips} = session;
  const openMissions = missions.filter((m) => m.status === 'OPEN').length;

  const buttons: Array<{key: NonNullable<PanelKey>; icon: ReactNode; title: string; badge?: number}> = [
    {key: 'regions', icon: <Globe2 size={20} />, title: t.regions},
    {key: 'missions', icon: <ClipboardList size={20} />, title: t.missions, badge: openMissions},
    {key: 'trips', icon: <Plane size={20} />, title: t.activeTrips, badge: activeTrips.length},
    {key: 'hq', icon: <Castle size={20} />, title: t.baseTitle},
    {key: 'log', icon: <ScrollText size={20} />, title: t.travelFeed},
  ];

  return (
    <nav className="fixed top-20 left-3 z-30 flex flex-col gap-2 anim-fade">
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          className="dock-button tip-host"
          data-active={active === b.key ? 'true' : 'false'}
          onClick={() => onToggle(b.key)}
        >
          {b.icon}
          {b.badge != null && b.badge > 0 ? (
            <span className={`dock-badge ${b.badge > 0 && (b.key === 'missions' || b.key === 'trips') ? 'is-fresh' : ''}`}>{b.badge}</span>
          ) : null}
          <span className="tip-label">{b.title}</span>
        </button>
      ))}
    </nav>
  );
}
