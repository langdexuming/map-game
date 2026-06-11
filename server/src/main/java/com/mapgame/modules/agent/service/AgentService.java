package com.mapgame.modules.agent.service;

import com.mapgame.modules.agent.query.AgentListQuery;
import com.mapgame.modules.agent.query.AgentRestQuery;
import com.mapgame.modules.agent.vo.AgentVO;

import java.util.List;

/**
 * 特工服务
 * @author make java
 * @since 2026-06-11
 */
public interface AgentService {

    /**
     * 查询玩家特工列表
     * @param query 查询参数
     * @return 特工列表
     */
    List<AgentVO> listAgents(AgentListQuery query);

    /**
     * 特工休整，降低疲劳
     * @param agentId 特工ID
     * @param query 休整参数
     * @return 更新后的特工
     */
    AgentVO restAgent(Long agentId, AgentRestQuery query);

    /**
     * 回合推进时处理休整中特工
     * @param currentTurn 当前回合
     */
    void advanceRestingAgents(Integer currentTurn);
}
