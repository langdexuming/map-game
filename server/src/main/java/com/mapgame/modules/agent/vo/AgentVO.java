package com.mapgame.modules.agent.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 特工视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "特工视图")
public class AgentVO {

    @Schema(description = "特工ID")
    private Long id;

    @Schema(description = "名称")
    private String name;

    @Schema(description = "头像")
    private String avatar;

    @Schema(description = "职业")
    private String agentClass;

    @Schema(description = "当前生命")
    private Integer hp;

    @Schema(description = "最大生命")
    private Integer maxHp;

    @Schema(description = "防御")
    private Integer defense;

    @Schema(description = "等级")
    private Integer level;

    @Schema(description = "疲劳 0-100")
    private Integer fatigue;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "关联行程ID")
    private Long assignedTripId;
}
