-- =========================================================
-- V4 · ★ S4 Travel 模块 (路径/班次/行程/事件)
-- @author make java
-- @since 2026-05-01
-- =========================================================
USE map_game;

CREATE TABLE route (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  from_city       BIGINT NOT NULL,
  to_city         BIGINT NOT NULL,
  vehicle_type    TINYINT NOT NULL COMMENT '1-Plane 2-Ship 3-Train 4-Truck 5-Foot',
  distance        INT NOT NULL,
  base_price      INT NOT NULL,
  base_turn       INT NOT NULL,
  disabled        TINYINT DEFAULT 0,
  INDEX idx_from (from_city),
  INDEX idx_to   (to_city)
) COMMENT='路径';

CREATE TABLE schedule (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_id        BIGINT NOT NULL,
  turn_interval   INT DEFAULT 3,
  next_depart_turn INT NOT NULL,
  UNIQUE KEY uk_route (route_id)
) COMMENT='班次';

CREATE TABLE trip (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  team_id         BIGINT NOT NULL,
  player_id       BIGINT NOT NULL,
  mission_id      BIGINT,
  route_ids       VARCHAR(512),
  status          VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  start_turn      INT,
  arrive_turn     INT,
  paid_coin       INT,
  paid_fuel       INT,
  INDEX idx_player (player_id),
  INDEX idx_status (status)
) COMMENT='行程';

CREATE TABLE trip_event (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  trip_id         BIGINT NOT NULL,
  event_code      VARCHAR(32) NOT NULL,
  happened_turn   INT NOT NULL,
  payload         JSON,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trip (trip_id)
) COMMENT='路上事件';

-- ============ 种子数据 (双向路径) ============
-- city id 速查:
--  1 Little Aegis HQ  (Water Land, Hub)
--  2 Nova Base        (Toy Isles, Hub)
--  3 Apex HQ          (Vanguard Isles, Hub)
--  4 Synergy City     (Vanguard Isles, Region)
--  5 Nave Outpost     (Rainbow Land, Outpost)
--  6 Greenforest Hub  (Greenforest Land, Hub)

-- 飞机航线 Hub-Hub (vehicle_type=1)
INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (1, 2, 1, 7000, 320, 2),
  (2, 1, 1, 7000, 320, 2),
  (1, 3, 1, 5500, 280, 2),
  (3, 1, 1, 5500, 280, 2),
  (1, 6, 1, 4000, 220, 2),
  (6, 1, 1, 4000, 220, 2),
  (2, 6, 1, 4500, 240, 2),
  (6, 2, 1, 4500, 240, 2),
  (3, 6, 1, 5000, 260, 2),
  (6, 3, 1, 5000, 260, 2);

-- 轮船 (vehicle_type=2) Hub-Hub 跨洋
INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (1, 3, 2, 5500, 130, 4),
  (3, 1, 2, 5500, 130, 4),
  (2, 6, 2, 4500, 110, 3),
  (6, 2, 2, 4500, 110, 3),
  (3, 4, 2, 800,  60,  1),
  (4, 3, 2, 800,  60,  1);

-- 火车 (vehicle_type=3) 同大陆
INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (3, 4, 3, 700, 80, 1),
  (4, 3, 3, 700, 80, 1),
  (1, 6, 3, 3500, 180, 3),
  (6, 1, 3, 3500, 180, 3);

-- 卡车 (vehicle_type=4) Outpost 接驳
INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (6, 5, 4, 1500, 90, 2),
  (5, 6, 4, 1500, 90, 2);

-- 越野 (vehicle_type=5) 隐藏路径, 免费但慢
INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (4, 5, 5, 2000, 0, 5),
  (5, 4, 5, 2000, 0, 5);

-- 班次: 全部路径默认 3 回合一班, 下一班 turn=2
INSERT INTO schedule (route_id, turn_interval, next_depart_turn)
  SELECT id, 3, 2 FROM route;
