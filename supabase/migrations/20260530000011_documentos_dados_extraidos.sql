-- Dados extraídos automaticamente pelo Gemini ao subir o documento
alter table documentos_aluno add column if not exists dados_extraidos jsonb;
-- Ex: { "nome_paciente": "Ana Clara", "crm": "12345/RJ", "data_consulta": "2026-05-28",
--       "hora_consulta": "14:30", "data_inicio": "2026-05-28", "data_fim": "2026-05-30",
--       "diagnostico": "Síndrome gripal", "nome_medico": "Dr. João Silva" }
