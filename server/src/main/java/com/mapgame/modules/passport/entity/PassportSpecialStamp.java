package com.mapgame.modules.passport.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 限定印章
 * @author make java
 * @since 2026-06-11
 */
@Data
@TableName("passport_special_stamp")
public class PassportSpecialStamp {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long passportId;

    private String stampKey;

    private LocalDateTime obtainedAt;
}
