-- V9: Agent Harness — agent registry, task queue, audit, budgets, messages, bulletins

-- Agent registry
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idle',
  app_id TEXT,
  config_json TEXT,
  capabilities_json TEXT,
  model_default TEXT DEFAULT 'sonnet',
  budget_daily_cents INTEGER DEFAULT 100,
  budget_spent_today_cents INTEGER DEFAULT 0,
  budget_reset_at TEXT,
  last_active_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Task queue
CREATE TABLE IF NOT EXISTS agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  type TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'queued',
  title TEXT NOT NULL,
  description TEXT,
  input_json TEXT,
  output_json TEXT,
  model_used TEXT,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  parent_task_id INTEGER,
  created_by TEXT DEFAULT 'human',
  claimed_at TEXT,
  completed_at TEXT,
  error_message TEXT,
  requires_approval INTEGER DEFAULT 0,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON agent_tasks(agent_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON agent_tasks(status, priority, created_at);

-- Inter-agent messages
CREATE TABLE IF NOT EXISTS agent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  thread_id TEXT,
  message_type TEXT DEFAULT 'info',
  subject TEXT,
  body TEXT NOT NULL,
  metadata_json TEXT,
  read_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_to ON agent_messages(to_agent, read_at, created_at);

-- Agent bulletins (shared context broadcasts)
CREATE TABLE IF NOT EXISTS agent_bulletins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  scope TEXT DEFAULT 'all',
  severity TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit trail
CREATE TABLE IF NOT EXISTS agent_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  task_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  model TEXT,
  tokens INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_agent ON agent_audit(agent_id, created_at);

-- Daily budget tracking
CREATE TABLE IF NOT EXISTS agent_budget_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  date TEXT NOT NULL,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  task_count INTEGER DEFAULT 0,
  UNIQUE(agent_id, date)
);

-- Seed the 12 app agents + supervisors + marketing + ops
INSERT OR IGNORE INTO agents (id, type, name, description, app_id, model_default, budget_daily_cents, config_json, capabilities_json) VALUES
  ('app-smartcash', 'app', 'SmartCash Agent', 'Manages SmartCash cashflow forecasting app', 'smartcash', 'sonnet', 10, '{"app_path":"C:/JM Programs/CashFlowAppV2","repo":"mooja77/CashFlowAppV2"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-profitshield', 'app', 'ProfitShield Agent', 'Manages ProfitShield margin analysis app', 'profitshield', 'sonnet', 10, '{"app_path":"C:/JM Programs/ProfitShield","repo":"mooja77/ProfitShield"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-jewelvalue', 'app', 'JewelValue Agent', 'Manages JewelValue appraisal app', 'jewelvalue', 'sonnet', 10, '{"app_path":"C:/JM Programs/JewelValue","repo":"mooja77/JewelValue"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-repairdesk', 'app', 'RepairDesk Agent', 'Manages RepairDesk repair tracking app', 'repairdesk', 'sonnet', 10, '{"app_path":"C:/JM Programs/RepairDesk","repo":"mooja77/RepairDesk"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-spamshield', 'app', 'SpamShield Agent', 'Manages SpamShield spam protection app', 'spamshield', 'sonnet', 10, '{"app_path":"C:/JM Programs/SpamShield","repo":"mooja77/SpamShield"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-themesweep', 'app', 'ThemeSweep Agent', 'Manages ThemeSweep theme auditor app', 'themesweep', 'sonnet', 10, '{"app_path":"C:/JM Programs/themesweep","repo":"mooja77/themesweep"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-jsm', 'app', 'JSM Agent', 'Manages Jewelry Studio Manager app', 'jsm', 'sonnet', 10, '{"app_path":"C:/JM Programs/Jewellery Studio Manager","repo":"mooja77/Jewellery-Studio-Manager"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-growthmap', 'app', 'GrowthMap Agent', 'Manages GrowthMap analytics app', 'growthmap', 'sonnet', 10, '{"app_path":"C:/JM Programs/GrowthMap","repo":"mooja77/GrowthMap"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-staffhub', 'app', 'StaffHub Agent', 'Manages StaffHub workforce app', 'staffhub', 'sonnet', 10, '{"app_path":"C:/JM Programs/Staff-Hub","repo":"mooja77/Staff-Hub"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-pitchside', 'app', 'PitchSide Agent', 'Manages PitchSide coaching app', 'pitchside', 'sonnet', 10, '{"app_path":"C:/JM Programs/PitchSide","repo":"mooja77/PitchSide"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-qualcanvas', 'app', 'QualCanvas Agent', 'Manages QualCanvas design app', 'qualcanvas', 'sonnet', 10, '{"app_path":"C:/JM Programs/Canvas-App","repo":"mooja77/Canvas-App"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('app-taxmatch', 'app', 'TaxMatch Agent', 'Manages TaxMatch tax compliance app', 'taxmatch', 'sonnet', 10, '{"app_path":"C:/JM Programs/TaxMatch","repo":"mooja77/TaxMatch"}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_send_external":false}'),
  ('supervisor-apps', 'supervisor', 'App Supervisor', 'Reviews app agent work, escalates issues', NULL, 'sonnet', 25, '{}', '{"can_read_code":true,"can_write_code":false,"can_deploy":false,"can_create_subtasks":true}'),
  ('supervisor-marketing', 'supervisor', 'Marketing Supervisor', 'Reviews marketing agent output', NULL, 'sonnet', 25, '{}', '{"can_read_code":false,"can_write_code":false,"can_send_external":false,"can_create_subtasks":true}'),
  ('marketing-social', 'marketing', 'Social Media Agent', 'Creates and schedules social media content', NULL, 'sonnet', 15, '{}', '{"can_read_code":false,"can_write_code":true,"can_send_external":false}'),
  ('marketing-content', 'marketing', 'Content Agent', 'Blog posts, dev.to articles, documentation', NULL, 'sonnet', 15, '{}', '{"can_read_code":true,"can_write_code":true,"can_send_external":false}'),
  ('marketing-seo', 'marketing', 'SEO Agent', 'Search optimization, meta tags, indexing', NULL, 'haiku', 15, '{}', '{"can_read_code":true,"can_write_code":true,"can_send_external":false}'),
  ('ops-infra', 'operations', 'Infrastructure Agent', 'CI/CD, costs, monitoring, deployments', NULL, 'sonnet', 20, '{}', '{"can_read_code":true,"can_write_code":true,"can_deploy":false,"can_create_subtasks":true}');
