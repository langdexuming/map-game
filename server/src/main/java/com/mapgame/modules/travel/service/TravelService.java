package com.mapgame.modules.travel.service;

import com.mapgame.modules.travel.query.TripBookQuery;
import com.mapgame.modules.travel.query.TripEventResolveQuery;
import com.mapgame.modules.travel.query.TripInTransitQuery;
import com.mapgame.modules.travel.query.TripPlanQuery;
import com.mapgame.modules.travel.query.TripRescheduleQuery;
import com.mapgame.modules.travel.vo.TripEventPushVO;
import com.mapgame.modules.travel.vo.TripPlanVO;
import com.mapgame.modules.travel.vo.TripRefundVO;
import com.mapgame.modules.travel.vo.TripVO;

import java.util.List;

/**
 * 出行服务
 * @author make java
 * @since 2026-06-11
 */
public interface TravelService {

    /**
     * 计算多套行程方案
     * @param query 规划参数
     * @return 方案列表
     */
    List<TripPlanVO> planTrip(TripPlanQuery query);

    /**
     * 订票创建行程
     * @param query 订票参数
     * @return 行程
     */
    TripVO bookTrip(TripBookQuery query);

    /**
     * 退票
     * @param tripId 行程ID
     * @param playerId 玩家ID
     * @return 退款信息
     */
    TripRefundVO cancelTrip(Long tripId, Long playerId);

    /**
     * 查询玩家在途/已订行程
     * @param query 查询参数
     * @return 行程列表
     */
    List<TripVO> listActiveTrips(TripInTransitQuery query);

    /**
     * 回合推进时结算行程
     * @param worldId 世界ID
     * @param currentTurn 当前回合
     */
    void advanceTrips(Long worldId, Integer currentTurn);

    /**
     * 改签已订行程
     * @param tripId 行程ID
     * @param query 改签参数
     * @return 更新后的行程
     */
    TripVO rescheduleTrip(Long tripId, TripRescheduleQuery query);

    /**
     * 决议交互式路上事件
     * @param tripId 行程ID
     * @param query 决议参数
     * @return 更新后的行程
     */
    TripVO resolveTripEvent(Long tripId, TripEventResolveQuery query);

    /**
     * 查询待处理路上事件
     * @param playerId 玩家ID
     * @return 事件列表
     */
    List<TripEventPushVO> listPendingEvents(Long playerId);
}
