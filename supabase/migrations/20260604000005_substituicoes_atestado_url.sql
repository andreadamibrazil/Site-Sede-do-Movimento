-- URL do atestado médico enviado pelo professor
ALTER TABLE substituicoes
  ADD COLUMN IF NOT EXISTS atestado_url text;
