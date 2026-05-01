package com.mapgame.common.exception;

import com.mapgame.common.api.Result;
import com.mapgame.common.api.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常拦截器
 * @author make java
 * @since 2026-05-01
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常 - 期望异常, 仅 warn
     * @param e 业务异常
     * @return 统一返回
     */
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        log.warn("业务异常 code={}, msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    /**
     * 参数校验异常
     * @param e Validator 异常
     * @return 统一返回
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleParam(MethodArgumentNotValidException e) {
        String first = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .orElse("参数非法");
        log.warn("参数校验异常 {}", first);
        return Result.fail(ResultCode.BIZ_PARAM_INVALID.getCode(), first);
    }

    /**
     * 兜底系统异常
     * @param e 任意异常
     * @return 统一返回
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleAny(Exception e) {
        log.error("系统异常: ", e);
        return Result.fail(ResultCode.SYSTEM_ERROR);
    }
}
