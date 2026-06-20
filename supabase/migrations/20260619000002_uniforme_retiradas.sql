-- Tabela criada manualmente em produção sem migration correspondente.
-- Este arquivo documenta a estrutura para reprodução em novos ambientes.

CREATE TABLE IF NOT EXISTS uniforme_retiradas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id              uuid NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  item                  text NOT NULL,
  tamanho               text NOT NULL,
  quantidade            integer NOT NULL DEFAULT 1,
  valor                 numeric,
  observacao            text,
  responsavel_nome      text,
  responsavel_assinatura text,
  enviado_email         boolean DEFAULT false,
  enviado_em            timestamptz,
  assinado              boolean DEFAULT false,
  assinado_em           timestamptz,
  docuseal_id           text,
  registrado_por        uuid REFERENCES auth.users(id),
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE uniforme_retiradas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "uniforme_retiradas_staff" ON uniforme_retiradas;
CREATE POLICY "uniforme_retiradas_staff" ON uniforme_retiradas
  FOR ALL TO authenticated
  USING (
    (SELECT perfil FROM perfis_usuario WHERE id = auth.uid())
    IN ('admin', 'secretaria')
  );

GRANT ALL ON uniforme_retiradas TO authenticated;
