package com.mapgame.modules.world.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 世界初始化聚合 VO：一次返回 world + regions + 默认视图
 * @author make java
 * @since 2026-05-17
 */
@Data
@Schema(description = "世界初始化聚合数据")
public class WorldBootstrapVO {

    @Schema(description = "世界基础信息")
    private WorldVO world;

    @Schema(description = "全部大陆 + 城市")
    private List<RegionVO> regions;

    @Schema(description = "默认地图视图增强数据")
    private MapViewVO mapView;
}
