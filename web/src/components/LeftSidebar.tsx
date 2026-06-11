import type {GameSession} from '../state/useGameSession';
import {fatigueBarClass} from '../game/fatigue';
import {formatStr} from '../i18n/strings';
import type {MapViewType} from '../api/types';

interface Props {
  session: GameSession;
}

const VIEW_OPTIONS: {type: MapViewType; key: 'explorer' | 'resource' | 'team' | 'travel'}[] = [
  {type: 'EXPLORER', key: 'explorer'},
  {type: 'RESOURCE', key: 'resource'},
  {type: 'TEAM', key: 'team'},
  {type: 'TRAVEL', key: 'travel'},
];

function statusLabel(session: GameSession, agent: GameSession['agents'][number]): string {
  const {t} = session;
  if (agent.status === 'IN_TRANSIT' && agent.turnsRemaining != null) {
    return formatStr(t.agentInTransit, {n: agent.turnsRemaining});
  }
  if (agent.status === 'NEED_REST') {
    return t.agentNeedRest;
  }
  if (agent.status === 'RESTING') {
    return t.agentResting;
  }
  return t.agentStandby;
}

export function LeftSidebar({session}: Props) {
  const {t, agents, viewType, switchView, restAgent} = session;

  return (
    <aside className="game-sidebar left-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">{t.teamPanel}</div>
        <div className="agent-list">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-card-head">
                <div className="agent-avatar">{agent.name.slice(0, 1)}</div>
                <div className="agent-meta">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-title">{agent.title}</div>
                </div>
                {agent.vehicleSticker ? <span className="agent-vehicle">{agent.vehicleSticker}</span> : null}
              </div>
              <div className="agent-stats">
                <span>❤ {agent.stamina}/{agent.maxStamina}</span>
                <span>🛡 {agent.guard}</span>
                <span>⭐ {agent.wit}</span>
              </div>
              <div className="fatigue-row">
                <span>{t.agentFatigue}</span>
                <div className="fatigue-bar">
                  <div className={`fatigue-fill ${fatigueBarClass(agent.fatigue)}`} style={{width: `${agent.fatigue}%`}} />
                </div>
                <span>{agent.fatigue}/100</span>
              </div>
              <div className={`agent-badge status-${agent.status.toLowerCase()}`}>{statusLabel(session, agent)}</div>
              {agent.status === 'NEED_REST' || agent.status === 'RESTING' ? (
                <div className="mt-2 space-y-2">
                  <button type="button" className="game-button w-full text-[11px]" onClick={() => restAgent(agent.id, agent.id === 1)}>
                    {t.agentRest}
                  </button>
                  {agent.status === 'NEED_REST' ? (
                    <p className="text-[10px] text-[#d9534f] font-bold">{t.insufficientFatigue} · {t.agentForceDepart}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-title">{t.mapViews}</div>
        <div className="view-toggle-grid">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              className={`view-toggle ${viewType === opt.type ? 'is-active' : ''}`}
              onClick={() => switchView(opt.type)}
            >
              {t[opt.key]}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
