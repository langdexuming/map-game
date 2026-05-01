-- =========================================================
-- V2 · S2 Agent / Team / Player 初始化
-- @author make java
-- @since 2026-05-01
-- =========================================================
USE map_game;

CREATE TABLE player (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(64) NOT NULL,
  level           INT DEFAULT 1,
  current_team_id BIGINT,
  coin            INT DEFAULT 5000,
  clue            INT DEFAULT 1200,
  star            INT DEFAULT 850,
  fuel            INT DEFAULT 200,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT='玩家';

CREATE TABLE agent (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id       BIGINT NOT NULL,
  name            VARCHAR(64) NOT NULL,
  avatar          VARCHAR(255),
  agent_class     VARCHAR(16) COMMENT 'SCOUT/GUARD/ENGINEER/DIPLOMAT/MEDIC',
  hp              INT DEFAULT 100,
  max_hp          INT DEFAULT 100,
  defense         INT DEFAULT 10,
  level           INT DEFAULT 1,
  exp             INT DEFAULT 0,
  fatigue         INT DEFAULT 0,
  INDEX idx_player (player_id)
) COMMENT='特工';

CREATE TABLE team (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id   BIGINT NOT NULL,
  name        VARCHAR(64) NOT NULL,
  max_size    TINYINT DEFAULT 5,
  INDEX idx_player (player_id)
) COMMENT='队伍';

CREATE TABLE team_agent (
  team_id     BIGINT NOT NULL,
  agent_id    BIGINT NOT NULL,
  slot        TINYINT NOT NULL,
  PRIMARY KEY (team_id, agent_id),
  UNIQUE KEY uk_team_slot (team_id, slot)
) COMMENT='队伍-特工关联';

CREATE TABLE skill (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  agent_id    BIGINT NOT NULL,
  name        VARCHAR(64) NOT NULL,
  cooldown    INT DEFAULT 0,
  power       INT DEFAULT 10,
  INDEX idx_agent (agent_id)
) COMMENT='技能';

-- ============ 种子数据 ============
INSERT INTO player (id, name) VALUES (1, 'Little Commander Echo');

INSERT INTO team (id, player_id, name) VALUES (1, 1, 'Team Alpha');
UPDATE player SET current_team_id = 1 WHERE id = 1;

INSERT INTO agent (id, player_id, name, agent_class, hp, max_hp, defense, level) VALUES
  (1, 1, 'Echo',   'SCOUT',    100, 100, 8,  3),
  (2, 1, 'Mira',   'MEDIC',    90,  90,  6,  2),
  (3, 1, 'Buck',   'GUARD',    120, 120, 14, 3),
  (4, 1, 'Pip',    'ENGINEER', 80,  80,  10, 2),
  (5, 1, 'Lila',   'DIPLOMAT', 70,  70,  6,  2),
  (6, 1, 'Rover',  'SCOUT',    95,  95,  8,  1),
  (7, 1, 'Ginger', 'MEDIC',    85,  85,  7,  1),
  (8, 1, 'Bolt',   'GUARD',    110, 110, 12, 1);

INSERT INTO team_agent (team_id, agent_id, slot) VALUES
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3),
  (1, 4, 4),
  (1, 5, 5);

INSERT INTO skill (agent_id, name, cooldown, power) VALUES
  (1, '快速侦察', 1, 8),
  (2, '群体治疗', 3, 25),
  (3, '钢铁壁垒', 2, 0),
  (4, '紧急维修', 2, 15),
  (5, '情报交涉', 4, 0);
