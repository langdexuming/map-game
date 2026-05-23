-- =========================================================
-- V7 · 世界主基地等级持久化 (MySQL)
-- @author make java
-- @since 2026-05-12
-- =========================================================

USE map_game;

ALTER TABLE world
  ADD COLUMN hq_level INT NOT NULL DEFAULT 1 COMMENT '主基地等级 1-5' AFTER turn_no;
