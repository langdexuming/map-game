/**
 * 后端 VO 与前端游戏状态映射
 */
import type {Agent} from '../game/agents';
import type {PassportState} from '../game/passport';
import type {AgentVO, PassportVO} from './types';

function mapAgentStatus(status?: string): Agent['status'] {
  if (status === 'IN_TRANSIT') {
    return 'IN_TRANSIT';
  }
  if (status === 'NEED_REST') {
    return 'NEED_REST';
  }
  if (status === 'RESTING') {
    return 'RESTING';
  }
  return 'STANDBY';
}

export function passportVoToState(vo: PassportVO): PassportState {
  const specialStamps: Record<string, boolean> = {};
  for (const key of vo.specialStamps ?? []) {
    specialStamps[key] = true;
  }
  return {
    stamps: vo.stamps ?? {},
    visas: vo.visas ?? {},
    mileage: vo.mileage ?? 0,
    goldenCoating: vo.goldenCoating ?? false,
    specialStamps,
  };
}

export function mergeAgentsFromVo(local: Agent[], remote: AgentVO[]): Agent[] {
  const remoteMap = new Map(remote.map((agent) => [agent.id, agent]));
  return local.map((agent) => {
    const synced = remoteMap.get(agent.id);
    if (!synced) {
      return agent;
    }
    return {
      ...agent,
      fatigue: synced.fatigue ?? agent.fatigue,
      status: mapAgentStatus(synced.status),
      assignedTripId: synced.assignedTripId,
    };
  });
}
