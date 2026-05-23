-- =========================================================
-- V7 · 世界主基地等级持久化 (SQLite)
-- @author make java
-- @since 2026-05-12
-- =========================================================

ALTER TABLE world ADD COLUMN hq_level INTEGER NOT NULL DEFAULT 1;
