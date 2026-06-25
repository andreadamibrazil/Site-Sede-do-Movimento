-- turma_professores foi criada em 20260618 sem grants explícitos para service_role
-- Resultado: service_role recebia "permission denied" silenciosamente em todas as queries
-- Isso bloqueava co-professores de fazer chamada e exibia turmas incorretas
GRANT SELECT, INSERT, UPDATE, DELETE ON turma_professores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON turma_professores TO authenticated;
