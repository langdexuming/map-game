import type {VehicleType} from './mockData';

export const FATIGUE_PER_VEHICLE: Record<VehicleType, number> = {
  PLANE: 15,
  TRAIN: 10,
  SHIP: 8,
  TRUCK: 12,
  FOOT: 20,
};

export function calcTripFatigue(vehicleChain: string[]): number {
  return vehicleChain.reduce((sum, vehicle) => sum + (FATIGUE_PER_VEHICLE[vehicle as VehicleType] ?? 10), 0);
}

export function fatigueBarClass(fatigue: number): string {
  if (fatigue >= 70) {
    return 'fatigue-fill-high';
  }
  if (fatigue >= 40) {
    return 'fatigue-fill-mid';
  }
  return 'fatigue-fill-low';
}

export function mustRestBeforeTravel(fatigue: number): boolean {
  return fatigue >= 70;
}

export function restFatiguePerTurn(atHq: boolean): number {
  return 30;
}

export function predictFatigueAfterTrip(current: number, tripFatigue: number): number {
  return Math.min(100, current + tripFatigue);
}

export function fatigueDebuffAfterTrip(current: number, tripFatigue: number): string | null {
  const next = predictFatigueAfterTrip(current, tripFatigue);
  if (next >= 70) {
    return '抵达后需休整';
  }
  if (next >= 40) {
    return '抵达后机敏-1';
  }
  return null;
}

export function restCoinCost(atHq: boolean): number {
  return atHq ? 0 : 10;
}
