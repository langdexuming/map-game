package com.mapgame.modules.passport.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 签证购买请求
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "签证购买请求")
public class PassportVisaPurchaseQuery {

    @NotNull
    @Schema(description = "玩家ID")
    private Long playerId;

    @NotNull
    @Schema(description = "区域ID")
    private Long regionId;
}
