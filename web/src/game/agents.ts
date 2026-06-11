import type {VehicleType} from './mockData';
import {VEHICLE_ICON} from './mockData';

export type AgentStatus = 'STANDBY' | 'IN_TRANSIT' | 'NEED_REST' | 'RESTING';

export interface Agent {
  id: number;
  name: string;
  title: string;
  stamina: number;
  maxStamina: number;
  guard: number;
  wit: number;
  fatigue: number;
  status: AgentStatus;
  assignedTripId?: number;
  vehicleSticker?: string;
  turnsRemaining?: number;
}

export const DEFAULT_AGENTS: Agent[] = [
  {id: 1, name: '阿尔法·小奇', title: '见习特工', stamina: 4, maxStamina: 5, guard: 2, wit: 3, fatigue: 15, status: 'STANDBY'},
  {id: 2, name: '乐乐', title: '见习特工', stamina: 4, maxStamina: 5, guard: 2, wit: 2, fatigue: 10, status: 'STANDBY'},
  {id: 3, name: '妮妮', title: '见习特工', stamina: 3, maxStamina: 5, guard: 3, wit: 3, fatigue: 8, status: 'STANDBY'},
  {id: 4, name: '阳阳', title: '见习特工', stamina: 5, maxStamina: 5, guard: 1, wit: 2, fatigue: 12, status: 'STANDBY'},
  {id: 5, name: '米米', title: '见习特工', stamina: 4, maxStamina: 5, guard: 2, wit: 4, fatigue: 5, status: 'STANDBY'},
];

export function cloneDefaultAgents(): Agent[] {
  return DEFAULT_AGENTS.map((agent) => ({...agent}));
}

export function vehicleSticker(type: VehicleType | string | undefined): string | undefined {
  if (!type) {
    return undefined;
  }
  return VEHICLE_ICON[type as VehicleType] ?? undefined;
}

export function effectiveWit(agent: Agent): number {
  if (agent.fatigue >= 40 && agent.fatigue < 70) {
    return Math.max(0, agent.wit - 1);
  }
  if (agent.fatigue >= 70) {
    return Math.max(0, agent.wit - 1);
  }
  return agent.wit;
}
