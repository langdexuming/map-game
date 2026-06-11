import type {VehicleType} from './mockData';
import {calcTripFatigue} from './fatigue';
import type {TripPlan} from './travel';

export interface ScheduleSlot {
  offset: number;
  label: string;
  tag?: string;
  discount?: number;
  peak?: boolean;
  vehicleOverride?: VehicleType;
}

export function buildScheduleSlots(basePrice: number): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [
    {offset: 1, label: '早鸟票', tag: '早鸟8折', discount: 0.8},
    {offset: 3, label: '标准票'},
    {offset: 4, label: '慢船票', vehicleOverride: 'SHIP'},
    {offset: 6, label: '标准票'},
    {offset: 9, label: '旺季票', peak: true},
  ];
  return slots.map((slot) => ({
    ...slot,
    label: slot.vehicleOverride === 'SHIP' ? `慢船票 ¥${Math.round(basePrice * 0.38)}` : slot.label,
  }));
}

export function slotPrice(basePrice: number, slot: ScheduleSlot, lastMinute: boolean): number {
  let price = basePrice;
  if (slot.vehicleOverride === 'SHIP') {
    price = Math.round(basePrice * 0.38);
  }
  if (slot.discount != null) {
    price = Math.round(price * slot.discount);
  }
  if (slot.peak) {
    price = Math.round(price * 1.3);
  }
  if (lastMinute && slot.offset <= 1) {
    price = Math.round(price * 1.5);
  }
  return Math.max(0, price);
}

export function applySlotToPlan(plan: TripPlan, slot: ScheduleSlot): TripPlan {
  if (slot.vehicleOverride !== 'SHIP') {
    return plan;
  }
  const vehicleChain = plan.vehicleChain.map((vehicle, index) =>
    index === plan.vehicleChain.length - 1 && vehicle === 'PLANE' ? 'SHIP' : vehicle,
  );
  const fatigueCost = calcTripFatigue(vehicleChain);
  return {
    ...plan,
    vehicleChain,
    totalTurn: plan.totalTurn + 1,
    fuelCost: Math.max(0, plan.fuelCost - 2),
    fatigueCost,
    bonusDesc: `${plan.bonusDesc} · 慢船换乘`,
  };
}

export function nextDepartureOffset(currentTurn: number, bookedTrips: Array<{departureTurn: number}>): number {
  const upcoming = bookedTrips
    .map((trip) => trip.departureTurn - currentTurn)
    .filter((delta) => delta > 0)
    .sort((a, b) => a - b)[0];
  if (upcoming != null) {
    return upcoming;
  }
  return 2;
}
