-- Restringe audit_log: só admin lê
drop policy if exists "audit_read" on audit_log;

create policy "audit_admin_only" on audit_log
  for select to authenticated
  using (
    exists (
      select 1 from perfis_usuario
      where id = auth.uid()
        and perfil = 'admin'
        and ativo = true
    )
  );
