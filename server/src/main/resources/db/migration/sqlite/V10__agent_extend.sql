-- =========================================================
-- V10 · 特工状态扩展 (SQLite)
-- @author make java
-- @since 2026-06-11
-- =========================================================

ALTER TABLE agent ADD COLUMN status VARCHAR(16) DEFAULT 'IDLE';
ALTER TABLE agent ADD COLUMN assigned_trip_id INTEGER;
