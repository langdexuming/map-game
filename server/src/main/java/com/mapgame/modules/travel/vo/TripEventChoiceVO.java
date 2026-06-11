package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 事件选项
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "事件选项")
public class TripEventChoiceVO {

    @Schema(description = "选项键")
    private String key;

    @Schema(description = "选项文案")
    private String label;

    @Schema(description = "所需金币")
    private Integer requireCoin;

    @Schema(description = "选项效果")
    private TripEventEffectVO effect;
}
