-- Responsável financeiro por matrícula
-- Permite que pai pague uma modalidade e mãe pague outra (ex: família divorciada)

-- 1. Responsável passa a ter customer Asaas próprio
ALTER TABLE responsaveis ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- 2. Cada matrícula sabe explicitamente quem paga
--    NULL = usar regra padrão (responsável com permissão de cobrança, ou o próprio aluno)
ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS responsavel_financeiro_id UUID REFERENCES responsaveis(id);
