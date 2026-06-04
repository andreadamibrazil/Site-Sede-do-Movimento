-- Planos de aula por turma/ciclo
-- Professor envia o plano → Gemini extrai estrutura → salva aqui

CREATE TABLE IF NOT EXISTS planos_aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  data_inicio date,
  data_fim date,
  texto_original text NOT NULL,
  gemini_resumo text,
  gemini_conteudo jsonb,
  criado_por uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE planos_aula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planos_aula_read" ON planos_aula
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "planos_aula_write_admin" ON planos_aula
  FOR ALL TO authenticated
  USING ((SELECT perfil FROM perfis_usuario WHERE user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT perfil FROM perfis_usuario WHERE user_id = auth.uid()) = 'admin');
