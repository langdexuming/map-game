-- =========================================================
-- V8 · 护照 / 印章 / 签证 / 里程
-- @author make java
-- @since 2026-06-11
-- =========================================================
USE map_game;

CREATE TABLE passport (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  player_id       BIGINT NOT NULL,
  mileage         INT DEFAULT 0,
  golden_coating  TINYINT DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_player (player_id)
) COMMENT='特工护照';

CREATE TABLE passport_stamp (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  passport_id     BIGINT NOT NULL,
  region_id       BIGINT NOT NULL,
  stamped_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_passport_region (passport_id, region_id),
  INDEX idx_passport (passport_id)
) COMMENT='区域印章';

CREATE TABLE passport_visa (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  passport_id     BIGINT NOT NULL,
  region_id       BIGINT NOT NULL,
  purchased_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_passport_visa (passport_id, region_id),
  INDEX idx_passport (passport_id)
) COMMENT='区域签证';

CREATE TABLE passport_special_stamp (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  passport_id     BIGINT NOT NULL,
  stamp_key       VARCHAR(64) NOT NULL,
  obtained_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_passport_key (passport_id, stamp_key),
  INDEX idx_passport (passport_id)
) COMMENT='限定印章';

CREATE TABLE mileage_log (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  passport_id     BIGINT NOT NULL,
  trip_id         BIGINT,
  distance        INT NOT NULL,
  logged_turn     INT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_passport (passport_id)
) COMMENT='里程记录';

INSERT INTO passport (player_id, mileage, golden_coating) VALUES (1, 0, 0);
