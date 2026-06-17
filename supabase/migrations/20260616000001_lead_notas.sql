-- ============================================================
-- lead_notas — anotações manuais sobre leads
-- Tabela separada de leads.observacoes para evitar race conditions
-- com o cron de análise de IA que também escreve nesse campo.
-- ============================================================

create table lead_notas (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  texto      text not null,
  created_at timestamptz not null default now()
);

-- Índice para busca por lead
create index lead_notas_lead_id_idx on lead_notas(lead_id);

-- RLS — segue o mesmo padrão das tabelas operacionais:
-- todos autenticados leem, apenas admin escreve.
-- (server actions usam service_role e bypass RLS)
alter table lead_notas enable row level security;

create policy "read_authenticated" on lead_notas
  for select to authenticated using (true);

create policy "write_admin" on lead_notas
  for insert to authenticated with check (is_admin());

create policy "update_admin" on lead_notas
  for update to authenticated using (is_admin()) with check (is_admin());

create policy "delete_admin" on lead_notas
  for delete to authenticated using (is_admin());

-- Grant
grant select, insert, update, delete on lead_notas to authenticated;
grant usage, select on all sequences in schema public to authenticated;
