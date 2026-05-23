package com.mapgame.modules.world.controller;

import com.mapgame.common.api.Result;
import com.mapgame.modules.world.enums.MapViewType;
import com.mapgame.modules.world.query.CityLevelUpgradeQuery;
import com.mapgame.modules.world.query.MapViewQuery;
import com.mapgame.modules.world.query.WorldHqLevelUpgradeQuery;
import com.mapgame.modules.world.service.WorldService;
import com.mapgame.modules.world.vo.CityVO;
import com.mapgame.modules.world.vo.MapViewVO;
import com.mapgame.modules.world.vo.RegionVO;
import com.mapgame.modules.world.vo.WorldBootstrapVO;
import com.mapgame.modules.world.vo.WorldVO;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 世界地图接口
 * @author make java
 * @since 2026-05-01
 */
@Slf4j
@RestController
@RequestMapping("/world")
@RequiredArgsConstructor
@Tag(name = "S1 · 世界地图")
public class WorldController {

    private final WorldService worldService;

    /**
     * 启动聚合接口：一次返回 world + regions + 默认视图，供前端首屏初始化
     * @param worldId 世界ID
     * @param viewType 视图类型，缺省 TRAVEL
     */
    @GetMapping("/{worldId}/bootstrap")
    @Operation(summary = "首屏初始化：world + regions + 默认视图")
    public Result<WorldBootstrapVO> bootstrap(
            @Parameter(description = "世界ID") @PathVariable Long worldId,
            @Parameter(description = "默认视图类型，缺省 TRAVEL") @RequestParam(required = false) MapViewType viewType) {
        return Result.ok(worldService.bootstrap(worldId, viewType));
    }

    /**
     * 获取世界基础信息
     * @param worldId 世界ID
     * @return 世界VO
     */
    @GetMapping("/{worldId}")
    @Operation(summary = "获取世界基础信息")
    public Result<WorldVO> getWorld(@Parameter(description = "世界ID") @PathVariable Long worldId) {
        return Result.ok(worldService.getWorld(worldId));
    }

    /**
     * 列出该世界全部大陆 + 城市
     * @param worldId 世界ID
     * @return 大陆列表
     */
    @GetMapping("/{worldId}/regions")
    @Operation(summary = "列出该世界全部大陆 + 城市")
    public Result<List<RegionVO>> listRegions(@PathVariable Long worldId) {
        return Result.ok(worldService.listRegionsWithCities(worldId));
    }

    /**
     * 切换视图返回视图增强数据
     * @param query 查询参数
     * @return 视图VO
     */
    @PostMapping("/view")
    @Operation(summary = "切换地图视图")
    public Result<MapViewVO> getMapView(@Valid @RequestBody MapViewQuery query) {
        return Result.ok(worldService.getMapView(query));
    }

    /**
     * 城市等级提升一级（持久化）
     * @param worldId 世界ID
     * @param cityId 城市ID
     * @param query 升级参数
     * @return 更新后的城市信息
     */
    @PostMapping("/{worldId}/cities/{cityId}/level")
    @Operation(summary = "城市等级提升一级")
    public Result<CityVO> upgradeCityLevel(
            @Parameter(description = "世界ID") @PathVariable Long worldId,
            @Parameter(description = "城市ID") @PathVariable Long cityId,
            @Valid @RequestBody CityLevelUpgradeQuery query) {
        return Result.ok(worldService.upgradeCityLevel(worldId, cityId, query));
    }

    /**
     * 推进世界回合数 +1
     * @param worldId 世界ID
     * @return 更新后的世界信息
     */
    @PostMapping("/{worldId}/turn")
    @Operation(summary = "推进世界回合")
    public Result<WorldVO> advanceWorldTurn(@Parameter(description = "世界ID") @PathVariable Long worldId) {
        return Result.ok(worldService.advanceWorldTurn(worldId));
    }

    /**
     * 主基地等级提升一级（持久化）
     * @param worldId 世界ID
     * @param query 升级参数
     * @return 更新后的世界信息
     */
    @PostMapping("/{worldId}/hq/level")
    @Operation(summary = "主基地等级提升一级")
    public Result<WorldVO> upgradeWorldHq(
            @Parameter(description = "世界ID") @PathVariable Long worldId,
            @Valid @RequestBody WorldHqLevelUpgradeQuery query) {
        return Result.ok(worldService.upgradeWorldHq(worldId, query));
    }
}
