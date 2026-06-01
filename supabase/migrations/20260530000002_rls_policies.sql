-- ============================================================
-- RLS Policies — GetDance
-- service_role tem acesso total (scripts, migração, Azure Functions)
-- authenticated usa políticas por perfil (via perfis_usuario)
-- ============================================================

-- Garante acesso do service_role a todas as tabelas
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Habilita RLS em todas as tabelas
alter table modalidades         enable row level security;
alter table salas               enable row level security;
alter table professores         enable row level security;
alter table turmas              enable row level security;
alter table turma_horarios      enable row level security;
alter table responsaveis        enable row level security;
alter table alunos              enable row level security;
alter table leads               enable row level security;
alter table matriculas          enable row level security;
alter table matricula_turmas    enable row level security;
alter table termos_aditivos     enable row level security;
alter table trancamentos        enable row level security;
alter table aulas               enable row level security;
alter table presencas           enable row level security;
alter table substituicoes       enable row level security;
alter table mensalidades        enable row level security;
alter table pagamentos          enable row level security;
alter table renegociacoes       enable row level security;
alter table avaliacoes          enable row level security;
alter table espetaculos         enable row level security;
alter table inscricoes_espetaculo enable row level security;
alter table perfis_usuario      enable row level security;

-- ============================================================
-- Políticas: authenticated pode ler/escrever tudo por enquanto
-- (refinamos por perfil na próxima fase)
-- ============================================================

-- Helper: verifica se o usuário está no sistema
-- Políticas simples: qualquer usuário autenticado acessa tudo
-- (refinamos por perfil na próxima fase quando criarmos perfis_usuario)
create policy "authenticated_all" on modalidades         for all to authenticated using (true) with check (true);
create policy "authenticated_all" on salas               for all to authenticated using (true) with check (true);
create policy "authenticated_all" on professores         for all to authenticated using (true) with check (true);
create policy "authenticated_all" on turmas              for all to authenticated using (true) with check (true);
create policy "authenticated_all" on turma_horarios      for all to authenticated using (true) with check (true);
create policy "authenticated_all" on responsaveis        for all to authenticated using (true) with check (true);
create policy "authenticated_all" on alunos              for all to authenticated using (true) with check (true);
create policy "authenticated_all" on leads               for all to authenticated using (true) with check (true);
create policy "authenticated_all" on matriculas          for all to authenticated using (true) with check (true);
create policy "authenticated_all" on matricula_turmas    for all to authenticated using (true) with check (true);
create policy "authenticated_all" on termos_aditivos     for all to authenticated using (true) with check (true);
create policy "authenticated_all" on trancamentos        for all to authenticated using (true) with check (true);
create policy "authenticated_all" on aulas               for all to authenticated using (true) with check (true);
create policy "authenticated_all" on presencas           for all to authenticated using (true) with check (true);
create policy "authenticated_all" on substituicoes       for all to authenticated using (true) with check (true);
create policy "authenticated_all" on mensalidades        for all to authenticated using (true) with check (true);
create policy "authenticated_all" on pagamentos          for all to authenticated using (true) with check (true);
create policy "authenticated_all" on renegociacoes       for all to authenticated using (true) with check (true);
create policy "authenticated_all" on avaliacoes          for all to authenticated using (true) with check (true);
create policy "authenticated_all" on espetaculos         for all to authenticated using (true) with check (true);
create policy "authenticated_all" on inscricoes_espetaculo for all to authenticated using (true) with check (true);
create policy "authenticated_all" on perfis_usuario      for all to authenticated using (true) with check (true);
