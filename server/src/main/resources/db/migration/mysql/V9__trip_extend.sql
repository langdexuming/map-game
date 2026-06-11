-- =========================================================
-- V9 · 行程扩展字段
-- @author make java
-- @since 2026-06-11
-- =========================================================
USE map_game;

ALTER TABLE trip ADD COLUMN from_city_id BIGINT COMMENT '出发城市';
ALTER TABLE trip ADD COLUMN to_city_id BIGINT COMMENT '目的城市';
ALTER TABLE trip ADD COLUMN lead_agent_id BIGINT COMMENT '带队特工';
ALTER TABLE trip ADD COLUMN departure_turn INT COMMENT '计划出发回合';
ALTER TABLE trip ADD COLUMN plan_json JSON COMMENT '方案快照';
ALTER TABLE trip ADD COLUMN force_depart TINYINT DEFAULT 0 COMMENT '强行出发';
ALTER TABLE trip ADD COLUMN delay_turn INT DEFAULT 0 COMMENT '累计延误';
ALTER TABLE trip ADD COLUMN elapsed_turn INT DEFAULT 0 COMMENT '已行进回合';
