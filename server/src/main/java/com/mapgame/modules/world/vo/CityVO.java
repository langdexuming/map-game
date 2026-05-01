package com.mapgame.modules.world.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 城市返回VO
 * @author make java
 * @since 2026-05-01
 */
@Data
@Schema(description = "城市信息")
public class CityVO {

    @Schema(description = "城市ID")
    private Long id;

    @Schema(description = "城市名称")
    private String name;

    @Schema(description = "等级 1-Hub 2-Region 3-Outpost")
    private Integer level;

    @Schema(description = "经度")
    private BigDecimal lng;

    @Schema(description = "纬度")
    private BigDecimal lat;

    @Schema(description = "是否已解锁")
    private Boolean unlocked;
}
