package com.mapgame.modules.world.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 世界基础信息返回VO
 * @author make java
 * @since 2026-05-01
 */
@Data
@Schema(description = "世界基础信息")
public class WorldVO {

    @Schema(description = "世界ID")
    private Long id;

    @Schema(description = "存档名")
    private String name;

    @Schema(description = "当前回合数")
    private Integer turnNo;
}
