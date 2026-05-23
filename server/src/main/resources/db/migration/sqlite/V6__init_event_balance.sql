-- =========================================================
-- V6 · S6 Event / Balance (SQLite)
-- =========================================================

CREATE TABLE event_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  scope VARCHAR(16) NOT NULL,
  trigger_dsl TEXT NOT NULL,
  weight INTEGER DEFAULT 100,
  cooldown_turn INTEGER DEFAULT 5,
  base_effect TEXT,
  choices_json TEXT,
  enabled INTEGER DEFAULT 1
);

CREATE TABLE event_trigger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  event_template_id INTEGER NOT NULL,
  triggered_turn INTEGER NOT NULL,
  scope VARCHAR(16),
  context_json TEXT,
  chosen_key VARCHAR(32),
  resolved INTEGER DEFAULT 0,
  resolved_turn INTEGER
);
CREATE INDEX idx_event_trigger_player_turn ON event_trigger (player_id, triggered_turn);

CREATE TABLE balance_config (
  cfg_key VARCHAR(64) PRIMARY KEY,
  cfg_value VARCHAR(255) NOT NULL,
  cfg_type VARCHAR(16),
  description VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO balance_config (cfg_key, cfg_value, cfg_type, description) VALUES
  ('RESOURCE_INIT_COIN',        '5000',  'INT',    '新档初始金币'),
  ('RESOURCE_INIT_FUEL',        '200',   'INT',    '新档初始燃料'),
  ('TURN_LENGTH_SECONDS',       '0',     'INT',    '0=手动推进'),
  ('MISSION_POOL_SIZE',         '5',     'INT',    '任务池上限'),
  ('MISSION_REFRESH_TURN',      '1',     'INT',    '任务刷新间隔'),
  ('TRIP_EVENT_RATE_NONE',      '0.25',  'DOUBLE', '无事件概率'),
  ('TRIP_EVENT_RATE_CLUE',      '0.25',  'DOUBLE', '偶遇线索概率'),
  ('TRIP_EVENT_RATE_TROUBLE',   '0.20',  'DOUBLE', '小麻烦概率'),
  ('TRIP_EVENT_RATE_WEATHER',   '0.15',  'DOUBLE', '天气延迟概率'),
  ('TRIP_EVENT_RATE_BANDIT',    '0.10',  'DOUBLE', '海盗概率'),
  ('TRIP_EVENT_RATE_HIDDEN',    '0.05',  'DOUBLE', '隐藏支线概率'),
  ('PLANE_PRICE_FACTOR',        '1.5',   'DOUBLE', '飞机基础价系数'),
  ('SHIP_PRICE_FACTOR',         '0.8',   'DOUBLE', '轮船基础价系数'),
  ('TRAIN_PRICE_FACTOR',        '1.0',   'DOUBLE', '火车基础价系数'),
  ('REFUND_FEE_RATE',           '0.30',  'DOUBLE', '退票手续费比例'),
  ('PEAK_PRICE_RATE',           '1.30',  'DOUBLE', '旺季加价'),
  ('EARLY_BOOK_DISCOUNT',       '0.80',  'DOUBLE', '提前预订折扣'),
  ('BUILDING_FACTOR_DEFAULT',   '1.50',  'DOUBLE', '升级费用倍率'),
  ('RESEARCH_TURN_FACTOR',      '1.00',  'DOUBLE', '研究耗时倍率'),
  ('TEAM_MAX_SIZE',             '5',     'INT',    '队伍最大人数'),
  ('AGENT_FATIGUE_PER_TURN',    '5',     'INT',    '在途疲劳/回合'),
  ('AGENT_REST_PER_TURN',       '10',    'INT',    '城市休息恢复'),
  ('EVENT_GLOBAL_RATE',         '0.10',  'DOUBLE', '全局事件每回合触发率'),
  ('EVENT_REGION_RATE',         '0.20',  'DOUBLE', '区域事件触发率'),
  ('EVENT_TRIP_RATE',           '0.25',  'DOUBLE', '行程事件触发率'),
  ('EVENT_COOLDOWN_DEFAULT',    '5',     'INT',    '事件默认冷却'),
  ('LOG_RETENTION_DAYS',        '30',    'INT',    '日志保留天数'),
  ('WS_PUSH_BATCH_SIZE',        '50',    'INT',    'WS 推送批量大小'),
  ('REDIS_TTL_TEAM_STATS',      '60',    'INT',    '队伍属性缓存 TTL'),
  ('REDIS_TTL_TECH_TREE',       '3600',  'INT',    '科技树缓存 TTL');

INSERT INTO event_template (code, scope, trigger_dsl, weight, cooldown_turn, base_effect, choices_json) VALUES
  ('GLOBAL_NEW_YEAR',
    'GLOBAL',
    'turn % 100 == 0',
    50, 100,
    json_object('resourceDelta', json_object('COIN', 500, 'STAR', 5)),
    NULL),

  ('REGION_TOY_FESTIVAL',
    'REGION',
    'region.name == "Toy Isles" AND random(100) < 25',
    100, 10,
    NULL,
    json_array(
      json_object('key','celebrate','label','一起庆祝','effect', json_object('resourceDelta', json_object('COIN', 200))),
      json_object('key','silent','label','低调路过','effect', json_object('resourceDelta', json_object('CLUE', 1)))
    )),

  ('TRIP_STORM',
    'TRIP',
    'trip.vehicle == "SHIP" AND random(100) < 20',
    100, 5,
    NULL,
    json_array(
      json_object('key','force','label','硬闯','effect', json_object('resourceDelta', json_object('FUEL', -10), 'statusFlags', json_array('SHIP_DAMAGED'))),
      json_object('key','wait','label','绕道','effect', json_object('turnDelta', 1))
    )),

  ('TRIP_PIRATE',
    'TRIP',
    'trip.vehicle == "SHIP" AND random(100) < 10',
    80, 8,
    NULL,
    json_array(
      json_object('key','fight','label','正面战斗','effect', json_object('resourceDelta', json_object('COIN', 50))),
      json_object('key','flee','label','撤退','effect', json_object('turnDelta', 1)),
      json_object('key','bribe','label','贿赂','reqDsl','resource.coin >= 100','effect', json_object('resourceDelta', json_object('COIN', -100)))
    )),

  ('MISSION_TWIST_BONUS',
    'MISSION',
    'mission.type == "TRAVEL_VIP" AND random(100) < 30',
    60, 10,
    json_object('resourceDelta', json_object('STAR', 1, 'CLUE', 2)),
    NULL);
