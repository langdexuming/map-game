package com.mapgame.modules.travel.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 在途行程查询
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "在途行程查询")
public class TripInTransitQuery {

    @Schema(description = "玩家ID")
    private Long playerId;
}
