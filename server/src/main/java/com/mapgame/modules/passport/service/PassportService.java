package com.mapgame.modules.passport.service;

import com.mapgame.modules.passport.query.PassportVisaPurchaseQuery;
import com.mapgame.modules.passport.vo.PassportVO;
import com.mapgame.modules.travel.vo.TripPlanVO;

import java.util.Set;

/**
 * 护照服务
 * @author make java
 * @since 2026-06-11
 */
public interface PassportService {

    /**
     * 获取玩家护照
     * @param playerId 玩家ID
     * @return 护照视图
     */
    PassportVO getPassport(Long playerId);

    /**
     * 购买区域签证
     * @param query 购买参数
     * @return 更新后的护照
     */
    PassportVO purchaseVisa(PassportVisaPurchaseQuery query);

    /**
     * 行程到达时盖章与里程
     * @param playerId 玩家ID
     * @param tripId 行程ID
     * @param regionId 目的地区域
     * @param distance 里程
     * @param plan 方案快照
     */
    void onTripArrived(Long playerId, Long tripId, Long regionId, int distance, TripPlanVO plan);

    /**
     * 已办理签证的区域ID集合
     * @param playerId 玩家ID
     * @return 区域ID集合
     */
    Set<Long> listVisaRegionIds(Long playerId);

    /**
     * 订票折扣
     * @param playerId 玩家ID
     * @return 折扣比例 0-1
     */
    double ticketDiscount(Long playerId);
}
