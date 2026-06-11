package com.mapgame.modules.travel.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 路径
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("route")
public class Route {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long fromCity;

    private Long toCity;

    private Integer vehicleType;

    private Integer distance;

    private Integer basePrice;

    private Integer baseTurn;

    private Integer disabled;
}
