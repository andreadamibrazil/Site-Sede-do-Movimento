CREATE TABLE IF NOT EXISTS sync_config (
  chave TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sync_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role gerencia sync_config" ON sync_config FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON sync_config TO service_role;
