CREATE TABLE IF NOT EXISTS lembretes_chamada (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(aula_id, tipo)
);

ALTER TABLE lembretes_chamada ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role gerencia lembretes" ON lembretes_chamada FOR ALL TO service_role USING (true) WITH CHECK (true);
GRANT ALL ON lembretes_chamada TO service_role;
