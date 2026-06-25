-- GRANT anterior era amplo demais (INSERT/UPDATE/DELETE para authenticated)
-- Qualquer usuário logado poderia alterar co-regência via REST direto
-- A app usa service_role para todas as escritas — DML para authenticated é desnecessário
REVOKE INSERT, UPDATE, DELETE ON turma_professores FROM authenticated;
REVOKE ALL ON turma_professores FROM anon;

-- Leitura para authenticated é suficiente (middleware valida via service_role de qualquer forma)
GRANT SELECT ON turma_professores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON turma_professores TO service_role;
