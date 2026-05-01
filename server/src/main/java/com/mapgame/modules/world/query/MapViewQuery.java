package com.mapgame.modules.world.query;

import com.mapgame.modules.world.enums.MapViewType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 地图视图查询参数
 * @author make java
 * @since 2026-05-01
 */
@Data
@Schema(description = "地图视图查询参数")
public class MapViewQuery {

    @NotNull
    @Schema(description = "世界ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long worldId;

    @NotNull
    @Schema(description = "视图类型", requiredMode = Schema.RequiredMode.REQUIRED)
    private MapViewType viewType;
}
