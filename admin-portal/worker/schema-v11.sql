-- V11: Best-of-breed patterns — policy engine, file claims, failure taxonomy, review chain

-- Policy engine (from Claw Code pattern)
CREATE TABLE IF NOT EXISTS agent_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  agent_scope TEXT DEFAULT 'all',
  condition_json TEXT NOT NULL,
  action TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 5,
  created_at TEXT DEFAULT (datetime('now'))
);

-- File claims / ownership (from Continuous-Claude-v3 pattern)
CREATE TABLE IF NOT EXISTS agent_file_claims (
  file_path TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_id INTEGER NOT NULL,
  claimed_at TEXT DEFAULT (datetime('now')),
  released_at TEXT,
  PRIMARY KEY (file_path, agent_id)
);

-- Failure taxonomy + review chain + blocking
ALTER TABLE agent_tasks ADD COLUMN failure_type TEXT;
ALTER TABLE agent_tasks ADD COLUMN blocked_by TEXT;
ALTER TABLE agent_tasks ADD COLUMN review_task_id INTEGER;

-- Seed policies
INSERT INTO agent_policies (name, agent_scope, condition_json, action, priority) VALUES
  ('Auto-approve health checks', 'all', '{"type":"task_type_is","value":"health-check"}', 'auto_approve', 1),
  ('Auto-approve status lookups', 'all', '{"type":"task_type_is","value":"status-lookup"}', 'auto_approve', 1),
  ('Auto-approve audits', 'all', '{"type":"task_type_is","value":"audit"}', 'auto_approve', 2),
  ('Auto-approve code reviews (read-only)', 'all', '{"type":"task_type_is","value":"code-review"}', 'auto_approve', 2),
  ('Block on budget exceeded', 'all', '{"type":"budget_over_pct","value":100}', 'block', 1),
  ('Notify on budget warning', 'all', '{"type":"budget_over_pct","value":80}', 'notify', 3),
  ('Escalate after max retries', 'all', '{"type":"retry_exceeded"}', 'escalate', 1),
  ('Auto-approve scheduled tasks', 'all', '{"type":"created_by_is","value":"schedule"}', 'auto_approve', 2);
