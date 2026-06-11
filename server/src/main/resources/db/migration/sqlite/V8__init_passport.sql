-- =========================================================
-- V8 · 护照 / 印章 / 签证 / 里程 (SQLite)
-- @author make java
-- @since 2026-06-11
-- =========================================================

CREATE TABLE passport (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  mileage INTEGER DEFAULT 0,
  golden_coating INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (player_id)
);

CREATE TABLE passport_stamp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passport_id INTEGER NOT NULL,
  region_id INTEGER NOT NULL,
  stamped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (passport_id, region_id)
);
CREATE INDEX idx_passport_stamp_passport ON passport_stamp (passport_id);

CREATE TABLE passport_visa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passport_id INTEGER NOT NULL,
  region_id INTEGER NOT NULL,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (passport_id, region_id)
);
CREATE INDEX idx_passport_visa_passport ON passport_visa (passport_id);

CREATE TABLE passport_special_stamp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passport_id INTEGER NOT NULL,
  stamp_key VARCHAR(64) NOT NULL,
  obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (passport_id, stamp_key)
);
CREATE INDEX idx_passport_special_passport ON passport_special_stamp (passport_id);

CREATE TABLE mileage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passport_id INTEGER NOT NULL,
  trip_id INTEGER,
  distance INTEGER NOT NULL,
  logged_turn INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mileage_log_passport ON mileage_log (passport_id);

INSERT INTO passport (player_id, mileage, golden_coating) VALUES (1, 0, 0);
