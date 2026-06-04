-- Conceito de família: agrupa responsáveis e alunos sob uma mesma conta
-- Cada membro tem um ou mais papéis: aluno, responsavel, contato, pagador
-- Design não-destrutivo: alunos e responsáveis existentes ficam intactos

CREATE TABLE IF NOT EXISTS familias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membros da família — unifica alunos e responsáveis em uma visão familiar
CREATE TABLE IF NOT EXISTS familia_membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
  -- Aponta para aluno (se for aluno) ou responsavel (se for só responsável)
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  responsavel_id uuid REFERENCES responsaveis(id) ON DELETE CASCADE,
  -- Papéis desta pessoa na família
  papeis text[] NOT NULL DEFAULT '{"aluno"}',
  -- Campos para quem não tem aluno_id nem responsavel_id ainda (lead convertido)
  nome text,
  cpf text,
  celular text,
  email text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT membro_tem_referencia CHECK (
    aluno_id IS NOT NULL OR responsavel_id IS NOT NULL OR nome IS NOT NULL
  )
);

-- FK: alunos e responsáveis podem pertencer a uma família
ALTER TABLE alunos ADD COLUMN IF NOT EXISTS familia_id uuid REFERENCES familias(id);
ALTER TABLE responsaveis ADD COLUMN IF NOT EXISTS familia_id uuid REFERENCES familias(id);

-- RLS
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY familias_read ON familias FOR SELECT TO authenticated USING (true);
CREATE POLICY familias_write ON familias FOR ALL TO authenticated
  USING ((SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) = 'admin');

CREATE POLICY familia_membros_read ON familia_membros FOR SELECT TO authenticated USING (true);
CREATE POLICY familia_membros_write ON familia_membros FOR ALL TO authenticated
  USING ((SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT perfil FROM perfis_usuario WHERE id = auth.uid()) = 'admin');
