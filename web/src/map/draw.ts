import type {CityVO} from '../api/types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function routeSignature(fromCityId: number, toCityId: number, vehicleType: string): string {
  return `${Math.min(fromCityId, toCityId)}-${Math.max(fromCityId, toCityId)}-${vehicleType}`;
}

export function cityRoutePath(
  fromCity: CityVO,
  toCity: CityVO,
  project: (lng: number, lat: number) => {xPct: number; yPct: number},
): string {
  const from = project(fromCity.lng, fromCity.lat);
  const to = project(toCity.lng, toCity.lat);
  const mx = (from.xPct + to.xPct) / 2;
  const my = (from.yPct + to.yPct) / 2;
  const bend = clamp(Math.abs(to.xPct - from.xPct) * 0.18 + 6, 6, 18);
  return `M ${from.xPct} ${from.yPct} Q ${mx} ${Math.max(4, my - bend)} ${to.xPct} ${to.yPct}`;
}

export function movingPoint(
  fromCity: CityVO,
  toCity: CityVO,
  project: (lng: number, lat: number) => {xPct: number; yPct: number},
  progress: number,
): {xPct: number; yPct: number} {
  const from = project(fromCity.lng, fromCity.lat);
  const to = project(toCity.lng, toCity.lat);
  const mx = (from.xPct + to.xPct) / 2;
  const my = (from.yPct + to.yPct) / 2;
  const bend = clamp(Math.abs(to.xPct - from.xPct) * 0.18 + 6, 6, 18);
  const t = clamp(progress, 0, 1);
  const xPct = (1 - t) * (1 - t) * from.xPct + 2 * (1 - t) * t * mx + t * t * to.xPct;
  const yPct = (1 - t) * (1 - t) * from.yPct + 2 * (1 - t) * t * Math.max(4, my - bend) + t * t * to.yPct;
  return {xPct, yPct};
}
