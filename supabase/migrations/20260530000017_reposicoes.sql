-- Reposições: quando professor falta sem substituto, deve repor a aula em 4 dias
CREATE TABLE IF NOT EXISTS reposicoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  substituicao_id UUID NOT NULL REFERENCES substituicoes(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id),
  professor_id UUID NOT NULL REFERENCES professores(id),
  prazo DATE NOT NULL,                          -- aula_original.data + 4 dias úteis
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'agendada', 'concluida', 'expirada')),
  aula_reposicao_id UUID REFERENCES aulas(id),  -- preenchido quando professor agendar
  notificou_secretaria BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(substituicao_id)
);

ALTER TABLE reposicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e secretaria gerenciam reposicoes"
  ON reposicoes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT ALL ON reposicoes TO authenticated;
GRANT ALL ON reposicoes TO service_role;
