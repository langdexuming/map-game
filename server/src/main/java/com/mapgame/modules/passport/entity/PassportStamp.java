package com.mapgame.modules.passport.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 区域印章
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("passport_stamp")
public class PassportStamp {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long passportId;

    private Long regionId;

    private LocalDateTime stampedAt;
}
