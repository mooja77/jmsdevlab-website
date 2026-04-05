-- JMS Dev Lab Admin Portal — Schema v3: Bark Lead Finder

-- Bark leads parsed from email notifications
CREATE TABLE IF NOT EXISTS bark_leads (
  id TEXT PRIMARY KEY,
  gmail_message_id TEXT UNIQUE,
  first_name TEXT NOT NULL,
  location TEXT,
  business_type TEXT,
  project_description TEXT,
  budget TEXT,
  timeline TEXT,
  hiring_intent TEXT,
  bark_category TEXT,
  partial_phone TEXT,
  partial_email TEXT,
  phone_prefix TEXT,
  email_first_char TEXT,
  email_char_count INTEGER,
  email_last_char TEXT,
  email_domain TEXT,
  received_at TEXT,
  status TEXT DEFAULT 'new',
  matched_name TEXT,
  matched_email TEXT,
  matched_phone TEXT,
  matched_linkedin TEXT,
  matched_website TEXT,
  matched_company TEXT,
  confidence INTEGER DEFAULT 0,
  research_notes TEXT,
  lead_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bark_status ON bark_leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_bark_gmail ON bark_leads(gmail_message_id);
