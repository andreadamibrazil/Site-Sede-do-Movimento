-- Corrige política RLS de planos_aula que usava user_id (coluna inexistente)
-- em vez de id como chave primária de perfis_usuario.
-- O bug impedia qualquer escrita em planos_aula para usuários não-service_role.

DROP POLICY IF EXISTS "planos_aula_write_admin" ON planos_aula;

CREATE POLICY "planos_aula_write_admin" ON planos_aula
  FOR ALL TO authenticated
  USING (
    (SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) IN ('admin', 'secretaria')
  )
  WITH CHECK (
    (SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) IN ('admin', 'secretaria')
  );
