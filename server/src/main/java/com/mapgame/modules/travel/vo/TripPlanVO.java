package com.mapgame.modules.travel.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 行程方案视图
 * @author make java
 * @since 2026-06-11
 */
@Data
@Schema(description = "行程方案")
public class TripPlanVO {

    @Schema(description = "方案序号")
    private Integer planNo;

    @Schema(description = "路径段列表")
    private List<RouteSegmentVO> segments;

    @Schema(description = "载具链路")
    private List<String> vehicleChain;

    @Schema(description = "总耗时回合")
    private Integer totalTurn;

    @Schema(description = "总票价")
    private Integer totalPrice;

    @Schema(description = "燃料消耗")
    private Integer fuelCost;

    @Schema(description = "疲劳消耗")
    private Integer fatigueCost;

    @Schema(description = "路上事件期望")
    private Integer eventExpect;

    @Schema(description = "额外收益描述")
    private String bonusDesc;

    @Schema(description = "方案标签")
    private String planBadge;

    @Schema(description = "是否换乘 Combo")
    private Boolean transferCombo;

    @Schema(description = "是否三连 Combo")
    private Boolean tripleCombo;

    @Schema(description = "风险分")
    private Integer riskScore;

    @Schema(description = "方案风格 FAST/CHEAP/SAFE")
    private String planStyle;
}
