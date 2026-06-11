package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 事件效果
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "事件效果")
public class TripEventEffectVO {

    @Schema(description = "金币变化")
    private Integer coin;

    @Schema(description = "线索变化")
    private Integer clue;

    @Schema(description = "星星变化")
    private Integer star;

    @Schema(description = "燃料变化")
    private Integer fuel;

    @Schema(description = "延误回合")
    private Integer delay;

    @Schema(description = "效果描述")
    private String label;
}
