-- JMS Dev Lab Master Admin Portal — D1 Schema

-- App registry
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_base_url TEXT,
  frontend_url TEXT,
  admin_key_name TEXT,
  has_admin INTEGER DEFAULT 0,
  hosting TEXT,
  github_repo TEXT,
  audit_score INTEGER DEFAULT 0,
  pricing_low REAL DEFAULT 0,
  pricing_high REAL DEFAULT 0,
  status TEXT DEFAULT 'live',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Cached health check results
CREATE TABLE IF NOT EXISTS health_cache (
  app_id TEXT PRIMARY KEY REFERENCES apps(id),
  status TEXT NOT NULL DEFAULT 'unknown',
  db_connected INTEGER,
  db_response_ms INTEGER,
  memory_mb REAL,
  version TEXT,
  uptime INTEGER,
  raw_json TEXT,
  checked_at TEXT DEFAULT (datetime('now'))
);

-- Cached dashboard metrics
CREATE TABLE IF NOT EXISTS dashboard_cache (
  app_id TEXT PRIMARY KEY REFERENCES apps(id),
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_signups_7d INTEGER DEFAULT 0,
  new_signups_30d INTEGER DEFAULT 0,
  mrr REAL DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  raw_json TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);

-- Cached billing data
CREATE TABLE IF NOT EXISTS billing_cache (
  app_id TEXT PRIMARY KEY REFERENCES apps(id),
  mrr REAL DEFAULT 0,
  arr REAL DEFAULT 0,
  paying_count INTEGER DEFAULT 0,
  trial_count INTEGER DEFAULT 0,
  churn_rate REAL DEFAULT 0,
  raw_json TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);

-- Site uptime monitoring
CREATE TABLE IF NOT EXISTS uptime_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL REFERENCES apps(id),
  url TEXT NOT NULL,
  status_code INTEGER,
  response_ms INTEGER,
  is_up INTEGER DEFAULT 1,
  checked_at TEXT DEFAULT (datetime('now'))
);

-- GitHub repo cache
CREATE TABLE IF NOT EXISTS github_cache (
  repo TEXT PRIMARY KEY,
  app_id TEXT REFERENCES apps(id),
  last_commit_sha TEXT,
  last_commit_msg TEXT,
  last_commit_date TEXT,
  open_prs INTEGER DEFAULT 0,
  ci_status TEXT,
  raw_json TEXT,
  fetched_at TEXT DEFAULT (datetime('now'))
);

-- Messages (Gmail, social media)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  category TEXT,
  from_address TEXT,
  subject TEXT,
  snippet TEXT,
  is_read INTEGER DEFAULT 0,
  is_starred INTEGER DEFAULT 0,
  received_at TEXT,
  raw_json TEXT,
  cached_at TEXT DEFAULT (datetime('now'))
);

-- Portal activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary TEXT,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Portal sessions
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- Config key-value store
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_uptime_app ON uptime_checks(app_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_cat ON messages(category, received_at);
CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at);

-- Seed: App registry
INSERT OR REPLACE INTO apps (id, name, api_base_url, frontend_url, admin_key_name, has_admin, hosting, github_repo, audit_score, pricing_low, pricing_high, status) VALUES
  ('smartcash', 'SmartCash', 'https://api.smartcashapp.net', 'https://smartcashapp.net', 'ADMIN_KEY_SMARTCASH', 1, 'vercel+railway', 'mooja77/smartcash', 15, 0, 49, 'live'),
  ('profitshield', 'ProfitShield', 'https://api.profitshield.app', 'https://profitshield.app', 'ADMIN_KEY_PROFITSHIELD', 1, 'vercel', 'mooja77/profitshield', 14, 19, 99, 'live'),
  ('jewelvalue', 'JewelValue', 'https://api.jewelvalue.app', 'https://jewelvalue.app', 'ADMIN_KEY_JEWELVALUE', 1, 'railway', 'mooja77/jewel-value', 13, 0, 49, 'live'),
  ('repairdesk', 'RepairDesk', 'https://api.repairdeskapp.net', 'https://repairdeskapp.net', 'ADMIN_KEY_REPAIRDESK', 1, 'railway', 'mooja77/repair-desk', 11, 0, 29, 'live'),
  ('qualcanvas', 'QualCanvas', 'https://canvas-app-production.up.railway.app', 'https://qualcanvas.com', 'ADMIN_KEY_QUALCANVAS', 1, 'cloudflare+railway', 'mooja77/canvas-app', 0, 0, 29, 'live'),
  ('themesweep', 'ThemeSweep', 'https://app.themesweep.app', 'https://themesweep.app', 'ADMIN_KEY_THEMESWEEP', 1, 'railway', 'mooja77/theme-sweep', 12, 9.99, 39.99, 'live'),
  ('spamshield', 'SpamShield', NULL, 'https://spamshield.app', 'ADMIN_KEY_SPAMSHIELD', 1, 'vercel+railway', 'mooja77/spam-shield', 11, 0, 19, 'live'),
  ('taxmatch', 'TaxMatch', NULL, 'https://taxmatch.app', 'ADMIN_KEY_TAXMATCH', 1, 'railway', 'mooja77/taxmatch', 0, 9.99, 24.99, 'live'),
  ('pitchside', 'PitchSide', NULL, 'https://pitchsideapp.net', 'ADMIN_KEY_PITCHSIDE', 1, 'vercel+firebase', 'mooja77/pitchside', 9, 0, 0, 'live'),
  ('jsm', 'JewelryStudioManager', 'https://jewelrystudiomanager.com', 'https://jewelrystudiomanager.com', 'ADMIN_KEY_JSM', 1, 'render', 'mooja77/custom-jewellery-manager', 10, 0, 249, 'live'),
  ('growthmap', 'GrowthMap', 'https://api.mygrowthmap.net', 'https://mygrowthmap.net', 'ADMIN_KEY_GROWTHMAP', 0, 'vercel+supabase', 'mooja77/growthmap', 10, 0, 12, 'live'),
  ('staffhub', 'StaffHub', 'https://api.staffhubapp.com', 'https://staffhubapp.com', 'ADMIN_KEY_STAFFHUB', 0, 'railway', 'mooja77/staff-hub', 9, 0, 29, 'live');
