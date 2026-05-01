package com.mapgame.modules.world.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 大陆返回VO
 * @author make java
 * @since 2026-05-01
 */
@Data
@Schema(description = "大陆信息")
public class RegionVO {

    @Schema(description = "大陆ID")
    private Long id;

    @Schema(description = "大陆名称")
    private String name;

    @Schema(description = "主题色/风格")
    private String theme;

    @Schema(description = "背景图URL")
    private String mapBgUrl;

    @Schema(description = "该大陆下的城市列表")
    private List<CityVO> cities;
}
