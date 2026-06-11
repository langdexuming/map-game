package com.mapgame.modules.passport.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 里程记录
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("mileage_log")
public class MileageLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long passportId;

    private Long tripId;

    private Integer distance;

    private Integer loggedTurn;

    private LocalDateTime createdAt;
}
