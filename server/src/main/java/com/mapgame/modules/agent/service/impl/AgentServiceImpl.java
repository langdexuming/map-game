package com.mapgame.modules.agent.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mapgame.common.api.ResultCode;
import com.mapgame.common.config.Configuration;
import com.mapgame.common.exception.BizException;
import com.mapgame.modules.agent.entity.Agent;
import com.mapgame.modules.agent.mapper.AgentMapper;
import com.mapgame.modules.agent.query.AgentListQuery;
import com.mapgame.modules.agent.query.AgentRestQuery;
import com.mapgame.modules.agent.service.AgentService;
import com.mapgame.modules.agent.vo.AgentVO;
import com.mapgame.modules.player.entity.Player;
import com.mapgame.modules.player.mapper.PlayerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 特工服务实现
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentServiceImpl implements AgentService {

    private final AgentMapper agentMapper;
    private final PlayerMapper playerMapper;

    @Override
    public List<AgentVO> listAgents(AgentListQuery query) {
        if (Objects.isNull(query) || Objects.isNull(query.getPlayerId())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "playerId 不能为空");
        }
        QueryWrapper<Agent> wrapper = new QueryWrapper<>();
        wrapper.eq("player_id", query.getPlayerId());
        if (query.getAgentClass() != null && !query.getAgentClass().isBlank()) {
            wrapper.eq("agent_class", query.getAgentClass());
        }
        if (query.getMinLevel() != null) {
            wrapper.ge("level", query.getMinLevel());
        }
        wrapper.orderByAsc("id");
        List<Agent> agents = agentMapper.selectList(wrapper);
        List<AgentVO> result = new ArrayList<>(agents.size());
        for (Agent agent : agents) {
            result.add(toVO(agent));
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AgentVO restAgent(Long agentId, AgentRestQuery query) {
        if (Objects.isNull(agentId) || Objects.isNull(query) || Objects.isNull(query.getPlayerId())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "agentId、playerId 不能为空");
        }
        Agent agent = loadOwnedAgent(agentId, query.getPlayerId());
        if ("IN_TRANSIT".equals(agent.getStatus())) {
            throw new BizException(ResultCode.BIZ_AGENT_BUSY, "特工在途中，无法休整");
        }
        boolean atHq = Boolean.TRUE.equals(query.getAtHq());
        if (!atHq) {
            int cost = Configuration.AGENT_REST_COIN_COST;
            Player player = playerMapper.selectById(query.getPlayerId());
            if (Objects.isNull(player) || (player.getCoin() == null ? 0 : player.getCoin()) < cost) {
                throw new BizException(ResultCode.BIZ_NOT_ENOUGH_COIN);
            }
            player.setCoin(player.getCoin() - cost);
            playerMapper.updateById(player);
        }
        int reduce = Configuration.AGENT_REST_FATIGUE_PER_TURN;
        int fatigue = Objects.isNull(agent.getFatigue()) ? 0 : agent.getFatigue();
        int nextFatigue = Math.max(0, fatigue - reduce);
        agent.setFatigue(nextFatigue);
        agent.setStatus(resolveStatus(nextFatigue));
        agentMapper.updateById(agent);
        log.info("特工休整 agentId={} fatigue {} -> {}", agentId, fatigue, nextFatigue);
        return toVO(agent);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void advanceRestingAgents(Integer currentTurn) {
        QueryWrapper<Agent> wrapper = new QueryWrapper<>();
        wrapper.eq("status", "RESTING");
        List<Agent> resting = agentMapper.selectList(wrapper);
        int reduce = Configuration.AGENT_REST_FATIGUE_PER_TURN;
        for (Agent agent : resting) {
            int fatigue = Objects.isNull(agent.getFatigue()) ? 0 : agent.getFatigue();
            int nextFatigue = Math.max(0, fatigue - reduce);
            agent.setFatigue(nextFatigue);
            agent.setStatus(resolveStatus(nextFatigue));
            agentMapper.updateById(agent);
        }
        if (!resting.isEmpty()) {
            log.info("回合 {} 自动休整 {} 名特工", currentTurn, resting.size());
        }
    }

    private Agent loadOwnedAgent(Long agentId, Long playerId) {
        Agent agent = agentMapper.selectById(agentId);
        if (Objects.isNull(agent) || !Objects.equals(agent.getPlayerId(), playerId)) {
            throw new BizException(ResultCode.BIZ_AGENT_NOT_FOUND);
        }
        return agent;
    }

    private String resolveStatus(int fatigue) {
        if (fatigue >= 70) {
            return "NEED_REST";
        }
        if (fatigue >= 40) {
            return "RESTING";
        }
        return "IDLE";
    }

    private AgentVO toVO(Agent agent) {
        AgentVO vo = new AgentVO();
        BeanUtil.copyProperties(agent, vo);
        if (vo.getFatigue() == null) {
            vo.setFatigue(0);
        }
        if (vo.getStatus() == null) {
            vo.setStatus("IDLE");
        }
        return vo;
    }
}
