-- V7: Ghost tables (referenced but never created) + snapshot cache

-- Deployments (referenced by /api/deploy/history and cron/github.ts)
CREATE TABLE IF NOT EXISTS deployments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  platform TEXT DEFAULT 'github',
  status TEXT DEFAULT 'success',
  commit_sha TEXT,
  commit_message TEXT,
  duration_seconds INTEGER,
  deploy_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deployments_app ON deployments(app_id, created_at);

-- User journeys (referenced by /api/journeys/popular)
CREATE TABLE IF NOT EXISTS user_journeys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  user_email TEXT,
  page TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_journeys_app ON user_journeys(app_id, created_at);

-- Performance history (referenced by cron/uptime.ts and /api/deploy/performance)
CREATE TABLE IF NOT EXISTS performance_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  hour TEXT NOT NULL,
  avg_ms INTEGER DEFAULT 0,
  p95_ms INTEGER DEFAULT 0,
  max_ms INTEGER DEFAULT 0,
  check_count INTEGER DEFAULT 0,
  UNIQUE(app_id, hour)
);
CREATE INDEX IF NOT EXISTS idx_perf_app ON performance_history(app_id, hour);

-- Service costs (referenced by routes/costs.ts)
CREATE TABLE IF NOT EXISTS service_costs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  monthly_cost REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  notes TEXT,
  dashboard_url TEXT,
  last_invoice TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Error log (referenced by routes/errors.ts)
CREATE TABLE IF NOT EXISTS error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  error_type TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_email TEXT,
  endpoint TEXT,
  http_status INTEGER,
  count INTEGER DEFAULT 1,
  first_seen TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now')),
  resolved INTEGER DEFAULT 0,
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_error_app ON error_log(app_id, resolved, last_seen);

-- Snapshot cache (pre-computed slow endpoint data)
CREATE TABLE IF NOT EXISTS snapshot_cache (
  key TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  fetched_at TEXT DEFAULT (datetime('now'))
);
