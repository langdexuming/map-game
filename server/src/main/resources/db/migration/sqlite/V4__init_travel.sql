-- =========================================================
-- V4 · S4 Travel (SQLite)
-- =========================================================

CREATE TABLE route (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_city INTEGER NOT NULL,
  to_city INTEGER NOT NULL,
  vehicle_type INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  base_turn INTEGER NOT NULL,
  disabled INTEGER DEFAULT 0
);
CREATE INDEX idx_route_from ON route (from_city);
CREATE INDEX idx_route_to ON route (to_city);

CREATE TABLE schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  turn_interval INTEGER DEFAULT 3,
  next_depart_turn INTEGER NOT NULL,
  UNIQUE (route_id)
);

CREATE TABLE trip (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  mission_id INTEGER,
  route_ids VARCHAR(512),
  status VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
  start_turn INTEGER,
  arrive_turn INTEGER,
  paid_coin INTEGER,
  paid_fuel INTEGER
);
CREATE INDEX idx_trip_player ON trip (player_id);
CREATE INDEX idx_trip_status ON trip (status);

CREATE TABLE trip_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  event_code VARCHAR(32) NOT NULL,
  happened_turn INTEGER NOT NULL,
  payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_trip_event_trip ON trip_event (trip_id);

INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (1, 2, 1, 7000, 320, 2),
  (2, 1, 1, 7000, 320, 2),
  (1, 3, 1, 5500, 280, 2),
  (3, 1, 1, 5500, 280, 2),
  (1, 6, 1, 4000, 220, 2),
  (6, 1, 1, 4000, 220, 2),
  (2, 6, 1, 4500, 240, 2),
  (6, 2, 1, 4500, 240, 2),
  (3, 6, 1, 5000, 260, 2),
  (6, 3, 1, 5000, 260, 2);

INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (1, 3, 2, 5500, 130, 4),
  (3, 1, 2, 5500, 130, 4),
  (2, 6, 2, 4500, 110, 3),
  (6, 2, 2, 4500, 110, 3),
  (3, 4, 2, 800,  60,  1),
  (4, 3, 2, 800,  60,  1);

INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (3, 4, 3, 700, 80, 1),
  (4, 3, 3, 700, 80, 1),
  (1, 6, 3, 3500, 180, 3),
  (6, 1, 3, 3500, 180, 3);

INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (6, 5, 4, 1500, 90, 2),
  (5, 6, 4, 1500, 90, 2);

INSERT INTO route (from_city, to_city, vehicle_type, distance, base_price, base_turn) VALUES
  (4, 5, 5, 2000, 0, 5),
  (5, 4, 5, 2000, 0, 5);

INSERT INTO schedule (route_id, turn_interval, next_depart_turn)
  SELECT id, 3, 2 FROM route;
