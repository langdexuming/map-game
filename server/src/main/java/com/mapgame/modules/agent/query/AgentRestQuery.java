package com.mapgame.modules.agent.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 特工休整请求
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "特工休整请求")
public class AgentRestQuery {

    @Schema(description = "玩家ID")
    private Long playerId;

    @Schema(description = "是否在总部休整（免费）")
    private Boolean atHq;
}
