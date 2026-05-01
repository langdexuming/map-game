-- =========================================================
-- V3 · S3 Mission 模块
-- @author make java
-- @since 2026-05-01
-- =========================================================
USE map_game;

CREATE TABLE mission_template (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(64) UNIQUE NOT NULL,
  title           VARCHAR(128) NOT NULL,
  description     TEXT,
  type            VARCHAR(32) NOT NULL,
  target_city_id  BIGINT,
  reward_coin     INT DEFAULT 0,
  reward_clue     INT DEFAULT 0,
  reward_star     INT DEFAULT 0,
  expire_turns    INT DEFAULT 10,
  weight          INT DEFAULT 100
) COMMENT='任务模板';

CREATE TABLE mission (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  template_id     BIGINT NOT NULL,
  player_id       BIGINT NOT NULL,
  team_id         BIGINT,
  status          VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE',
  accept_turn     INT,
  expire_turn     INT,
  finish_turn     INT,
  INDEX idx_player_status (player_id, status)
) COMMENT='任务实例';

CREATE TABLE mission_progress (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_id      BIGINT NOT NULL,
  team_id         BIGINT NOT NULL,
  percent         INT DEFAULT 0,
  checkpoint      VARCHAR(64),
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mission (mission_id)
) COMMENT='任务进度';

CREATE TABLE mission_log (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  mission_id      BIGINT NOT NULL,
  player_id       BIGINT NOT NULL,
  turn            INT NOT NULL,
  event           VARCHAR(255),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_player_turn (player_id, turn)
) COMMENT='任务事件日志';

-- ============ 种子数据 ============
INSERT INTO mission_template (code, title, description, type, target_city_id, reward_coin, reward_clue, reward_star, weight) VALUES
  ('FETCH_LOST_BALL',   '寻找走失的玩具球',         '玩具球被刮跑了, 找回它',          'FETCH',           1, 100, 1, 1, 200),
  ('ESCORT_VIP_NOVA',   '护送 VIP 到 Nova Base',    '保护贵宾安全沿计划路线抵达',      'TRAVEL_VIP',      2, 500, 2, 3, 100),
  ('TRACE_SMUGGLER',    '追踪走私嫌疑人',           '通过其订票记录, 找出落脚点',      'TRAVEL_TRACE',    4, 400, 3, 2, 100),
  ('INTERCEPT_PORT',    'Apex 港口拦截',            '在港口截下走私货物',              'TRAVEL_INTERCEPT', 3, 600, 2, 3, 80),
  ('SEARCH_OUTPOST',    '搜索 Nave 据点',           '在隐蔽前哨站寻找科学家踪迹',      'SEARCH',          5, 300, 2, 2, 120),
  ('BATTLE_BANDITS',    '清剿强盗营地',             '保护 Greenforest 商队不再被打劫', 'BATTLE',          6, 350, 1, 2, 110),
  ('DELIVER_MED',       '紧急医药配送',             '把疫苗送到 Synergy City',         'DELIVER',         4, 250, 0, 2, 130);
