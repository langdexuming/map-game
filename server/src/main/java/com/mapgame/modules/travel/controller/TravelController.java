package com.mapgame.modules.travel.controller;

import com.mapgame.common.api.Result;
import com.mapgame.modules.travel.query.TripBookQuery;
import com.mapgame.modules.travel.query.TripEventResolveQuery;
import com.mapgame.modules.travel.query.TripInTransitQuery;
import com.mapgame.modules.travel.query.TripPlanQuery;
import com.mapgame.modules.travel.query.TripRescheduleQuery;
import com.mapgame.modules.travel.service.TravelService;
import com.mapgame.modules.travel.vo.TripEventPushVO;
import com.mapgame.modules.travel.vo.TripPlanVO;
import com.mapgame.modules.travel.vo.TripRefundVO;
import com.mapgame.modules.travel.vo.TripVO;
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
 * 出行接口
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@RestController
@RequestMapping("/travel")
@RequiredArgsConstructor
@Tag(name = "S4 · 出行")
public class TravelController {

    private final TravelService travelService;

    /**
     * 计算多套行程方案
     * @param query 规划参数
     * @return 方案列表
     */
    @PostMapping("/plan")
    @Operation(summary = "计算 3 套行程方案")
    public Result<List<TripPlanVO>> planTrip(@Valid @RequestBody TripPlanQuery query) {
        return Result.ok(travelService.planTrip(query));
    }

    /**
     * 订票创建行程
     * @param query 订票参数
     * @return 行程
     */
    @PostMapping("/book")
    @Operation(summary = "订票创建 Trip")
    public Result<TripVO> bookTrip(@Valid @RequestBody TripBookQuery query) {
        return Result.ok(travelService.bookTrip(query));
    }

    /**
     * 退票
     * @param tripId 行程ID
     * @param playerId 玩家ID
     * @return 退款信息
     */
    @PostMapping("/trip/{tripId}/cancel")
    @Operation(summary = "退票（扣 30% 手续费）")
    public Result<TripRefundVO> cancelTrip(
            @Parameter(description = "行程ID") @PathVariable Long tripId,
            @Parameter(description = "玩家ID") @RequestParam Long playerId) {
        return Result.ok(travelService.cancelTrip(tripId, playerId));
    }

    /**
     * 查询活跃行程
     * @param query 查询参数
     * @return 行程列表
     */
    @PostMapping("/in-transit")
    @Operation(summary = "查询已订/在途行程")
    public Result<List<TripVO>> listActiveTrips(@Valid @RequestBody TripInTransitQuery query) {
        return Result.ok(travelService.listActiveTrips(query));
    }

    /**
     * 改签已订行程
     * @param tripId 行程ID
     * @param query 改签参数
     * @return 更新后的行程
     */
    @PostMapping("/trip/{tripId}/reschedule")
    @Operation(summary = "改签已订行程（30% 手续费）")
    public Result<TripVO> rescheduleTrip(
            @Parameter(description = "行程ID") @PathVariable Long tripId,
            @Valid @RequestBody TripRescheduleQuery query) {
        return Result.ok(travelService.rescheduleTrip(tripId, query));
    }

    /**
     * 决议交互式路上事件
     * @param tripId 行程ID
     * @param query 决议参数
     * @return 更新后的行程
     */
    @PostMapping("/trip/{tripId}/resolve-event")
    @Operation(summary = "决议路上事件")
    public Result<TripVO> resolveTripEvent(
            @Parameter(description = "行程ID") @PathVariable Long tripId,
            @Valid @RequestBody TripEventResolveQuery query) {
        return Result.ok(travelService.resolveTripEvent(tripId, query));
    }

    /**
     * 查询待处理路上事件
     * @param playerId 玩家ID
     * @return 事件列表
     */
    @GetMapping("/pending-events/{playerId}")
    @Operation(summary = "查询待处理路上事件")
    public Result<List<TripEventPushVO>> listPendingEvents(
            @Parameter(description = "玩家ID") @PathVariable Long playerId) {
        return Result.ok(travelService.listPendingEvents(playerId));
    }
}
