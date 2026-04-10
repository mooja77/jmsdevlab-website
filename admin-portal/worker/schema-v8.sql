-- V8: Critical path checks — automated monitoring of all app pages

CREATE TABLE IF NOT EXISTS critical_path_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  check_type TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL,
  http_status INTEGER,
  response_ms INTEGER,
  error_message TEXT,
  checked_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cp_app ON critical_path_checks(app_id, check_type, checked_at);
