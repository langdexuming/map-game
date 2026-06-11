package com.mapgame.modules.agent.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 特工列表查询
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "特工列表查询")
public class AgentListQuery {

    @Schema(description = "玩家ID")
    private Long playerId;

    @Schema(description = "特工职业筛选")
    private String agentClass;

    @Schema(description = "最低等级")
    private Integer minLevel;
}
