-- V6: Conversion tracking, funnel events, unified users, UTM attribution
-- Fixes ghost tables (revenue_events, customer_health) that were referenced but never created

-- Revenue events (Stripe webhook target)
CREATE TABLE IF NOT EXISTS revenue_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  amount_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  plan_name TEXT,
  stripe_event_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  app_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_revenue_email ON revenue_events(customer_email, created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_type ON revenue_events(event_type, created_at);

-- Customer health scores (cron target)
CREATE TABLE IF NOT EXISTS customer_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  app_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  label TEXT DEFAULT 'new',
  login_frequency REAL DEFAULT 0,
  feature_breadth INTEGER DEFAULT 0,
  days_since_active INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_calculated TEXT DEFAULT (datetime('now')),
  UNIQUE(email, app_id)
);
CREATE INDEX IF NOT EXISTS idx_health_label ON customer_health(label, score);

-- Unified users — deduplicated across all apps
CREATE TABLE IF NOT EXISTS unified_users (
  email TEXT PRIMARY KEY,
  first_seen_app TEXT,
  first_seen_at TEXT,
  last_active_at TEXT,
  app_count INTEGER DEFAULT 1,
  apps_json TEXT,
  current_stage TEXT DEFAULT 'signup',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  is_test INTEGER DEFAULT 0,
  synced_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_unified_stage ON unified_users(current_stage, is_test);
CREATE INDEX IF NOT EXISTS idx_unified_source ON unified_users(utm_source, utm_medium);

-- Funnel events — tracks stage transitions
CREATE TABLE IF NOT EXISTS funnel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  stage TEXT NOT NULL,
  app_id TEXT,
  source TEXT,
  metadata_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_funnel_stage ON funnel_events(stage, created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_email ON funnel_events(email, stage);

-- Daily conversion snapshots
CREATE TABLE IF NOT EXISTS conversion_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  app_id TEXT,
  visitors INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  trials INTEGER DEFAULT 0,
  paid INTEGER DEFAULT 0,
  churned INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  UNIQUE(date, app_id)
);
CREATE INDEX IF NOT EXISTS idx_conv_daily ON conversion_daily(date, app_id);

-- UTM attribution log
CREATE TABLE IF NOT EXISTS utm_attributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  app_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_page TEXT,
  signed_up_at TEXT,
  converted_to_paid INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_utm_source ON utm_attributions(utm_source, utm_medium, created_at);

-- Event ingest log
CREATE TABLE IF NOT EXISTS ingest_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  email TEXT,
  properties_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ingest_app ON ingest_events(app_id, event_name, created_at);
