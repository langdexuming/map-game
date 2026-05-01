package com.mapgame.modules.world.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 游戏世界 / 存档
 * @author make java
 * @since 2026-05-01
 */
@Data
@TableName("world")
public class World {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private Integer turnNo;

    private LocalDateTime createdAt;
}
