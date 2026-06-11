import type {GameSession} from '../../state/useGameSession';
import {cityLabel, formatPrereqGap} from '../../state/derive';
import {computeMissionPayout, findMissionCities, missionPrereqGaps} from '../../game/missions';
import {formatStr} from '../../i18n/strings';

interface Props {
  session: GameSession;
}

function statusPillClass(status: 'OPEN' | 'COMPLETED' | 'FAILED'): string {
  if (status === 'COMPLETED') return 'bg-emerald-100 border-emerald-300 text-emerald-800';
  if (status === 'FAILED') return 'bg-rose-100 border-rose-300 text-rose-800';
  return 'bg-amber-100 border-amber-300 text-amber-800';
}

export function MissionsPanel({session}: Props) {
  const {t, missions, citiesForMap, missionRuntimePreview, resources, focusMissionRoute, highlightMissionId, missionProgressById, trackedMissionId} = session;
  if (missions.length === 0) {
    return <p className="text-[11px] opacity-75">{t.missionEmpty}</p>;
  }
  return (
    <>
      {missions.map((mission) => {
        const points = findMissionCities(mission, citiesForMap);
        const payoutPreview =
          mission.status === 'OPEN' ? computeMissionPayout(mission, missionRuntimePreview) : null;
        const prereqGaps =
          mission.status === 'OPEN'
            ? missionPrereqGaps(
                mission,
                {fromCityId: mission.fromCityId, toCityId: mission.toCityId},
                missionRuntimePreview,
              )
            : [];
        const statusLabel =
          mission.status === 'COMPLETED' ? t.missionDone : mission.status === 'FAILED' ? t.missionFailed : t.missionOpen;
        const highlighted = highlightMissionId === mission.id || trackedMissionId === mission.id;
        const progress = missionProgressById.get(mission.id);
        return (
          <div key={mission.id} className={`game-inset p-3 space-y-2 ${highlighted ? 'ring-2 ring-[#f5d04c]' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black">{mission.title}</div>
                <div className="text-[10px] opacity-70">{mission.briefing}</div>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap ${statusPillClass(mission.status)}`}>
                {statusLabel}
              </span>
            </div>
            <div className="text-[10px] font-mono opacity-80">
              {points.from ? cityLabel(points.from) : t.emDash} → {points.to ? cityLabel(points.to) : t.emDash}
            </div>
            {progress ? (
              <div className="mission-progress-bar">
                <div className="xp-bar"><div className="xp-fill" style={{width: `${Math.round((progress.elapsed / Math.max(1, progress.total)) * 100)}%`}} /></div>
                <span className="text-[10px] font-bold">{formatStr(t.missionProgressLabel, {elapsed: progress.elapsed, total: progress.total})}</span>
              </div>
            ) : null}
            {mission.status === 'OPEN' ? (
              <button type="button" className="game-button-primary w-full text-[11px]" onClick={() => focusMissionRoute(mission.id)}>
                {t.viewMissionRoute}
              </button>
            ) : null}
            <div className="flex flex-col gap-1.5 text-[10px]">
              <span>
                {t.missionDeadline}：{formatStr(t.missionDeadlineNth, {n: mission.deadlineTurn})}
              </span>
              {mission.minCoin != null && resources.coin < mission.minCoin ? (
                <span className="text-amber-800 font-bold">
                  {t.missionMinCoin} {mission.minCoin}
                </span>
              ) : null}
              {prereqGaps.length > 0 ? (
                <div className="rounded-lg border-2 border-dashed border-amber-400/70 bg-amber-50/60 px-2 py-1.5 space-y-0.5 text-amber-900">
                  <div className="font-black">⚠ {t.missionPrereqTitle}</div>
                  <div>{prereqGaps.map((gap) => formatPrereqGap(gap, t)).join(' · ')}</div>
                </div>
              ) : null}
              {payoutPreview ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-emerald-50/80 border border-emerald-200 px-2 py-1.5">
                  <span className="font-black text-emerald-800">{t.missionPayoutPreview}</span>
                  <span className="text-emerald-900">+{payoutPreview.reward.coin} {t.labelCoins}</span>
                  <span className="text-emerald-900">+{payoutPreview.reward.clue} {t.labelClues}</span>
                  <span className="text-emerald-900">+{payoutPreview.reward.star} {t.labelStars}</span>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
