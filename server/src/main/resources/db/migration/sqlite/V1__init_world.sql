-- =========================================================
-- V1 · S1 World (SQLite)
-- =========================================================

DROP TABLE IF EXISTS map_view_config;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS world;

CREATE TABLE world (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(64) NOT NULL,
  turn_no INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE region (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  world_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  theme VARCHAR(32),
  map_bg_url VARCHAR(255)
);
CREATE INDEX idx_region_world ON region (world_id);

CREATE TABLE city (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  level INTEGER DEFAULT 2,
  lng NUMERIC NOT NULL,
  lat NUMERIC NOT NULL,
  unlocked INTEGER DEFAULT 0
);
CREATE INDEX idx_city_region ON city (region_id);

CREATE TABLE map_view_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  view_type VARCHAR(16) NOT NULL,
  city_id INTEGER NOT NULL,
  payload TEXT,
  UNIQUE (view_type, city_id)
);

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
