export interface PassportState {
  stamps: Record<number, boolean>;
  visas: Record<number, boolean>;
  mileage: number;
  goldenCoating: boolean;
  specialStamps: Record<string, boolean>;
}

export const VISA_REQUIREMENTS: Record<number, {clue?: number; star?: number}> = {
  3: {clue: 30},
  5: {star: 200},
};

export const VISA_GATED_REGIONS = [3, 5] as const;

export function regionRequiresVisa(regionId: number): boolean {
  return (VISA_GATED_REGIONS as readonly number[]).includes(regionId);
}

export const MILEAGE_GOAL = 2000;
export const STAMP_COUNT_GOAL = 5;

export function createInitialPassport(): PassportState {
  return {
    stamps: {},
    visas: {},
    mileage: 0,
    goldenCoating: false,
    specialStamps: {},
  };
}

export function applySpecialStamp(state: PassportState, key: string): PassportState {
  if (state.specialStamps[key]) {
    return state;
  }
  return {
    ...state,
    specialStamps: {...state.specialStamps, [key]: true},
  };
}

export function stampCount(state: PassportState): number {
  return Object.values(state.stamps).filter(Boolean).length;
}

export function hasGlobalPass(state: PassportState): boolean {
  return stampCount(state) >= STAMP_COUNT_GOAL;
}

export function passportTicketDiscount(state: PassportState): number {
  return hasGlobalPass(state) ? 0.1 : 0;
}

export function canPurchaseVisa(
  regionId: number,
  resources: {clue: number; star: number},
  state: PassportState,
): boolean {
  if (state.visas[regionId]) {
    return false;
  }
  const req = VISA_REQUIREMENTS[regionId];
  if (!req) {
    return false;
  }
  if (req.clue != null && resources.clue < req.clue) {
    return false;
  }
  if (req.star != null && resources.star < req.star) {
    return false;
  }
  return true;
}

export function applyMileage(state: PassportState, distance: number): PassportState {
  const mileage = state.mileage + distance;
  return {
    ...state,
    mileage,
    goldenCoating: state.goldenCoating || mileage >= MILEAGE_GOAL,
  };
}

export function applyStamp(state: PassportState, regionId: number): PassportState {
  if (state.stamps[regionId]) {
    return state;
  }
  return {
    ...state,
    stamps: {...state.stamps, [regionId]: true},
  };
}
