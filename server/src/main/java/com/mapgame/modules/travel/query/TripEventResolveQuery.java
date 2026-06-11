package com.mapgame.modules.travel.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 事件决议请求
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "事件决议请求")
public class TripEventResolveQuery {

    @NotNull
    @Schema(description = "玩家ID")
    private Long playerId;

    @NotBlank
    @Schema(description = "选项键")
    private String choiceKey;
}
