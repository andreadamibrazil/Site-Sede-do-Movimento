-- Experimentais: agendamentos de aula experimental para leads
CREATE TABLE IF NOT EXISTS experimentais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'agendado'
    CHECK (status IN ('agendado', 'presente', 'nao_compareceu', 'convertido')),
  observacoes TEXT,
  notificou_professor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, aula_id)
);

ALTER TABLE experimentais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated pode tudo em experimentais"
  ON experimentais FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON experimentais TO authenticated;
