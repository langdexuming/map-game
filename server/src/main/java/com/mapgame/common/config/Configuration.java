package com.mapgame.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 全局配置统一管理
 * 团队规范: 所有配置项必须集中在 Configuration 类, 不允许业务代码直接 @Value
 * @author make java
 * @since 2026-05-01
 */
@Component
public class Configuration {

    /** 队伍最大人数 */
    public static Integer TEAM_MAX_SIZE;

    /** 任务池上限 */
    public static Integer MISSION_POOL_SIZE;

    /** 任务刷新间隔(回合) */
    public static Integer MISSION_REFRESH_TURN;

    /** 飞机基础票价系数 */
    public static Double PLANE_PRICE_FACTOR;

    /** 轮船基础票价系数 */
    public static Double SHIP_PRICE_FACTOR;

    /** 火车基础票价系数 */
    public static Double TRAIN_PRICE_FACTOR;

    /** 在途事件触发概率 */
    public static Double TRIP_EVENT_RATE;

    /** 旺季加价倍数 */
    public static Double PEAK_PRICE_RATE;

    /** 提前预订折扣 */
    public static Double EARLY_BOOK_DISCOUNT;

    /** 退票手续费比例 */
    public static Double REFUND_FEE_RATE;

    /** 建筑升级费用倍率 */
    public static Double BUILDING_FACTOR_DEFAULT;

    /** 全局事件每回合触发率 */
    public static Double EVENT_GLOBAL_RATE;

    /** 区域事件触发率 */
    public static Double EVENT_REGION_RATE;

    /** 行程事件触发率 */
    public static Double EVENT_TRIP_RATE;

    /** 队伍属性缓存 TTL(秒) */
    public static Integer REDIS_TTL_TEAM_STATS;

    /** 科技树缓存 TTL(秒) */
    public static Integer REDIS_TTL_TECH_TREE;

    @Value("${game.team.max-size:5}")
    public void setTeamMaxSize(Integer v) {
        TEAM_MAX_SIZE = v;
    }

    @Value("${game.mission.pool-size:5}")
    public void setMissionPoolSize(Integer v) {
        MISSION_POOL_SIZE = v;
    }

    @Value("${game.mission.refresh-turn:1}")
    public void setMissionRefreshTurn(Integer v) {
        MISSION_REFRESH_TURN = v;
    }

    @Value("${game.travel.plane-price-factor:1.5}")
    public void setPlanePriceFactor(Double v) {
        PLANE_PRICE_FACTOR = v;
    }

    @Value("${game.travel.ship-price-factor:0.8}")
    public void setShipPriceFactor(Double v) {
        SHIP_PRICE_FACTOR = v;
    }

    @Value("${game.travel.train-price-factor:1.0}")
    public void setTrainPriceFactor(Double v) {
        TRAIN_PRICE_FACTOR = v;
    }

    @Value("${game.travel.event-rate:0.25}")
    public void setTripEventRate(Double v) {
        TRIP_EVENT_RATE = v;
    }

    @Value("${game.travel.peak-price-rate:1.3}")
    public void setPeakPriceRate(Double v) {
        PEAK_PRICE_RATE = v;
    }

    @Value("${game.travel.early-book-discount:0.8}")
    public void setEarlyBookDiscount(Double v) {
        EARLY_BOOK_DISCOUNT = v;
    }

    @Value("${game.travel.refund-fee-rate:0.3}")
    public void setRefundFeeRate(Double v) {
        REFUND_FEE_RATE = v;
    }

    @Value("${game.build.factor-default:1.5}")
    public void setBuildingFactorDefault(Double v) {
        BUILDING_FACTOR_DEFAULT = v;
    }

    @Value("${game.event.global-rate:0.1}")
    public void setEventGlobalRate(Double v) {
        EVENT_GLOBAL_RATE = v;
    }

    @Value("${game.event.region-rate:0.2}")
    public void setEventRegionRate(Double v) {
        EVENT_REGION_RATE = v;
    }

    @Value("${game.event.trip-rate:0.25}")
    public void setEventTripRate(Double v) {
        EVENT_TRIP_RATE = v;
    }

    @Value("${game.redis.ttl-team-stats:60}")
    public void setRedisTtlTeamStats(Integer v) {
        REDIS_TTL_TEAM_STATS = v;
    }

    @Value("${game.redis.ttl-tech-tree:3600}")
    public void setRedisTtlTechTree(Integer v) {
        REDIS_TTL_TECH_TREE = v;
    }
}
