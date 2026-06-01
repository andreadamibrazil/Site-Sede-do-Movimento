-- Tabela de documentos vinculados a alunos
create table documentos_aluno (
  id            uuid primary key default gen_random_uuid(),
  aluno_id      uuid not null references alunos(id) on delete cascade,
  presenca_id   uuid references presencas(id) on delete set null, -- vincula a uma falta específica
  tipo          text not null check (tipo in ('atestado','autorizacao','contrato','rg','cpf','outro')),
  nome          text not null,        -- nome do arquivo exibido
  storage_path  text not null,        -- caminho no Supabase Storage
  observacao    text,
  criado_por    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

alter table documentos_aluno enable row level security;
create policy "doc_read"  on documentos_aluno for select to authenticated using (true);
create policy "doc_write" on documentos_aluno for all    to authenticated using (true) with check (true);
grant select, insert, update, delete on documentos_aluno to authenticated;

-- Audit log para documentos
create trigger audit_documentos
  after insert or update or delete on documentos_aluno
  for each row execute function audit_trigger_fn();

-- Regra de chamada: prazo 3 dias (não 7)
-- Registrado aqui como referência para Azure Functions
comment on table aulas is 'Chamada deve ser feita em até 3 dias após a aula. Após esse prazo, Azure Function marca todos como presentes e professor como faltou.';
