import type {GameSession} from '../../state/useGameSession';

interface Props {
  session: GameSession;
}

export function LogPanel({session}: Props) {
  const {logs} = session;
  if (logs.length === 0) return null;
  return (
    <>
      {logs.map((line, index) => {
        const opacity = Math.max(0.55, 1 - index * 0.04);
        const isLatest = index === 0;
        return (
          <div
            key={`${line}-${index}`}
            className={`game-inset px-3 py-2 leading-relaxed text-[11px] ${isLatest ? 'anim-fade ring-2 ring-amber-300/50' : ''}`}
            style={{opacity}}
          >
            {isLatest ? (
              <span className="mr-1.5 px-1 py-px rounded bg-amber-400 text-stone-900 text-[8px] font-black align-middle tracking-wide">
                NEW
              </span>
            ) : null}
            {line}
          </div>
        );
      })}
    </>
  );
}
