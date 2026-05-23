package com.mapgame.modules.world.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 城市等级提升请求参数
 * @author make java
 * @since 2026-05-12
 */
@Data
@Schema(description = "城市等级提升参数")
public class CityLevelUpgradeQuery {

    @NotNull
    @Min(1)
    @Max(5)
    @Schema(description = "目标等级（相对当前仅允许 +1）", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer targetLevel;
}
