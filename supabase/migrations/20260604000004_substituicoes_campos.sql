-- Adiciona campos de substituição completos (nome, CPF, celular, termos)
-- Criados na sessão 2026-06-04 mas nunca aplicados ao banco

ALTER TABLE substituicoes
  ADD COLUMN IF NOT EXISTS substituto_nome text,
  ADD COLUMN IF NOT EXISTS substituto_cpf text,
  ADD COLUMN IF NOT EXISTS substituto_celular text,
  ADD COLUMN IF NOT EXISTS termos_aceitos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS termos_aceitos_em timestamptz,
  ADD COLUMN IF NOT EXISTS registrado_por uuid REFERENCES auth.users(id);

-- Índice para busca por aulas sem substituto registrado
CREATE INDEX IF NOT EXISTS idx_substituicoes_aula ON substituicoes(aula_id);
