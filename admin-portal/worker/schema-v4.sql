-- V4: Visitors & Analytics — tracking detection + daily traffic snapshots

-- Tracking tag detection per domain
CREATE TABLE IF NOT EXISTS tracking_status (
  domain TEXT PRIMARY KEY,
  has_gtm INTEGER DEFAULT 0,
  gtm_id TEXT,
  has_ga4 INTEGER DEFAULT 0,
  ga4_id TEXT,
  has_meta INTEGER DEFAULT 0,
  meta_id TEXT,
  has_gads INTEGER DEFAULT 0,
  gads_id TEXT,
  has_gsc_verify INTEGER DEFAULT 0,
  cf_zone_id TEXT,
  dns_resolves INTEGER DEFAULT 1,
  checked_at TEXT DEFAULT (datetime('now'))
);

-- Daily analytics snapshots per domain (from Cloudflare)
CREATE TABLE IF NOT EXISTS analytics_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  date TEXT NOT NULL,
  pageviews INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  uniques INTEGER DEFAULT 0,
  requests INTEGER DEFAULT 0,
  bandwidth_bytes INTEGER DEFAULT 0,
  threats INTEGER DEFAULT 0,
  top_paths TEXT,
  top_countries TEXT,
  fetched_at TEXT DEFAULT (datetime('now')),
  UNIQUE(domain, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_domain ON analytics_daily(domain, date);
