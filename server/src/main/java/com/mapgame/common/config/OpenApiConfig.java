package com.mapgame.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;

/**
 * Swagger / OpenAPI 3 配置
 * 注: Spring Boot 3 已不支持 Swagger 2 的 @ApiModel/@ApiModelProperty,
 * 使用 OpenAPI 3 等价注解 @Schema, @Operation, @Parameter
 * @author make java
 * @since 2026-05-01
 */
@org.springframework.context.annotation.Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI mapGameOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("小小特工 · 出行特工版 API")
                        .description("Agents Global Control · Travel Edition · 后端接口文档")
                        .version("0.1.0")
                        .contact(new Contact().name("make java").url("https://github.com/langdexuming/map-game"))
                        .license(new License().name("Private")));
    }
}
