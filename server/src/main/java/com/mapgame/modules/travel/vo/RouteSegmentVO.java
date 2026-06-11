package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 路径段视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "路径段")
public class RouteSegmentVO {

    @Schema(description = "路径ID")
    private Long routeId;

    @Schema(description = "出发城市")
    private Long fromCityId;

    @Schema(description = "目的城市")
    private Long toCityId;

    @Schema(description = "载具类型")
    private String vehicleType;

    @Schema(description = "距离")
    private Integer distance;

    @Schema(description = "票价")
    private Integer price;

    @Schema(description = "耗时回合")
    private Integer turn;
}
