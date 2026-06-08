-- Adiciona colunas que faltavam em termos_aditivos
ALTER TABLE termos_aditivos
  ADD COLUMN IF NOT EXISTS motivo TEXT,
  ADD COLUMN IF NOT EXISTS antes JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS depois JSONB,
  ADD COLUMN IF NOT EXISTS contrato_status TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES auth.users(id),
  ALTER COLUMN data_vigencia SET DEFAULT now();
