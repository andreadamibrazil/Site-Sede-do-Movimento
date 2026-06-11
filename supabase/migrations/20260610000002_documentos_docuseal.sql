-- Campos para documentos gerados pelo DocuSeal (assinatura digital)
alter table documentos_aluno add column if not exists docuseal_submission_id text;
alter table documentos_aluno add column if not exists docuseal_url text;
-- 'pendente' | 'assinado' | null (para documentos sem DocuSeal)
alter table documentos_aluno add column if not exists docuseal_status text;
