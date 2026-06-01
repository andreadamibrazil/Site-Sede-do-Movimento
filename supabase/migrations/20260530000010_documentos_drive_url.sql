-- Campo para link do Google Drive após arquivamento (Azure Function roda anualmente)
alter table documentos_aluno add column if not exists drive_url text;
alter table documentos_aluno add column if not exists arquivado_em timestamptz;
