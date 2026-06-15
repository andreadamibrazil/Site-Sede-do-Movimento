-- Transporte mensal no perfil do professor (admin-only, auto-incluído na folha)
ALTER TABLE professores ADD COLUMN IF NOT EXISTS valor_transporte NUMERIC(10,2);

-- Dados extraídos pelo Gemini do comprovante de pagamento
ALTER TABLE folhas_pagamento ADD COLUMN IF NOT EXISTS comprovante_dados JSONB;
