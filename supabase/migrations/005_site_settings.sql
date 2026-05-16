-- ============================================================
-- Migration 005: Site Settings (Shop Status)
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial status
INSERT INTO site_settings (key, value)
VALUES ('shop_status', '{"is_open": true, "manual_close": false, "closing_time": "18:00", "opening_time": "08:00"}')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view settings" ON site_settings
  FOR SELECT USING (true);

-- Only service role (staff/API) can update
-- (Handled by createAdminClient)
