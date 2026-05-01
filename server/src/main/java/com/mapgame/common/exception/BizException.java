package com.mapgame.common.exception;

import com.mapgame.common.api.ResultCode;
import lombok.Getter;

/**
 * 业务异常
 * @author make java
 * @since 2026-05-01
 */
@Getter
public class BizException extends RuntimeException {

    private final int code;

    public BizException(ResultCode rc) {
        super(rc.getMessage());
        this.code = rc.getCode();
    }

    public BizException(ResultCode rc, String detailMessage) {
        super(detailMessage);
        this.code = rc.getCode();
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }
}
