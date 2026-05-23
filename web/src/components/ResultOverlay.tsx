import type {GameSession} from '../state/useGameSession';
import {POPUP_ASSET} from '../game/popupAssets';

interface Props {
  session: GameSession;
}

export function ResultOverlay({session}: Props) {
  const {t, runResolved, missionStats, resetRun} = session;
  if (!runResolved) return null;

  const win = missionStats.goalMet;
  const decor = win ? POPUP_ASSET.victoryLaurel : POPUP_ASSET.defeatSeal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 anim-fade">
      <div className="floating-card max-w-md w-full p-6 space-y-4 text-center anim-scale-in relative overflow-visible">
        <img
          src={decor}
          alt=""
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[40%] w-40 h-40 select-none pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="pt-16">
          <h2 className={`text-4xl font-black anim-scale-in anim-stagger-2 ${win ? 'text-emerald-700' : 'text-rose-700'}`}>
            {win ? t.runVictory : t.runDefeat}
          </h2>
        </div>
        <div className="text-[12px] space-y-1 text-[#4a3f35]">
          <div>
            {t.victoryProgress}: {missionStats.completed} / 2
          </div>
          <div>
            {t.failedMissions}：{missionStats.failed}
          </div>
        </div>
        <button type="button" onClick={resetRun} className="game-button w-full text-sm font-black">
          {t.restartRun}
        </button>
      </div>
    </div>
  );
}
