-- =========================================================
-- V3 · S3 Mission (SQLite)
-- =========================================================

CREATE TABLE mission_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(128) NOT NULL,
  description TEXT,
  type VARCHAR(32) NOT NULL,
  target_city_id INTEGER,
  reward_coin INTEGER DEFAULT 0,
  reward_clue INTEGER DEFAULT 0,
  reward_star INTEGER DEFAULT 0,
  expire_turns INTEGER DEFAULT 10,
  weight INTEGER DEFAULT 100
);

CREATE TABLE mission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  team_id INTEGER,
  status VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE',
  accept_turn INTEGER,
  expire_turn INTEGER,
  finish_turn INTEGER
);
CREATE INDEX idx_mission_player_status ON mission (player_id, status);

CREATE TABLE mission_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  percent INTEGER DEFAULT 0,
  checkpoint VARCHAR(64),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mission_progress_mission ON mission_progress (mission_id);

CREATE TABLE mission_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  turn INTEGER NOT NULL,
  event VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mission_log_player_turn ON mission_log (player_id, turn);

INSERT INTO mission_template (code, title, description, type, target_city_id, reward_coin, reward_clue, reward_star, weight) VALUES
  ('FETCH_LOST_BALL',   '寻找走失的玩具球',         '玩具球被刮跑了, 找回它',          'FETCH',           1, 100, 1, 1, 200),
  ('ESCORT_VIP_NOVA',   '护送 VIP 到 Nova Base',    '保护贵宾安全沿计划路线抵达',      'TRAVEL_VIP',      2, 500, 2, 3, 100),
  ('TRACE_SMUGGLER',    '追踪走私嫌疑人',           '通过其订票记录, 找出落脚点',      'TRAVEL_TRACE',    4, 400, 3, 2, 100),
  ('INTERCEPT_PORT',    'Apex 港口拦截',            '在港口截下走私货物',              'TRAVEL_INTERCEPT', 3, 600, 2, 3, 80),
  ('SEARCH_OUTPOST',    '搜索 Nave 据点',           '在隐蔽前哨站寻找科学家踪迹',      'SEARCH',          5, 300, 2, 2, 120),
  ('BATTLE_BANDITS',    '清剿强盗营地',             '保护 Greenforest 商队不再被打劫', 'BATTLE',          6, 350, 1, 2, 110),
  ('DELIVER_MED',       '紧急医药配送',             '把疫苗送到 Synergy City',         'DELIVER',         4, 250, 0, 2, 130);
