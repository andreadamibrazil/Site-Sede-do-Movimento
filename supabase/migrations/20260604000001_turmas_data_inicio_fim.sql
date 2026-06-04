-- Ciclos de turma: cada turma tem início e fim de período
-- Permite rastrear "Ballet Intermediário — Prof. Ana — Mar/2025 a Jul/2025"
-- vs "Ballet Intermediário — Prof. Carol — Ago/2025 a Dez/2025"

ALTER TABLE turmas
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_fim date;
