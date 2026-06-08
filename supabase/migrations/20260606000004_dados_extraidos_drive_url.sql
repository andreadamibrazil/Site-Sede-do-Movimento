-- Arquivamento de dados_extraidos para Google Drive após 90 dias
-- dados_extraidos_drive_url: URL do JSON arquivado no Drive (campo dados_extraidos zerado após)
ALTER TABLE documentos_aluno
  ADD COLUMN IF NOT EXISTS dados_extraidos_drive_url TEXT;
