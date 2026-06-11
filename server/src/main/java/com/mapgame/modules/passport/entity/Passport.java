package com.mapgame.modules.passport.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 特工护照
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("passport")
public class Passport {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long playerId;

    private Integer mileage;

    private Integer goldenCoating;

    private LocalDateTime createdAt;
}
