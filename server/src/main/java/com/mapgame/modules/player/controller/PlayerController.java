package com.mapgame.modules.player.controller;

import com.mapgame.common.api.Result;
import com.mapgame.modules.player.service.PlayerService;
import com.mapgame.modules.player.vo.PlayerVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 玩家接口
 * @author make java
 * @since 2026-06-11
 */
@RestController
@RequestMapping("/player")
@RequiredArgsConstructor
@Tag(name = "玩家资源")
public class PlayerController {

    private final PlayerService playerService;

    /**
     * 获取玩家资源
     * @param playerId 玩家ID
     * @return 玩家视图
     */
    @GetMapping("/{playerId}")
    @Operation(summary = "获取玩家资源")
    public Result<PlayerVO> getPlayer(@Parameter(description = "玩家ID") @PathVariable Long playerId) {
        return Result.ok(playerService.getPlayer(playerId));
    }
}
