import type {GameSession} from '../state/useGameSession';
import {cityLabel} from '../state/derive';
import {findMissionCities} from '../game/missions';
import {formatStr} from '../i18n/strings';

interface Props {
  session: GameSession;
}

export function RightSidebar({session}: Props) {
  const {t, logs, travelNews, researchProgress, missions, citiesForMap, setHighlightMissionId, handleCityClick, cityById} = session;

  const openMission = missions.find((mission) => mission.status === 'OPEN');

  function focusMissionRoute(fromCityId: number, toCityId: number, missionId: number) {
    setHighlightMissionId(missionId);
    const from = cityById.get(fromCityId);
    const to = cityById.get(toCityId);
    if (from) {
      handleCityClick(from);
    }
    if (to) {
      handleCityClick(to);
    }
  }

  return (
    <aside className="game-sidebar right-sidebar">
      <section className="feed-card">
        <div className="feed-title ribbon-green">{t.eventBulletin}</div>
        <p className="feed-body">{logs[0] ?? t.logIntro1}</p>
      </section>

      <section className="feed-card">
        <div className="feed-title ribbon-green">{t.missionBrief}</div>
        {openMission ? (
          <div className="mission-card">
            <div className="mission-card-head">
              <span className="mission-star">★4</span>
              <span className="mission-name">{openMission.title}</span>
            </div>
            <p className="mission-body">{openMission.briefing}</p>
            <div className="mission-route">
              {(() => {
                const points = findMissionCities(openMission, citiesForMap);
                return `${points.from ? cityLabel(points.from) : t.emDash} → ${points.to ? cityLabel(points.to) : t.emDash}`;
              })()}
            </div>
            <button
              type="button"
              className="game-button-primary w-full text-[11px]"
              onClick={() => focusMissionRoute(openMission.fromCityId, openMission.toCityId, openMission.id)}
            >
              {t.viewMissionRoute}
            </button>
          </div>
        ) : (
          <p className="feed-body">{t.missionEmpty}</p>
        )}
      </section>

      <section className="feed-card">
        <div className="feed-title ribbon-blue">{t.travelNews}</div>
        <ul className="feed-list">
          {travelNews.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="feed-card">
        <div className="feed-title ribbon-blue">{t.researchProgress}</div>
        {([
          ['tech', t.researchTech, researchProgress.tech],
          ['logistics', t.researchLogistics, researchProgress.logistics],
          ['intel', t.researchIntel, researchProgress.intel],
          ['engineering', t.researchEngineering, researchProgress.engineering],
        ] as const).map(([key, label, value]) => (
          <div key={key} className="research-row">
            <span>{label}</span>
            <div className="research-bar"><div style={{width: `${value}%`}} /></div>
            <span>{value}%</span>
          </div>
        ))}
      </section>

      <section className="feed-card">
        <div className="feed-title ribbon-orange">{t.travelFeed}</div>
        <ul className="feed-list compact">
          {logs.slice(0, 6).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
