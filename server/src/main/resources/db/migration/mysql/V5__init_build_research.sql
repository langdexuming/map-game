-- =========================================================
-- V5 · S5 Build / Research / Units / Trade
-- @author make java
-- @since 2026-05-01
-- =========================================================
USE map_game;

CREATE TABLE building_template (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(64) UNIQUE NOT NULL,
  type            VARCHAR(16) NOT NULL,
  max_level       INT DEFAULT 5,
  base_cost_coin  INT,
  base_cost_star  INT,
  level_cost_factor DECIMAL(4,2) DEFAULT 1.50,
  base_turns_build INT DEFAULT 2
) COMMENT='建筑模板';

CREATE TABLE building (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id       BIGINT NOT NULL,
  city_id         BIGINT NOT NULL,
  template_id     BIGINT NOT NULL,
  level           INT DEFAULT 1,
  hp              INT DEFAULT 100,
  upgrade_finish_turn INT,
  status          VARCHAR(16) DEFAULT 'IDLE',
  INDEX idx_player_city (player_id, city_id)
) COMMENT='玩家建筑';

CREATE TABLE tech_node (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(64) UNIQUE NOT NULL,
  name            VARCHAR(64) NOT NULL,
  category        VARCHAR(16) NOT NULL,
  cost_clue       INT,
  cost_star       INT,
  turns_research  INT DEFAULT 5,
  prerequisites   VARCHAR(255),
  effect_json     JSON
) COMMENT='科技节点';

CREATE TABLE research_progress (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id       BIGINT NOT NULL,
  tech_id         BIGINT NOT NULL,
  percent         INT DEFAULT 0,
  start_turn      INT,
  finish_turn     INT,
  done            TINYINT DEFAULT 0,
  UNIQUE KEY uk_player_tech (player_id, tech_id)
) COMMENT='研究进度';

CREATE TABLE unit_template (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(64) UNIQUE NOT NULL,
  name            VARCHAR(64),
  hp              INT,
  atk             INT,
  train_turns     INT,
  cost_coin       INT,
  unlock_tech     BIGINT
) COMMENT='兵种模板';

CREATE TABLE trade_order (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id       BIGINT NOT NULL,
  city_id         BIGINT NOT NULL,
  give_resource   VARCHAR(16),
  give_amount     INT,
  get_resource    VARCHAR(16),
  get_amount      INT,
  status          VARCHAR(16) DEFAULT 'OPEN'
) COMMENT='贸易订单';

-- ============ 种子数据 ============
INSERT INTO building_template (code, type, max_level, base_cost_coin, base_cost_star, base_turns_build) VALUES
  ('BASE',          'BASE',          5, 200, 1, 2),
  ('RESEARCH_LAB',  'RESEARCH',      5, 300, 2, 3),
  ('UNITS_BARRACK', 'UNITS',         5, 250, 1, 2),
  ('TRADE_POST',    'TRADE',         5, 180, 0, 2),
  ('AIRPORT',       'AIRPORT',       3, 800, 3, 4),
  ('DOCK',          'DOCK',          3, 500, 2, 3),
  ('TRAIN_STATION', 'TRAIN_STATION', 3, 600, 2, 3);

INSERT INTO building (player_id, city_id, template_id, level, status) VALUES
  (1, 1, 1, 1, 'IDLE'),
  (1, 2, 1, 1, 'IDLE');

INSERT INTO tech_node (code, name, category, cost_clue, cost_star, turns_research, prerequisites, effect_json) VALUES
  ('TECH_POWER',     '基础动力',     'TECHNOLOGY',   100, 1, 4, '[]',     JSON_OBJECT('key','plane.speed','value',1.10,'desc','飞机速度+10%')),
  ('TECH_JET',       '喷气引擎',     'TECHNOLOGY',   200, 2, 6, '[1]',    JSON_OBJECT('key','plane.speed','value',1.20,'desc','飞机速度+20%')),
  ('TECH_SONIC',     '超音速',       'TECHNOLOGY',   400, 3, 8, '[2]',    JSON_OBJECT('key','plane.speed','value',1.40,'desc','飞机速度+40%')),
  ('TECH_STEALTH',   '隐形飞机',     'TECHNOLOGY',   800, 5, 12, '[3]',   JSON_OBJECT('key','plane.stealth','value',true,'desc','解锁隐形航线')),

  ('LOG_STORAGE',    '基础仓储',     'LOGISTICS',    80,  1, 3, '[]',     JSON_OBJECT('key','fuel.cap','value',300,'desc','燃料上限+100')),
  ('LOG_COLD',       '冷链运输',     'LOGISTICS',    200, 2, 5, '[5]',    JSON_OBJECT('key','ship.cap','value',1.30,'desc','轮船载量+30%')),
  ('LOG_MULTI',      '多式联运',     'LOGISTICS',    300, 2, 6, '[6]',    JSON_OBJECT('key','travel.speed','value',1.20,'desc','出行速度+20%')),
  ('LOG_AI',         '智能调度',     'LOGISTICS',    600, 4, 10, '[7]',   JSON_OBJECT('key','schedule.flex','value',true,'desc','解锁智能改签')),

  ('INT_RECON',      '基础侦察',     'INTELLIGENCE', 100, 1, 4, '[]',     JSON_OBJECT('key','clue.gain','value',1.10,'desc','线索获取+10%')),
  ('INT_CRYPTO',     '加密通信',     'INTELLIGENCE', 200, 2, 5, '[9]',    JSON_OBJECT('key','intercept.rate','value',1.20,'desc','拦截成功率+20%')),
  ('INT_SAT',        '卫星图像',     'INTELLIGENCE', 400, 3, 8, '[10]',   JSON_OBJECT('key','map.fog','value',0.5,'desc','减半地图迷雾')),
  ('INT_AI',         'AI 预警',      'INTELLIGENCE', 800, 5, 12, '[11]',  JSON_OBJECT('key','weather.warn','value',1,'desc','天气提前 1 回合预警')),

  ('ENG_BUILD',      '基础建造',     'ENGINEERING',  100, 1, 4, '[]',     JSON_OBJECT('key','build.cost','value',0.95,'desc','建造费用-5%')),
  ('ENG_STEEL',      '钢筋工艺',     'ENGINEERING',  200, 2, 5, '[13]',   JSON_OBJECT('key','build.hp','value',1.20,'desc','建筑HP+20%')),
  ('ENG_MOD',        '模块化基地',   'ENGINEERING',  400, 3, 8, '[14]',   JSON_OBJECT('key','build.turn','value',0.80,'desc','建造时间-20%')),
  ('ENG_SELFREP',    '自修复结构',   'ENGINEERING',  800, 5, 12, '[15]',  JSON_OBJECT('key','build.regen','value',5,'desc','建筑每回合 +5HP'));

INSERT INTO unit_template (code, name, hp, atk, train_turns, cost_coin, unlock_tech) VALUES
  ('UNIT_SCOUT',    '侦察兵',   80,  10, 2, 100, NULL),
  ('UNIT_GUARD',    '护卫',     130, 18, 3, 180, NULL),
  ('UNIT_ENGINEER', '工程师',   90,  8,  3, 150, 14),
  ('UNIT_DRONE',    '隐形无人机', 60, 25, 4, 400, 4);
