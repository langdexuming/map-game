import type {GameSession} from '../../state/useGameSession';
import {cityLabel, effectiveCityLevel, levelLabel} from '../../state/derive';
import {displayRegionName, displayTheme} from '../../i18n/zhDisplay';
import {formatStr} from '../../i18n/strings';

interface Props {
  session: GameSession;
  onPickCity: (cityId: number) => void;
}

export function RegionsPanel({session, onPickCity}: Props) {
  const {t, regions, selectedCityId, cityLevels} = session;
  if (regions.length === 0) {
    return <p className="text-[11px] opacity-70">{t.loading}</p>;
  }
  return (
    <>
      {regions.map((region) => (
        <div key={region.id} className="game-inset p-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black">{displayRegionName(region.name)}</span>
            <span className="text-[10px] font-mono opacity-70">{displayTheme(region.theme)}</span>
          </div>
          <ul className="space-y-1">
            {(region.cities ?? []).map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => onPickCity(city.id)}
                  className={`w-full text-left text-[11px] font-bold rounded-lg px-2 py-1 transition-colors ${
                    selectedCityId === city.id ? 'bg-amber-200/80' : 'hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{cityLabel(city)}</span>
                    <span className="text-[10px] opacity-60">
                      {formatStr(t.levelShort, {n: effectiveCityLevel(city, cityLevels)})} ·{' '}
                      {levelLabel(effectiveCityLevel(city, cityLevels), t)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
