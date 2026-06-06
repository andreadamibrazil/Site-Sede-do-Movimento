-- Termos aditivos de matrícula
-- Registra alterações contratuais sem criar nova matrícula

create type tipo_aditivo as enum ('turma', 'preco', 'plano', 'desconto');

create table termos_aditivos (
  id            uuid primary key default gen_random_uuid(),
  matricula_id  uuid not null references matriculas(id) on delete cascade,
  tipo          tipo_aditivo not null,
  motivo        text,

  -- snapshot antes e depois (JSON flexível por tipo)
  antes         jsonb not null default '{}',
  depois        jsonb not null default '{}',

  -- assinatura DocuSeal
  docuseal_submission_id text,
  contrato_status text not null default 'pendente', -- pendente | enviado | assinado

  criado_por    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

alter table termos_aditivos enable row level security;

create policy "staff vê todos os termos" on termos_aditivos
  for all using (
    exists (
      select 1 from perfis_usuario
      where id = auth.uid() and perfil in ('admin','secretaria')
    )
  );

create index on termos_aditivos(matricula_id);
