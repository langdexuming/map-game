package com.mapgame.modules.world.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 大陆 / 区域
 * @author make java
 * @since 2026-05-01
 */
@Data
@TableName("region")
public class Region {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long worldId;

    private String name;

    private String theme;

    private String mapBgUrl;
}
