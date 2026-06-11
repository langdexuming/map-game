/**
 * S2 特工接口封装
 * @author make java
 * @since 2026-06-11
 */
import { HttpClient } from './HttpClient';
import { AgentVO } from './types';

export interface AgentListQuery {
    playerId: number;
    agentClass?: string;
    minLevel?: number;
}

export interface AgentRestQuery {
    playerId: number;
    atHq?: boolean;
}

export class AgentApi {

    static listAgents(query: AgentListQuery): Promise<AgentVO[]> {
        return HttpClient.post<AgentVO[]>('/agent/list', query);
    }

    static restAgent(agentId: number, query: AgentRestQuery): Promise<AgentVO> {
        return HttpClient.post<AgentVO>(`/agent/${agentId}/rest`, query);
    }
}
