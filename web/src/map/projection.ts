/**
 * 将 CityVO 经纬度映射到地图容器内的百分比坐标
 */
import type {CityVO} from '../api/types';

export type ProjectFn = (lng: number, lat: number) => {xPct: number; yPct: number};

export function buildCityProjection(cities: CityVO[]): ProjectFn | null {
  if (cities.length === 0) {
    return null;
  }
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const c of cities) {
    const lng = Number(c.lng);
    const lat = Number(c.lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const pad = 0.1;
  const lngSpan = Math.max(maxLng - minLng, 1e-6);
  const latSpan = Math.max(maxLat - minLat, 1e-6);
  const minLngP = minLng - lngSpan * pad;
  const maxLngP = maxLng + lngSpan * pad;
  const minLatP = minLat - latSpan * pad;
  const maxLatP = maxLat + latSpan * pad;
  const spanLng = maxLngP - minLngP;
  const spanLat = maxLatP - minLatP;
  return (lng: number, lat: number) => ({
    xPct: ((lng - minLngP) / spanLng) * 100,
    yPct: ((maxLatP - lat) / spanLat) * 100,
  });
}

export function regionCentroid(cities: CityVO[]): {lng: number; lat: number} | null {
  if (cities.length === 0) {
    return null;
  }
  let sumLng = 0;
  let sumLat = 0;
  for (const c of cities) {
    sumLng += Number(c.lng);
    sumLat += Number(c.lat);
  }
  const n = cities.length;
  return {lng: sumLng / n, lat: sumLat / n};
}
