-- A migration 20260618000002 criou a policy "authenticated_all" dando DML irrestrito
-- para qualquer usuário autenticado em turma_professores.
-- A migration 20260625000002 fez REVOKE no nível de GRANT (correto), mas a policy RLS
-- em si nunca foi dropada — fica no pg_policies como código morto e confunde auditorias.
-- Esta migration dropa a policy antiga e cria políticas explícitas e mínimas.

-- Dropa policy antiga (ampla demais)
DROP POLICY IF EXISTS "authenticated_all" ON turma_professores;

-- Leitura: qualquer usuário autenticado pode ver co-regências (necessário para o middleware)
CREATE POLICY "turma_professores_select_authenticated"
  ON turma_professores FOR SELECT
  TO authenticated
  USING (true);

-- Escrita: apenas admin e secretaria via RLS direta
-- (na prática a app usa service_role que bypassa RLS, mas esta policy fecha a API REST)
CREATE POLICY "turma_professores_write_admin"
  ON turma_professores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfis_usuario
      WHERE id = auth.uid()
        AND perfil IN ('admin', 'secretaria')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfis_usuario
      WHERE id = auth.uid()
        AND perfil IN ('admin', 'secretaria')
    )
  );
