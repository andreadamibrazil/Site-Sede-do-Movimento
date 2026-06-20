-- Coluna adicionada manualmente em produção sem migration correspondente.
-- Usada no dashboard de inadimplência e no assistente IA.

ALTER TABLE alunos
  ADD COLUMN IF NOT EXISTS tentativas_contato integer NOT NULL DEFAULT 0;

-- A função incrementar_tentativas_contato foi criada em 20260619000001_audit_constraints.sql
-- mas dependia desta coluna existir. Esta migration garante a coluna em ambientes novos.
