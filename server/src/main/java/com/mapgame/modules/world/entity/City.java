package com.mapgame.modules.world.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 城市 / 节点
 * @author make java
 * @since 2026-05-01
 */
@Data
@TableName("city")
public class City {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long regionId;

    private String name;

    /**
     * 城市等级: 1-Hub 国际枢纽, 2-Region 区域城市, 3-Outpost 据点
     */
    private Integer level;

    private BigDecimal lng;

    private BigDecimal lat;

    private Integer unlocked;
}
