import type {GameSession} from '../state/useGameSession';
import {POPUP_ASSET} from '../game/popupAssets';

interface Props {
  session: GameSession;
}

export function EventModal({session}: Props) {
  const {t, pendingEvent, resources, resolveInteractiveChoice} = session;
  if (!pendingEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 anim-fade">
      <div className="floating-card max-w-md w-full p-5 space-y-3 anim-scale-in relative">
        <img
          src={POPUP_ASSET.eventEmblem}
          alt=""
          aria-hidden
          className="absolute -top-8 -left-4 w-20 h-20 select-none pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="pl-16 min-h-[2.5rem] flex items-center">
          <h3 className="text-sm font-black uppercase tracking-wide text-amber-800">{pendingEvent.title}</h3>
        </div>
        <p className="text-[12px] leading-relaxed text-[#4a3f35]">{pendingEvent.body}</p>
        <div className="text-[10px] font-black text-amber-700/80 tracking-widest uppercase pt-1">
          ▷ {t.eventChoosePrompt}
        </div>
        <div className="space-y-2 pt-1 border-t-2 border-dashed border-[#dcd2ba]">
          {pendingEvent.choices.map((choice) => {
            const blocked = choice.requireCoin != null && resources.coin < choice.requireCoin;
            return (
              <button
                key={choice.key}
                type="button"
                onClick={() => resolveInteractiveChoice(choice.key)}
                disabled={blocked}
                className="game-button w-full text-left text-[12px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
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
