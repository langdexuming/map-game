/**
 * 中文界面下的地名与存档名显示映射（后端/Mock 仍为英文键时可覆盖为中文）
 * @author make java
 * @since 2026-05-16
 */

const REGION_ZH: Record<string, string> = {
  'Water Land': '水域之国',
  'Toy Isles': '玩具群岛',
  'Vanguard Isles': '先锋群岛',
  'Rainbow Land': '彩虹大陆',
  'Greenforest Land': '绿森林地',
  '水之大陆': '水域之国',
  '水域之国': '水域之国',
  '玩具群岛': '玩具群岛',
  '先锋群岛': '先锋群岛',
  '彩虹大陆': '彩虹大陆',
  '绿林大陆': '绿森林地',
  '绿森林地': '绿森林地',
};

const THEME_ZH: Record<string, string> = {
  'Ocean Routes': '海上航线',
  'Clockwork Ports': '发条港口',
  'Heavy Industry': '重工业带',
  'Weather Front': '气象前线',
  'Supply Corridor': '补给走廊',
  '海上航线': '海上航线',
  '发条港口': '发条港口',
  '重工业带': '重工业带',
  '气象前线': '气象前线',
  '补给走廊': '补给走廊',
};

const CITY_ZH: Record<number, string> = {
  1: '小盾总部',
  2: '新星基地',
  3: '顶点总部',
  4: '协同城',
  5: '纳威前哨',
  6: '绿林枢纽',
};

const WORLD_ZH: Record<string, string> = {
  'Default Save': '默认存档',
  'Travel Edition Save': '出行特工存档',
  '出行特工存档': '出行特工存档',
  '默认存档': '默认存档',
};

export function displayRegionName(name: string): string {
  return REGION_ZH[name] ?? name;
}

export function displayTheme(theme: string | undefined): string {
  if (!theme) {
    return '—';
  }
  return THEME_ZH[theme] ?? theme;
}

export function displayCityName(city: {id: number; name: string}): string {
  return CITY_ZH[city.id] ?? city.name;
}

export function displayWorldName(name: string | undefined): string {
  if (!name) {
    return '—';
  }
  return WORLD_ZH[name] ?? name;
}
