-- Adiciona colunas de referência ao Google Drive na tabela planos_aula
ALTER TABLE planos_aula
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_url text;
