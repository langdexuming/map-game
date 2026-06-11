package com.mapgame.modules.player.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 玩家资源视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "玩家资源视图")
public class PlayerVO {

    @Schema(description = "玩家ID")
    private Long id;

    @Schema(description = "名称")
    private String name;

    @Schema(description = "金币")
    private Integer coin;

    @Schema(description = "线索")
    private Integer clue;

    @Schema(description = "星星")
    private Integer star;

    @Schema(description = "燃料")
    private Integer fuel;

    @Schema(description = "当前队伍ID")
    private Long currentTeamId;
}
