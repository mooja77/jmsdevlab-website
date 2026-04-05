-- JMS Dev Lab Admin Portal — Schema v2 additions

-- Track last login for "since last visit" briefing
ALTER TABLE sessions ADD COLUMN last_seen_at TEXT;

-- Revenue history (daily snapshots from Stripe)
CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  total_mrr REAL DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  charges_this_month REAL DEFAULT 0,
  refunds_this_month REAL DEFAULT 0,
  stripe_balance REAL DEFAULT 0,
  raw_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Lead pipeline
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  service_type TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  value_estimate REAL DEFAULT 0,
  next_action TEXT,
  next_action_date TEXT,
  source_message_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Custom dev projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  status TEXT DEFAULT 'prospect',
  value REAL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  start_date TEXT,
  target_end_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Project milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  completed_at TEXT,
  invoice_amount REAL DEFAULT 0,
  invoice_status TEXT DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Error count snapshots for trending
CREATE TABLE IF NOT EXISTS error_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  error_count INTEGER DEFAULT 0,
  snapshot_at TEXT DEFAULT (datetime('now'))
);

-- Achievement milestones
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  threshold REAL,
  achieved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_errors_app ON error_snapshots(app_id, snapshot_at);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(type);
CREATE INDEX IF NOT EXISTS idx_project_ms ON project_milestones(project_id, sort_order);

-- Seed milestones
INSERT OR IGNORE INTO milestones (type, title, description, threshold) VALUES
  ('revenue', 'First Dollar', 'First paying customer', 1),
  ('revenue', '$100 MRR', 'Monthly recurring revenue hits $100', 100),
  ('revenue', '$500 MRR', 'Monthly recurring revenue hits $500', 500),
  ('revenue', '$1,000 MRR', 'Monthly recurring revenue hits $1,000', 1000),
  ('revenue', '$5,000 MRR', 'Monthly recurring revenue hits $5,000', 5000),
  ('users', '50 Users', 'Total real users across all apps hits 50', 50),
  ('users', '100 Users', 'Total real users across all apps hits 100', 100),
  ('users', '500 Users', 'Total real users across all apps hits 500', 500),
  ('lead', 'First Lead Won', 'First Bark or enquiry lead converted to customer', 1),
  ('project', 'First Contract', 'First custom dev project signed', 1),
  ('streak', '7-Day Streak', 'Logged into portal 7 days in a row', 7),
  ('streak', '30-Day Streak', 'Logged into portal 30 days in a row', 30);

-- Mark First Dollar as achieved (JSM has $98 MRR)
UPDATE milestones SET achieved_at = '2026-03-28' WHERE title = 'First Dollar';

-- Seed Vegrify project
INSERT OR IGNORE INTO projects (id, name, client_name, client_email, status, value, currency, notes) VALUES
  ('vegrify-mvp', 'Vegrify MVP', 'Kate', NULL, 'proposal', 28875, 'EUR', 'RFQ submitted, call 2026-03-20. EUR 28,875. Awaiting decision.');
