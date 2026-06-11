package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 路上事件推送
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "路上事件推送")
public class TripEventPushVO {

    @Schema(description = "行程ID")
    private Long tripId;

    @Schema(description = "事件记录ID")
    private Long eventId;

    @Schema(description = "事件码")
    private String eventCode;

    @Schema(description = "标题")
    private String title;

    @Schema(description = "正文")
    private String body;

    @Schema(description = "d100 掷骰")
    private Integer d100;

    @Schema(description = "可选项")
    private List<TripEventChoiceVO> choices;
}
