package com.mapgame.modules.travel.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 改签请求
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "改签请求")
public class TripRescheduleQuery {

    @NotNull
    @Schema(description = "玩家ID")
    private Long playerId;

    @NotNull
    @Schema(description = "新的出发回合偏移")
    private Integer departureOffset;
}
