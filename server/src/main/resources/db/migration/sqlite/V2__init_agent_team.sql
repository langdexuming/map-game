-- =========================================================
-- V2 · S2 Agent / Team / Player (SQLite)
-- =========================================================

CREATE TABLE player (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(64) NOT NULL,
  level INTEGER DEFAULT 1,
  current_team_id INTEGER,
  coin INTEGER DEFAULT 5000,
  clue INTEGER DEFAULT 1200,
  star INTEGER DEFAULT 850,
  fuel INTEGER DEFAULT 200,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  avatar VARCHAR(255),
  agent_class VARCHAR(16),
  hp INTEGER DEFAULT 100,
  max_hp INTEGER DEFAULT 100,
  defense INTEGER DEFAULT 10,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  fatigue INTEGER DEFAULT 0
);
CREATE INDEX idx_agent_player ON agent (player_id);

CREATE TABLE team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  max_size INTEGER DEFAULT 5
);
CREATE INDEX idx_team_player ON team (player_id);

CREATE TABLE team_agent (
  team_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  PRIMARY KEY (team_id, agent_id),
  UNIQUE (team_id, slot)
);

CREATE TABLE skill (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  cooldown INTEGER DEFAULT 0,
  power INTEGER DEFAULT 10
);
CREATE INDEX idx_skill_agent ON skill (agent_id);

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
