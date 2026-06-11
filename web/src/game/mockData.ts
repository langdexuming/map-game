import type {CityVO, MapViewLayerItem, MapViewType, MapViewVO, RegionVO, WorldVO} from '../api/types';

export type VehicleType = 'PLANE' | 'SHIP' | 'TRAIN' | 'TRUCK' | 'FOOT';

export interface RouteDef {
  fromCityId: number;
  toCityId: number;
  vehicleType: VehicleType;
  distance: number;
  basePrice: number;
  baseTurn: number;
  /** 主基地等级门槛 */
  requiresHqLevel?: number;
  /** 起点城市经济等级（含玩家升级） */
  requiresFromCityLevel?: number;
  /** 终点城市经济等级 */
  requiresToCityLevel?: number;
  /** 票价倍率，用于高风险/特许航线 */
  priceScale?: number;
  /** 时间倍率 */
  turnScale?: number;
  /** 在载具基础风险上乘算 */
  riskScale?: number;
}

export interface TripEffect {
  coin?: number;
  clue?: number;
  star?: number;
  fuel?: number;
  delay?: number;
  label?: string;
}

export interface TripEventChoice {
  key: string;
  label: string;
  requireCoin?: number;
  effect: TripEffect;
}

export interface TripEventDef {
  weight: number;
  code: string;
  title: string;
  body: string;
  effect?: TripEffect;
  interactive?: boolean;
  choices?: TripEventChoice[];
}

export const VEHICLE_ICON: Record<VehicleType, string> = {
  PLANE: '✈',
  SHIP: '⛴',
  TRAIN: '🚆',
  TRUCK: '🚚',
  FOOT: '🥾',
};

export const VEHICLE_COLOR: Record<VehicleType, string> = {
  PLANE: '#f59e0b',
  SHIP: '#3b82f6',
  TRAIN: '#7c3f00',
  TRUCK: '#64748b',
  FOOT: '#10b981',
};

export const VEHICLE_DASH: Record<VehicleType, string | undefined> = {
  PLANE: '8 6',
  SHIP: undefined,
  TRAIN: '2 6',
  TRUCK: undefined,
  FOOT: '6 6',
};

export const VEHICLE_RISK: Record<VehicleType, number> = {
  PLANE: 0.2,
  SHIP: 0.3,
  TRAIN: 0.18,
  TRUCK: 0.22,
  FOOT: 0.4,
};

export const MOCK_WORLD: WorldVO = {
  id: 1,
  name: '出行特工存档',
  turnNo: 1,
  hqLevel: 1,
};

export const MOCK_REGIONS: RegionVO[] = [
  {
    id: 1,
    name: '水域之国',
    theme: '海上航线',
    cities: [{id: 1, name: '小盾总部', level: 1, lng: -10, lat: 30, unlocked: true}],
  },
  {
    id: 2,
    name: '玩具群岛',
    theme: '发条港口',
    cities: [{id: 2, name: '新星基地', level: 1, lng: 60, lat: 35, unlocked: true}],
  },
  {
    id: 3,
    name: '先锋群岛',
    theme: '重工业带',
    cities: [
      {id: 3, name: '顶点总部', level: 1, lng: -45, lat: -15, unlocked: true},
      {id: 4, name: '协同城', level: 2, lng: -30, lat: -25, unlocked: true},
    ],
  },
  {
    id: 4,
    name: '彩虹大陆',
    theme: '气象前线',
    cities: [{id: 5, name: '纳威前哨', level: 3, lng: 85, lat: -10, unlocked: true}],
  },
  {
    id: 5,
    name: '绿森林地',
    theme: '补给走廊',
    cities: [{id: 6, name: '绿林枢纽', level: 1, lng: 25, lat: 5, unlocked: true}],
  },
];

export const MOCK_ROUTES: RouteDef[] = [
  {fromCityId: 1, toCityId: 2, vehicleType: 'PLANE', distance: 7000, basePrice: 320, baseTurn: 2},
  {fromCityId: 2, toCityId: 1, vehicleType: 'PLANE', distance: 7000, basePrice: 320, baseTurn: 2},
  {fromCityId: 1, toCityId: 3, vehicleType: 'PLANE', distance: 5500, basePrice: 280, baseTurn: 2},
  {fromCityId: 3, toCityId: 1, vehicleType: 'PLANE', distance: 5500, basePrice: 280, baseTurn: 2},
  {fromCityId: 1, toCityId: 6, vehicleType: 'PLANE', distance: 4000, basePrice: 220, baseTurn: 2},
  {fromCityId: 6, toCityId: 1, vehicleType: 'PLANE', distance: 4000, basePrice: 220, baseTurn: 2},
  {fromCityId: 2, toCityId: 6, vehicleType: 'PLANE', distance: 4500, basePrice: 240, baseTurn: 2},
  {fromCityId: 6, toCityId: 2, vehicleType: 'PLANE', distance: 4500, basePrice: 240, baseTurn: 2},
  {fromCityId: 3, toCityId: 6, vehicleType: 'PLANE', distance: 5000, basePrice: 260, baseTurn: 2},
  {fromCityId: 6, toCityId: 3, vehicleType: 'PLANE', distance: 5000, basePrice: 260, baseTurn: 2},
  {fromCityId: 1, toCityId: 3, vehicleType: 'SHIP', distance: 5500, basePrice: 118, baseTurn: 4, requiresFromCityLevel: 2},
  {fromCityId: 3, toCityId: 1, vehicleType: 'SHIP', distance: 5500, basePrice: 118, baseTurn: 4, requiresToCityLevel: 2},
  {fromCityId: 2, toCityId: 6, vehicleType: 'SHIP', distance: 4500, basePrice: 105, baseTurn: 3},
  {fromCityId: 6, toCityId: 2, vehicleType: 'SHIP', distance: 4500, basePrice: 105, baseTurn: 3},
  {fromCityId: 3, toCityId: 4, vehicleType: 'SHIP', distance: 800, basePrice: 55, baseTurn: 1},
  {fromCityId: 4, toCityId: 3, vehicleType: 'SHIP', distance: 800, basePrice: 55, baseTurn: 1},
  {fromCityId: 3, toCityId: 4, vehicleType: 'TRAIN', distance: 700, basePrice: 80, baseTurn: 1},
  {fromCityId: 4, toCityId: 3, vehicleType: 'TRAIN', distance: 700, basePrice: 80, baseTurn: 1},
  {fromCityId: 1, toCityId: 6, vehicleType: 'TRAIN', distance: 3500, basePrice: 165, baseTurn: 3, requiresHqLevel: 2},
  {fromCityId: 6, toCityId: 1, vehicleType: 'TRAIN', distance: 3500, basePrice: 165, baseTurn: 3, requiresHqLevel: 2},
  {fromCityId: 2, toCityId: 6, vehicleType: 'TRAIN', distance: 4100, basePrice: 150, baseTurn: 3, requiresHqLevel: 2},
  {fromCityId: 6, toCityId: 2, vehicleType: 'TRAIN', distance: 4100, basePrice: 150, baseTurn: 3, requiresHqLevel: 2},
  {fromCityId: 6, toCityId: 5, vehicleType: 'TRUCK', distance: 1500, basePrice: 78, baseTurn: 2, requiresFromCityLevel: 2},
  {fromCityId: 5, toCityId: 6, vehicleType: 'TRUCK', distance: 1500, basePrice: 78, baseTurn: 2, requiresToCityLevel: 2},
  {fromCityId: 4, toCityId: 5, vehicleType: 'FOOT', distance: 2000, basePrice: 0, baseTurn: 5, riskScale: 1.15},
  {fromCityId: 5, toCityId: 4, vehicleType: 'FOOT', distance: 2000, basePrice: 0, baseTurn: 5, riskScale: 1.15},
  {
    fromCityId: 4,
    toCityId: 5,
    vehicleType: 'PLANE',
    distance: 1900,
    basePrice: 380,
    baseTurn: 2,
    requiresHqLevel: 3,
    priceScale: 1.08,
    riskScale: 1.25,
  },
  {
    fromCityId: 5,
    toCityId: 4,
    vehicleType: 'PLANE',
    distance: 1900,
    basePrice: 380,
    baseTurn: 2,
    requiresHqLevel: 3,
    priceScale: 1.08,
    riskScale: 1.25,
  },
];

export const TRIP_EVENTS: TripEventDef[] = [
  {weight: 25, code: 'NONE', title: '一切顺利', body: '本回合平稳推进，没有任何意外。'},
  {
    weight: 25,
    code: 'CLUE_FOUND',
    title: '偶遇线索',
    body: '获得线索 +1 · 解锁支线',
    interactive: true,
    choices: [{key: 'take', label: '收下！', effect: {clue: 1, label: '获得线索 +1'}}],
  },
  {weight: 20, code: 'TROUBLE', title: '小麻烦', body: '补给磕碰，损失 10 金币。', effect: {coin: -10}},
  {
    weight: 15,
    code: 'STORM',
    title: '风暴来袭',
    body: '航线关闭 · 延误 +1 回合',
    interactive: true,
    choices: [
      {key: 'wait', label: '等待放晴', effect: {delay: 1, label: '等待放晴，延误 1 回合'}},
      {key: 'sea', label: '改走海路', requireCoin: 50, effect: {coin: -50, label: '改走海路，支付差额 ¥50'}},
    ],
  },
  {
    weight: 10,
    code: 'PIRATE',
    title: '海盗拦截',
    body: '护卫战斗 · 胜利 +30 金币',
    interactive: true,
    choices: [
      {key: 'fight', label: '迎战', effect: {coin: 30, label: '战斗胜利，+30 金币'}},
      {key: 'detour', label: '绕路 -¥50', requireCoin: 50, effect: {coin: -50, label: '绕路避开，-50 金币'}},
    ],
  },
  {weight: 5, code: 'HIDDEN', title: '隐藏支线', body: '发现一条隐藏支线，解锁额外奖励。', effect: {star: 1, clue: 2}},
];

const ALL_CITIES = MOCK_REGIONS.flatMap((region) => region.cities);

export function getMockCities(): CityVO[] {
  return ALL_CITIES.map((city) => ({...city}));
}

export function cityById(cityId: number): CityVO | undefined {
  return ALL_CITIES.find((city) => city.id === cityId);
}

export function getMockMapView(viewType: MapViewType): MapViewVO {
  const layers: MapViewLayerItem[] = MOCK_ROUTES.map((route) => ({
    layerType: `${viewType}_ROUTE`,
    fromCityId: route.fromCityId,
    toCityId: route.toCityId,
    payload: JSON.stringify({
      vehicleType: route.vehicleType,
      distance: route.distance,
      basePrice: route.basePrice,
      baseTurn: route.baseTurn,
    }),
  }));
  return {
    viewType,
    cities: getMockCities(),
    layers,
  };
}
