import type {GameSession} from '../state/useGameSession';
import {POPUP_ASSET} from '../game/popupAssets';
import {Ribbon} from './Ribbon';

interface Props {
  session: GameSession;
}

export function EventModal({session}: Props) {
  const {t, pendingEvent, resources, resolveInteractiveChoice} = session;
  if (!pendingEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 anim-fade">
      <div className="floating-card max-w-md w-full p-5 pt-8 space-y-3 anim-scale-in relative">
        <Ribbon
          src={POPUP_ASSET.ribbonEvent}
          title={pendingEvent.title}
          className="absolute left-1/2 -top-8 -translate-x-1/2 w-[80%] max-w-[340px] z-10 pointer-events-none anim-scale-in drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
        />
        <p className="text-[12px] leading-relaxed text-[#4a3f35] pt-2">{pendingEvent.body}</p>
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
