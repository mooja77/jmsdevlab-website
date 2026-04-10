-- V10: Agent Harness hardening — heartbeat, retry, scheduling

-- Add heartbeat and retry columns to agent_tasks
ALTER TABLE agent_tasks ADD COLUMN heartbeat_at TEXT;
ALTER TABLE agent_tasks ADD COLUMN retry_count INTEGER DEFAULT 0;
ALTER TABLE agent_tasks ADD COLUMN max_retries INTEGER DEFAULT 2;

-- Scheduled/recurring tasks
CREATE TABLE IF NOT EXISTS agent_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  task_type TEXT NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_input_json TEXT,
  task_priority INTEGER DEFAULT 5,
  enabled INTEGER DEFAULT 1,
  last_run_at TEXT,
  next_run_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_schedules_next ON agent_schedules(enabled, next_run_at);

-- Seed Dawn Patrol schedules (07:00 UTC daily)
INSERT OR IGNORE INTO agent_schedules (agent_id, name, cron_expression, task_type, task_title, task_description, task_priority)
VALUES
  ('supervisor-apps', 'Dawn Patrol', '0 7 * * *', 'health-check', 'Morning health review', 'Review overnight errors across all apps. Check health status. Flag anything that needs attention.', 3);
