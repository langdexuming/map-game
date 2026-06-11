package com.mapgame.modules.player.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 玩家
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("player")
public class Player {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer level;

    private Long currentTeamId;

    private Integer coin;

    private Integer clue;

    private Integer star;

    private Integer fuel;

    private LocalDateTime createdAt;
}
