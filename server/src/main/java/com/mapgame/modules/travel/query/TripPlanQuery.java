package com.mapgame.modules.travel.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 行程规划查询
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "行程规划查询")
public class TripPlanQuery {

    @NotNull
    @Schema(description = "出发城市ID")
    private Long fromCityId;

    @NotNull
    @Schema(description = "目的城市ID")
    private Long toCityId;

    @NotNull
    @Schema(description = "队伍ID")
    private Long teamId;

    @Schema(description = "玩家ID，用于签证与折扣")
    private Long playerId;

    @Schema(description = "世界ID，用于主基地等级")
    private Long worldId;

    @Schema(description = "偏好 1快 2省 3稳")
    private Integer preference;
}
