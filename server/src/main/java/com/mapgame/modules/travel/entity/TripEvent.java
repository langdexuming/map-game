package com.mapgame.modules.travel.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 路上事件
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("trip_event")
public class TripEvent {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long tripId;

    private String eventCode;

    private Integer happenedTurn;

    private String payload;

    private LocalDateTime createdAt;
}
