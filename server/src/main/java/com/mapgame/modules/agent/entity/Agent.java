package com.mapgame.modules.agent.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 特工
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("agent")
public class Agent {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long playerId;

    private String name;

    private String avatar;

    private String agentClass;

    private Integer hp;

    private Integer maxHp;

    private Integer defense;

    private Integer level;

    private Integer exp;

    private Integer fatigue;

    private String status;

    private Long assignedTripId;
}
