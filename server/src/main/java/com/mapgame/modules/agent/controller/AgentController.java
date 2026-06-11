package com.mapgame.modules.agent.controller;

import com.mapgame.common.api.Result;
import com.mapgame.modules.agent.query.AgentListQuery;
import com.mapgame.modules.agent.query.AgentRestQuery;
import com.mapgame.modules.agent.service.AgentService;
import com.mapgame.modules.agent.vo.AgentVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 特工接口
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@RestController
@RequestMapping("/agent")
@RequiredArgsConstructor
@Tag(name = "S2 · 特工")
public class AgentController {

    private final AgentService agentService;

    /**
     * 查询玩家特工列表
     * @param query 查询参数
     * @return 特工列表
     */
    @PostMapping("/list")
    @Operation(summary = "查询玩家特工列表")
    public Result<List<AgentVO>> listAgents(@Valid @RequestBody AgentListQuery query) {
        return Result.ok(agentService.listAgents(query));
    }

    /**
     * 特工休整
     * @param agentId 特工ID
     * @param query 休整参数
     * @return 更新后的特工
     */
    @PostMapping("/{agentId}/rest")
    @Operation(summary = "特工休整，降低疲劳")
    public Result<AgentVO> restAgent(
            @Parameter(description = "特工ID") @PathVariable Long agentId,
            @Valid @RequestBody AgentRestQuery query) {
        return Result.ok(agentService.restAgent(agentId, query));
    }
}
