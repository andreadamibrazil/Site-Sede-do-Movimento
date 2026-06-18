-- Co-regência: um professor secundário vinculado a uma turma
-- Necessário para chamada, folha de pagamento e plano de aula de professores que não são o professor_id principal da turma
create table if not exists turma_professores (
  turma_id     uuid not null references turmas(id) on delete cascade,
  professor_id uuid not null references professores(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (turma_id, professor_id)
);

create index if not exists turma_professores_professor_id_idx on turma_professores(professor_id);

alter table turma_professores enable row level security;
create policy "authenticated_all" on turma_professores for all to authenticated using (true) with check (true);
