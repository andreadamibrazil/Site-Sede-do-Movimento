-- ============================================================
-- Audit Log — rastreamento de modificações
-- Registra automaticamente: quem, quando, o que mudou
-- Funciona via trigger em todas as tabelas críticas
-- ============================================================

create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  tabela        text not null,
  operacao      text not null check (operacao in ('INSERT', 'UPDATE', 'DELETE')),
  registro_id   uuid,
  usuario_id    uuid,
  usuario_email text,
  dados_antes   jsonb,  -- valor anterior (null em INSERT)
  dados_depois  jsonb,  -- valor novo (null em DELETE)
  campos_alterados text[], -- quais campos mudaram (só em UPDATE)
  criado_em     timestamptz not null default now()
);

-- Index para buscas rápidas por tabela + registro
create index on audit_log(tabela, registro_id);
create index on audit_log(usuario_id);
create index on audit_log(criado_em desc);

-- Acesso: admin e secretaria podem ler, ninguém escreve diretamente
alter table audit_log enable row level security;
create policy "audit_read" on audit_log for select to authenticated using (true);
-- service_role tem acesso total via grant global

-- ============================================================
-- Função genérica de auditoria
-- ============================================================
create or replace function audit_trigger_fn()
returns trigger as $$
declare
  campos_alterados text[] := '{}';
  chave text;
  registro_id uuid;
begin
  -- Tenta pegar o ID do registro
  begin
    if TG_OP = 'DELETE' then
      registro_id := (row_to_json(OLD)->>'id')::uuid;
    else
      registro_id := (row_to_json(NEW)->>'id')::uuid;
    end if;
  exception when others then
    registro_id := null;
  end;

  -- Em UPDATE, descobre quais campos mudaram
  if TG_OP = 'UPDATE' then
    for chave in select key from jsonb_each(row_to_json(NEW)::jsonb)
    loop
      if row_to_json(OLD)::jsonb->chave is distinct from row_to_json(NEW)::jsonb->chave
         and chave not in ('updated_at') then
        campos_alterados := array_append(campos_alterados, chave);
      end if;
    end loop;
    -- Se só updated_at mudou, não loga
    if array_length(campos_alterados, 1) is null then
      return NEW;
    end if;
  end if;

  insert into audit_log (
    tabela,
    operacao,
    registro_id,
    usuario_id,
    usuario_email,
    dados_antes,
    dados_depois,
    campos_alterados
  ) values (
    TG_TABLE_NAME,
    TG_OP,
    registro_id,
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    case when TG_OP in ('UPDATE', 'DELETE') then row_to_json(OLD)::jsonb else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then row_to_json(NEW)::jsonb else null end,
    case when TG_OP = 'UPDATE' then campos_alterados else null end
  );

  if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Aplica o trigger nas tabelas críticas
-- ============================================================

create trigger audit_turmas
  after insert or update or delete on turmas
  for each row execute function audit_trigger_fn();

create trigger audit_alunos
  after insert or update or delete on alunos
  for each row execute function audit_trigger_fn();

create trigger audit_matriculas
  after insert or update or delete on matriculas
  for each row execute function audit_trigger_fn();

create trigger audit_matricula_turmas
  after insert or update or delete on matricula_turmas
  for each row execute function audit_trigger_fn();

create trigger audit_mensalidades
  after insert or update or delete on mensalidades
  for each row execute function audit_trigger_fn();

create trigger audit_pagamentos
  after insert or update or delete on pagamentos
  for each row execute function audit_trigger_fn();

create trigger audit_renegociacoes
  after insert or update or delete on renegociacoes
  for each row execute function audit_trigger_fn();

create trigger audit_perfis_usuario
  after insert or update or delete on perfis_usuario
  for each row execute function audit_trigger_fn();

create trigger audit_professores
  after insert or update or delete on professores
  for each row execute function audit_trigger_fn();

create trigger audit_presencas
  after insert or update or delete on presencas
  for each row execute function audit_trigger_fn();
