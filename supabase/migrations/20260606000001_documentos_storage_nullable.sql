-- storage_path agora é opcional: documentos novos vão direto ao Google Drive
alter table documentos_aluno alter column storage_path drop not null;
alter table documentos_aluno alter column storage_path set default null;
