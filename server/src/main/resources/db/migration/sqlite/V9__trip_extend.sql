-- =========================================================
-- V9 · 行程扩展字段 (SQLite)
-- @author make java
-- @since 2026-06-11
-- =========================================================

ALTER TABLE trip ADD COLUMN from_city_id INTEGER;
ALTER TABLE trip ADD COLUMN to_city_id INTEGER;
ALTER TABLE trip ADD COLUMN lead_agent_id INTEGER;
ALTER TABLE trip ADD COLUMN departure_turn INTEGER;
ALTER TABLE trip ADD COLUMN plan_json TEXT;
ALTER TABLE trip ADD COLUMN force_depart INTEGER DEFAULT 0;
ALTER TABLE trip ADD COLUMN delay_turn INTEGER DEFAULT 0;
ALTER TABLE trip ADD COLUMN elapsed_turn INTEGER DEFAULT 0;
