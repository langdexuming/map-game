package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 行程视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "行程")
public class TripVO {

    @Schema(description = "行程ID")
    private Long id;

    @Schema(description = "队伍ID")
    private Long teamId;

    @Schema(description = "玩家ID")
    private Long playerId;

    @Schema(description = "出发城市")
    private Long fromCityId;

    @Schema(description = "目的城市")
    private Long toCityId;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "出发回合")
    private Integer startTurn;

    @Schema(description = "到达回合")
    private Integer arriveTurn;

    @Schema(description = "计划出发回合")
    private Integer departureTurn;

    @Schema(description = "已行进回合")
    private Integer elapsedTurn;

    @Schema(description = "延误回合")
    private Integer delayTurn;

    @Schema(description = "已付金币")
    private Integer paidCoin;

    @Schema(description = "已付燃料")
    private Integer paidFuel;

    @Schema(description = "进度百分比")
    private Integer progressPercent;

    @Schema(description = "方案快照")
    private TripPlanVO plan;
}
