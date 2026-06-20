-- Extrai campo temperatura do JSON observacoes para coluna própria
-- Isso permite filtrar e ordenar por temperatura no banco (não em memória)

ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperatura TEXT
  CHECK (temperatura IN ('fria', 'morna', 'quente'));

-- Migra dados existentes do JSON para a coluna
UPDATE leads
SET temperatura = (observacoes::jsonb)->>'temperatura'
WHERE observacoes IS NOT NULL
  AND (observacoes::jsonb)->>'temperatura' IN ('fria', 'morna', 'quente');

CREATE INDEX IF NOT EXISTS leads_temperatura_idx ON leads(temperatura);
