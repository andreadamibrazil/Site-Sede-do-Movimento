-- Adiciona coluna valor_avulso em folhas_pagamento para separar lançamentos
-- avulsos (workshop, transporte pontual, etc.) do valor_fixo (salário fixo mensal).
-- Backfill: move os valores de itens avulsos para a nova coluna.

ALTER TABLE folhas_pagamento
  ADD COLUMN IF NOT EXISTS valor_avulso DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Recalcula todas as folhas existentes separando avulso de fixo
UPDATE folhas_pagamento fp
SET
  valor_fixo  = COALESCE((
    SELECT SUM(valor) FROM itens_folha
    WHERE folha_id = fp.id AND pago = true AND tipo IN ('fixo','bonus','desconto')
  ), 0),
  valor_avulso = COALESCE((
    SELECT SUM(valor) FROM itens_folha
    WHERE folha_id = fp.id AND pago = true AND tipo = 'avulso'
  ), 0);
