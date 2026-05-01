package com.mapgame.modules.world.vo;

import com.mapgame.modules.world.enums.MapViewType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 地图视图返回VO
 * @author make java
 * @since 2026-05-01
 */
@Data
@Schema(description = "地图视图增强数据")
public class MapViewVO {

    @Schema(description = "视图类型")
    private MapViewType viewType;

    @Schema(description = "该视图下的城市列表")
    private List<CityVO> cities;

    @Schema(description = "该视图下的图层附加信息, 如路径/资源点")
    private List<LayerItem> layers;

    @Data
    @Schema(description = "图层项")
    public static class LayerItem {

        @Schema(description = "图层类型, 如 ROUTE_PLANE / ROUTE_SHIP / RESOURCE_OIL")
        private String layerType;

        @Schema(description = "起点城市ID")
        private Long fromCityId;

        @Schema(description = "终点城市ID")
        private Long toCityId;

        @Schema(description = "扩展属性JSON字符串")
        private String payload;
    }
}
