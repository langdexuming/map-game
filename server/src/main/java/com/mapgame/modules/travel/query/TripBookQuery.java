package com.mapgame.modules.travel.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 订票请求
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "订票请求")
public class TripBookQuery {

    @NotNull
    @Schema(description = "方案序号")
    private Integer planNo;

    @NotNull
    @Schema(description = "出发城市ID")
    private Long fromCityId;

    @NotNull
    @Schema(description = "目的城市ID")
    private Long toCityId;

    @NotNull
    @Schema(description = "队伍ID")
    private Long teamId;

    @NotNull
    @Schema(description = "玩家ID")
    private Long playerId;

    @Schema(description = "带队特工ID")
    private Long leadAgentId;

    @Schema(description = "关联任务ID")
    private Long missionId;

    @Schema(description = "世界ID")
    private Long worldId;

    @Schema(description = "计划出发回合偏移")
    private Integer departureOffset;

    @Schema(description = "是否强行出发")
    private Boolean forceDepart;
}
