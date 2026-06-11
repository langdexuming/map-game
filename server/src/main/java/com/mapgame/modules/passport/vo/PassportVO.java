package com.mapgame.modules.passport.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 护照视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "护照视图")
public class PassportVO {

    @Schema(description = "玩家ID")
    private Long playerId;

    @Schema(description = "累计里程")
    private Integer mileage;

    @Schema(description = "是否金色涂装")
    private Boolean goldenCoating;

    @Schema(description = "区域印章 regionId -> true")
    private Map<Long, Boolean> stamps;

    @Schema(description = "区域签证 regionId -> true")
    private Map<Long, Boolean> visas;

    @Schema(description = "限定印章 key 列表")
    private List<String> specialStamps;

    @Schema(description = "是否环球通票（5 印章）")
    private Boolean globalPass;

    @Schema(description = "订票折扣 0-1")
    private Double ticketDiscount;
}
