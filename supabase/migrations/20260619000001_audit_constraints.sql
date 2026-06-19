-- Constraints de integridade apontadas na auditoria Gemini (2026-06-19)

-- 1. Unicidade de CPF em responsaveis (previne duplicatas na criação de conta de família)
ALTER TABLE responsaveis
  ADD CONSTRAINT IF NOT EXISTS responsaveis_cpf_unique UNIQUE (cpf);

-- 2. Unicidade de presença por aula/aluno (previne chamada duplicada via race condition)
ALTER TABLE presencas
  ADD CONSTRAINT IF NOT EXISTS presencas_aula_aluno_unique UNIQUE (aula_id, aluno_id);

-- 3. Unicidade de folha por professor/mês (previne geração duplicada de folha)
ALTER TABLE folhas_pagamento
  ADD CONSTRAINT IF NOT EXISTS folhas_prof_mes_unique UNIQUE (professor_id, mes_referencia);

-- 4. Check: valor_base do professor deve ser positivo se preenchido
ALTER TABLE professores
  ADD CONSTRAINT IF NOT EXISTS professores_valor_base_positivo
  CHECK (valor_base IS NULL OR valor_base >= 0);

-- 5. Função para incremento atômico de tentativas_contato (evita race condition)
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
