import type {RouteDef} from './mockData';
import {routeSignature} from '../map/draw';

export interface WeatherState {
  cycleTurn: number;
  blockedRouteKeys: string[];
  previewMessage?: string;
  activeMessage?: string;
}

export function createInitialWeather(): WeatherState {
  return {cycleTurn: 0, blockedRouteKeys: []};
}

export function shouldRefreshWeather(turn: number): boolean {
  return turn > 0 && turn % 5 === 0;
}

export function refreshWeather(turn: number, routes: RouteDef[]): WeatherState {
  const planeRoutes = routes.filter((route) => route.vehicleType === 'PLANE');
  const pickCount = Math.min(2, Math.max(1, Math.floor(planeRoutes.length / 4)));
  const shuffled = [...planeRoutes].sort(() => Math.random() - 0.5);
  const blocked = shuffled.slice(0, pickCount).map((route) =>
    routeSignature(route.fromCityId, route.toCityId, route.vehicleType),
  );
  return {
    cycleTurn: turn,
    blockedRouteKeys: blocked,
    previewMessage: '风暴即将影响部分北方航线，请提前规划改签。',
    activeMessage: '风暴关闭部分航线，受影响航段已变灰。',
  };
}

export function isRouteBlocked(route: RouteDef, weather: WeatherState): boolean {
  const key = routeSignature(route.fromCityId, route.toCityId, route.vehicleType);
  return weather.blockedRouteKeys.includes(key);
}
