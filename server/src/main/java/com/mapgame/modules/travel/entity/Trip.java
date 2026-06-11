package com.mapgame.modules.travel.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 行程
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("trip")
public class Trip {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long teamId;

    private Long playerId;

    private Long missionId;

    private String routeIds;

    private String status;

    private Integer startTurn;

    private Integer arriveTurn;

    private Integer paidCoin;

    private Integer paidFuel;

    private Long fromCityId;

    private Long toCityId;

    private Long leadAgentId;

    private Integer departureTurn;

    private String planJson;

    private Integer forceDepart;

    private Integer delayTurn;

    private Integer elapsedTurn;
}
