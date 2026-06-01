-- ============================================================
-- RLS por perfil — substitui políticas permissivas
-- admin: acesso total
-- authenticated (não-admin): só leitura na maioria das tabelas
-- ============================================================

-- Helper: verifica se o usuário logado é admin
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfis_usuario
    where id = auth.uid()
    and perfil = 'admin'
  );
$$;

-- ============================================================
-- Remove políticas antigas permissivas
-- ============================================================
do $$
declare
  t text;
  tables text[] := array[
    'modalidades','salas','professores','turmas','turma_horarios',
    'responsaveis','alunos','leads','matriculas','matricula_turmas',
    'termos_aditivos','trancamentos','aulas','presencas','substituicoes',
    'mensalidades','pagamentos','renegociacoes','avaliacoes',
    'espetaculos','inscricoes_espetaculo','perfis_usuario'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "authenticated_all" on %I', t);
  end loop;
end $$;

-- ============================================================
-- Tabelas de consulta (lookup) — todos autenticados leem,
-- apenas admin escreve
-- ============================================================
do $$
declare
  t text;
  lookup_tables text[] := array['modalidades','salas','espetaculos'];
begin
  foreach t in array lookup_tables loop
    execute format('create policy "read_authenticated" on %I for select to authenticated using (true)', t);
    execute format('create policy "write_admin" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- ============================================================
-- Tabelas operacionais — todos autenticados leem,
-- apenas admin escreve
-- ============================================================
do $$
declare
  t text;
  op_tables text[] := array[
    'turmas','turma_horarios','aulas','presencas','substituicoes',
    'professores','alunos','responsaveis','matriculas','matricula_turmas',
    'termos_aditivos','trancamentos','avaliacoes','inscricoes_espetaculo',
    'leads'
  ];
begin
  foreach t in array op_tables loop
    execute format('create policy "read_authenticated" on %I for select to authenticated using (true)', t);
    execute format('create policy "write_admin" on %I for insert to authenticated with check (is_admin())', t);
    execute format('create policy "update_admin" on %I for update to authenticated using (is_admin()) with check (is_admin())', t);
    execute format('create policy "delete_admin" on %I for delete to authenticated using (is_admin())', t);
  end loop;
end $$;

-- ============================================================
-- Tabelas financeiras — apenas admin acessa (leitura e escrita)
-- ============================================================
do $$
declare
  t text;
  fin_tables text[] := array['mensalidades','pagamentos','renegociacoes'];
begin
  foreach t in array fin_tables loop
    execute format('create policy "admin_only" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- ============================================================
-- perfis_usuario — usuário lê o próprio perfil, admin lê tudo
-- ============================================================
drop policy if exists "read_authenticated" on perfis_usuario;
drop policy if exists "admin_only"         on perfis_usuario;

create policy "read_own_profile" on perfis_usuario
  for select to authenticated
  using (id = auth.uid() or is_admin());

create policy "write_admin" on perfis_usuario
  for all to authenticated
  using (is_admin())
  with check (is_admin());
