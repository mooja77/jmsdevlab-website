-- V5: Dimensional analytics — referrers, paths, countries, devices, browsers, status codes, hourly

-- Dimensional breakdowns (single table for all dimension types)
CREATE TABLE IF NOT EXISTS analytics_dimensions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  date TEXT NOT NULL,
  dimension TEXT NOT NULL,
  dim_value TEXT NOT NULL,
  requests INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  bytes INTEGER DEFAULT 0,
  fetched_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dims_unique ON analytics_dimensions(domain, date, dimension, dim_value);
CREATE INDEX IF NOT EXISTS idx_dims_lookup ON analytics_dimensions(domain, dimension, date);

-- Hourly traffic patterns
CREATE TABLE IF NOT EXISTS analytics_hourly (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  date TEXT NOT NULL,
  hour INTEGER NOT NULL,
  requests INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  bytes INTEGER DEFAULT 0,
  fetched_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hourly_unique ON analytics_hourly(domain, date, hour);

-- Weekly rollups for long-term trends
CREATE TABLE IF NOT EXISTS analytics_weekly_rollup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  week_start TEXT NOT NULL,
  dimension TEXT NOT NULL,
  dim_value TEXT NOT NULL,
  requests INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  bytes INTEGER DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_unique ON analytics_weekly_rollup(domain, week_start, dimension, dim_value);
