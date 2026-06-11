package com.mapgame.modules.passport.controller;

import com.mapgame.common.api.Result;
import com.mapgame.modules.passport.query.PassportVisaPurchaseQuery;
import com.mapgame.modules.passport.service.PassportService;
import com.mapgame.modules.passport.vo.PassportVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 护照接口
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@RestController
@RequestMapping("/passport")
@RequiredArgsConstructor
@Tag(name = "护照 · 印章签证")
public class PassportController {

    private final PassportService passportService;

    /**
     * 获取玩家护照
     * @param playerId 玩家ID
     * @return 护照视图
     */
    @GetMapping("/{playerId}")
    @Operation(summary = "获取玩家护照")
    public Result<PassportVO> getPassport(@Parameter(description = "玩家ID") @PathVariable Long playerId) {
        return Result.ok(passportService.getPassport(playerId));
    }

    /**
     * 购买区域签证
     * @param query 购买参数
     * @return 更新后的护照
     */
    @PostMapping("/visa")
    @Operation(summary = "购买区域签证")
    public Result<PassportVO> purchaseVisa(@Valid @RequestBody PassportVisaPurchaseQuery query) {
        return Result.ok(passportService.purchaseVisa(query));
    }
}
