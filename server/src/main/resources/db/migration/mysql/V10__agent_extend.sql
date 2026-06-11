-- =========================================================
-- V10 · 特工状态扩展
-- @author make java
-- @since 2026-06-11
-- =========================================================
USE map_game;

ALTER TABLE agent ADD COLUMN status VARCHAR(16) DEFAULT 'IDLE' COMMENT 'IDLE/RESTING/IN_TRANSIT/NEED_REST';
ALTER TABLE agent ADD COLUMN assigned_trip_id BIGINT COMMENT '当前关联行程';
