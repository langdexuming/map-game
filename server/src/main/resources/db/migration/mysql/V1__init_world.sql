-- =========================================================
-- V1 · S1 World 模块初始化
-- @author make java
-- @since 2026-05-01
-- =========================================================

CREATE DATABASE IF NOT EXISTS map_game DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE map_game;

DROP TABLE IF EXISTS world;
CREATE TABLE world (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(64) NOT NULL,
  turn_no     INT DEFAULT 1 COMMENT '当前回合数',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='游戏世界 / 存档';

DROP TABLE IF EXISTS region;
CREATE TABLE region (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  world_id    BIGINT NOT NULL,
  name        VARCHAR(64) NOT NULL,
  theme       VARCHAR(32),
  map_bg_url  VARCHAR(255),
  INDEX idx_world (world_id)
) COMMENT='大陆 / 区域';

DROP TABLE IF EXISTS city;
CREATE TABLE city (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  region_id   BIGINT NOT NULL,
  name        VARCHAR(64) NOT NULL,
  level       TINYINT DEFAULT 2 COMMENT '1-Hub 2-Region 3-Outpost',
  lng         DECIMAL(9,6) NOT NULL,
  lat         DECIMAL(8,6) NOT NULL,
  unlocked    TINYINT DEFAULT 0,
  INDEX idx_region (region_id)
) COMMENT='城市 / 节点';

DROP TABLE IF EXISTS map_view_config;
CREATE TABLE map_view_config (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  view_type   VARCHAR(16) NOT NULL COMMENT 'EXPLORER/RESOURCE/TEAM/TRAVEL',
  city_id     BIGINT NOT NULL,
  payload     JSON,
  UNIQUE KEY uk_view_city (view_type, city_id)
) COMMENT='地图视图扩展数据';

-- ============ 种子数据 ============
INSERT INTO world (id, name) VALUES (1, 'Default Save');

INSERT INTO region (id, world_id, name, theme) VALUES
 (1, 1, 'Water Land',       'BLUE'),
 (2, 1, 'Toy Isles',        'PASTEL'),
 (3, 1, 'Vanguard Isles',   'GOLD'),
 (4, 1, 'Rainbow Land',     'RAINBOW'),
 (5, 1, 'Greenforest Land', 'GREEN');

INSERT INTO city (region_id, name, level, lng, lat, unlocked) VALUES
 (1, 'Little Aegis HQ',    1, -10.000000, 30.000000, 1),
 (2, 'Nova Base',           1,  60.000000, 35.000000, 1),
 (3, 'Apex HQ',             1, -45.000000, -15.000000, 0),
 (3, 'Synergy City',        2, -30.000000, -25.000000, 1),
 (4, 'Nave Outpost',        3,  85.000000, -10.000000, 0),
 (5, 'Greenforest Hub',     1,  25.000000,   5.000000, 0);
