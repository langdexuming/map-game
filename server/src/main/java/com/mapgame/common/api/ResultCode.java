package com.mapgame.common.api;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 全局业务返回码
 * @author make java
 * @since 2026-05-01
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(0, "ok"),

    BIZ_PARAM_INVALID(40001, "参数非法"),
    BIZ_NOT_FOUND(40004, "数据不存在"),
    BIZ_DUPLICATE(40009, "数据已存在"),

    BIZ_TEAM_NOT_FOUND(41001, "队伍不存在"),
    BIZ_TEAM_FULL(41002, "队伍已满"),
    BIZ_TEAM_SLOT_TAKEN(41003, "槽位已被占用"),

    BIZ_MISSION_EXPIRED(42001, "任务已过期"),
    BIZ_MISSION_INCOMPLETE(42002, "任务进度未达成"),

    BIZ_TRIP_SAME_CITY(43001, "起终点相同"),
    BIZ_TRIP_UNREACHABLE(43002, "无法到达"),
    BIZ_TRIP_IN_TRANSIT(43003, "行程在途中, 无法操作"),
    BIZ_NOT_ENOUGH_COIN(43004, "金币不足"),
    BIZ_NOT_ENOUGH_FUEL(43005, "燃料不足"),
    BIZ_NOT_ENOUGH_CLUE(43006, "线索不足"),
    BIZ_NOT_ENOUGH_STAR(43007, "星星不足"),
    BIZ_TRIP_NOT_BOOKED(43008, "行程不可退票"),
    BIZ_AGENT_NOT_FOUND(43101, "特工不存在"),
    BIZ_AGENT_BUSY(43102, "特工忙碌中"),
    BIZ_VISA_ALREADY(43201, "签证已办理"),
    BIZ_VISA_NOT_REQUIRED(43202, "该区域无需签证"),

    BIZ_BUILDING_MAX(44001, "建筑已达最高等级"),
    BIZ_BUILDING_BUSY(44002, "建筑正在升级"),
    BIZ_TECH_PREREQ(45001, "前置科技未完成"),
    BIZ_TECH_DONE(45002, "科技已研究完成"),

    BIZ_BALANCE_TYPE(46001, "平衡参数类型不匹配"),

    SYSTEM_ERROR(50000, "系统异常");

    private final int code;
    private final String message;
}
