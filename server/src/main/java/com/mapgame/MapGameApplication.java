package com.mapgame;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 小小特工 · 出行特工版 · 后端启动入口
 * @author make java
 * @since 2026-05-01
 */
@SpringBootApplication
@MapperScan("com.mapgame.modules.**.mapper")
@EnableScheduling
public class MapGameApplication {

    public static void main(String[] args) {
        SpringApplication.run(MapGameApplication.class, args);
    }
}
