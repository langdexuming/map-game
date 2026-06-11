/**
 * S2 特工接口
 */
import {postJson} from './http';
import type {AgentListQuery, AgentRestQuery, AgentVO} from './types';

export function listAgents(query: AgentListQuery): Promise<AgentVO[]> {
  return postJson<AgentVO[]>('/agent/list', query);
}

export function restAgent(agentId: number, body: AgentRestQuery): Promise<AgentVO> {
  return postJson<AgentVO>(`/agent/${agentId}/rest`, body);
}
