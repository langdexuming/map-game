import type {CityVO, RegionVO} from '../api/types';
import {displayCityName} from '../i18n/zhDisplay';
import {formatStr, type Strings} from '../i18n/strings';
import type {MissionPrereqGap} from '../game/missions';

export const DEFAULT_WORLD_ID = 1;
export const DEFAULT_PLAYER_ID = 1;
export const DEFAULT_TEAM_ID = 1;
export const HQ_MAX_LEVEL = 5;
export const CITY_MAX_LEVEL = 5;

export const INITIAL_RESOURCES = {
  coin: 5000,
  clue: 1200,
  star: 850,
  fuel: 200,
  turn: 1,
};

export function fuelCapForHq(hqLevel: number): number {
  return 200 + Math.max(0, hqLevel - 1) * 40;
}

export function ticketDiscountForHq(hqLevel: number): number {
  return Math.min(0.2, Math.max(0, hqLevel - 1) * 0.05);
}

const HQ_UPGRADE_TABLE: Record<number, {coin: number; clue: number; star: number}> = {
  1: {coin: 160, clue: 22, star: 0},
  2: {coin: 280, clue: 48, star: 1},
  3: {coin: 420, clue: 72, star: 2},
  4: {coin: 560, clue: 96, star: 3},
};

const CITY_UPGRADE_TABLE: Record<number, {coin: number; clue: number; star: number}> = {
  1: {coin: 110, clue: 10, star: 0},
  2: {coin: 190, clue: 20, star: 0},
  3: {coin: 290, clue: 32, star: 1},
  4: {coin: 410, clue: 46, star: 2},
};

export function upgradeMaterialsForNextHq(currentLevel: number): {coin: number; clue: number; star: number} | null {
  if (currentLevel >= HQ_MAX_LEVEL) {
    return null;
  }
  return HQ_UPGRADE_TABLE[currentLevel] ?? null;
}

export function cityUpgradeMaterials(currentLevel: number): {coin: number; clue: number; star: number} | null {
  if (currentLevel >= CITY_MAX_LEVEL) {
    return null;
  }
  return CITY_UPGRADE_TABLE[currentLevel] ?? null;
}

export function effectiveCityLevel(city: CityVO, levels: Record<number, number>): number {
  return levels[city.id] ?? city.level;
}

export function buildCityLevelSeed(regionList: RegionVO[]): Record<number, number> {
  const seed: Record<number, number> = {};
  for (const region of regionList) {
    for (const city of region.cities ?? []) {
      seed[city.id] = city.level;
    }
  }
  return seed;
}

export function mergeCityIntoRegions(regionList: RegionVO[], vo: CityVO): RegionVO[] {
  return regionList.map((region) => ({
    ...region,
    cities: (region.cities ?? []).map((city) => (city.id === vo.id ? {...city, level: vo.level} : city)),
  }));
}

export function cityLabel(city: CityVO): string {
  return displayCityName(city);
}

export function levelLabel(level: number, labels: Strings): string {
  if (level === 1) return labels.levelHub;
  if (level === 2) return labels.levelRegion;
  if (level === 3) return labels.levelOutpost;
  if (level === 4) return labels.levelFortress;
  if (level === 5) return labels.levelCapital;
  return formatStr(labels.levelShort, {n: level});
}

export function formatPrereqGap(gap: MissionPrereqGap, strings: Strings): string {
  switch (gap.type) {
    case 'hq':
      return strings.prereqHq.replace('{n}', String(gap.required));
    case 'cityFrom':
      return strings.prereqCityFrom.replace('{n}', String(gap.required));
    case 'cityTo':
      return strings.prereqCityTo.replace('{n}', String(gap.required));
    case 'clue':
      return strings.prereqClue.replace('{n}', String(gap.required));
    case 'star':
      return strings.prereqStar.replace('{n}', String(gap.required));
    default:
      return '';
  }
}
