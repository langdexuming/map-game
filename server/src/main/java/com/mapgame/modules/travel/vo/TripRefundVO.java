package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 退票结果
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "退票结果")
public class TripRefundVO {

    @Schema(description = "退还金币")
    private Integer refundCoin;

    @Schema(description = "手续费")
    private Integer feeCoin;

    @Schema(description = "行程ID")
    private Long tripId;
}
