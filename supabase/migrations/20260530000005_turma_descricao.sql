-- Adiciona campo descricao à turma (texto curto para exibição e precificação)
alter table turmas add column if not exists descricao text;
