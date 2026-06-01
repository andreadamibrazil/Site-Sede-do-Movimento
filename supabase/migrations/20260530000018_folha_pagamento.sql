-- Faixas de hora/aula por quantidade de alunos na turma
-- Se turma_id = null, aplica globalmente a todas as turmas
CREATE TABLE IF NOT EXISTS faixas_hora_aula (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  min_alunos INT NOT NULL DEFAULT 0,
  max_alunos INT,                        -- null = sem limite superior
  valor_hora DECIMAL(8,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT faixas_hora_aula_unique UNIQUE(turma_id, min_alunos)
);

-- Faixas globais padrão
INSERT INTO faixas_hora_aula (turma_id, min_alunos, max_alunos, valor_hora) VALUES
  (null, 0,  5,    31.50),
  (null, 6,  10,   42.00),
  (null, 11, null, 52.50)
ON CONFLICT DO NOTHING;

-- Folha de pagamento mensal por professor
CREATE TABLE IF NOT EXISTS folhas_pagamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL REFERENCES professores(id),
  mes_referencia DATE NOT NULL,          -- primeiro dia do mês (ex: 2026-05-01)
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'enviado', 'assinado', 'pago')),
  valor_aulas DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_fixo DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  autentique_doc_id TEXT,
  assinado_em TIMESTAMPTZ,
  pago_em TIMESTAMPTZ,
  observacoes TEXT,
  gerado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professor_id, mes_referencia)
);

-- Itens da folha (uma linha por aula ou valor fixo)
CREATE TABLE IF NOT EXISTS itens_folha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folha_id UUID NOT NULL REFERENCES folhas_pagamento(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'aula'
    CHECK (tipo IN ('aula', 'fixo', 'bonus', 'desconto')),
  turma_id UUID REFERENCES turmas(id),
  aula_id UUID REFERENCES aulas(id),
  data_aula DATE,
  hora_inicio TIME,
  hora_fim TIME,
  horas_aula DECIMAL(4,2),
  num_alunos_mes INT DEFAULT 0,          -- alunos com mês completo na turma
  valor_hora_base DECIMAL(8,2),
  bonus_hora DECIMAL(8,2) DEFAULT 0,     -- bônus por faixa (= valor_hora - valor_base_minima)
  valor_hora_efetivo DECIMAL(8,2),
  descricao TEXT,
  valor DECIMAL(8,2) NOT NULL DEFAULT 0,
  pago BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faixas_hora_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE folhas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_folha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gerencia faixas" ON faixas_hora_aula FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin gerencia folhas" ON folhas_pagamento FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin gerencia itens" ON itens_folha FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON faixas_hora_aula TO authenticated, service_role;
GRANT ALL ON folhas_pagamento TO authenticated, service_role;
GRANT ALL ON itens_folha TO authenticated, service_role;
