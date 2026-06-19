-- Constraints de integridade apontadas na auditoria Gemini (2026-06-19)
-- Usa DO $$ ... $$ para evitar erro se constraint já existir

-- 1. Unicidade de celular em leads (necessário para upsert ON CONFLICT no webhook chatwoot-leads)
--    ATENÇÃO: vai falhar se já existem celulares duplicados na tabela leads.
--    Antes de aplicar em produção: SELECT celular, count(*) FROM leads GROUP BY celular HAVING count(*) > 1;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_celular_unique') THEN
    -- Remove index simples se existir (será substituído pelo unique)
    DROP INDEX IF EXISTS leads_celular_idx;
    ALTER TABLE leads ADD CONSTRAINT leads_celular_unique UNIQUE (celular);
  END IF;
END $$;

-- 2. Unicidade de CPF em responsaveis (previne duplicatas na criação de conta de família)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'responsaveis_cpf_unique') THEN
    ALTER TABLE responsaveis ADD CONSTRAINT responsaveis_cpf_unique UNIQUE (cpf);
  END IF;
END $$;

-- 3. Unicidade de presença por aula/aluno (previne chamada duplicada via race condition)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'presencas_aula_aluno_unique') THEN
    ALTER TABLE presencas ADD CONSTRAINT presencas_aula_aluno_unique UNIQUE (aula_id, aluno_id);
  END IF;
END $$;

-- 4. Unicidade de folha por professor/mês (previne geração duplicada de folha)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'folhas_prof_mes_unique') THEN
    ALTER TABLE folhas_pagamento ADD CONSTRAINT folhas_prof_mes_unique UNIQUE (professor_id, mes_referencia);
  END IF;
END $$;

-- 5. Check: valor_base do professor deve ser positivo se preenchido
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'professores_valor_base_positivo') THEN
    ALTER TABLE professores ADD CONSTRAINT professores_valor_base_positivo
      CHECK (valor_base IS NULL OR valor_base >= 0);
  END IF;
END $$;

-- 6. Função para incremento atômico de tentativas_contato (evita race condition)
CREATE OR REPLACE FUNCTION incrementar_tentativas_contato(p_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_novo INTEGER;
BEGIN
  UPDATE alunos
  SET tentativas_contato = COALESCE(tentativas_contato, 0) + 1
  WHERE id = p_id
  RETURNING tentativas_contato INTO v_novo;
  RETURN v_novo;
END;
$$;

-- Garante que a função é acessível para o service role
GRANT EXECUTE ON FUNCTION incrementar_tentativas_contato(UUID) TO service_role;
