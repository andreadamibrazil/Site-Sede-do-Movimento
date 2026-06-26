-- Constraint UNIQUE em substituicoes(aula_id) necessária para upsert funcionar
-- O código em api/chamada/salvar/route.ts faz:
--   sb.from('substituicoes').upsert({...}, { onConflict: 'aula_id' })
-- Sem a constraint, o Supabase ignora o onConflict e insere duplicatas a cada chamada
-- com profFaltou=true, gerando múltiplos registros para a mesma aula.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'substituicoes_aula_id_unique') THEN
    -- Antes de adicionar: garante que não existem duplicatas (apaga a mais antiga de cada grupo)
    DELETE FROM substituicoes s1
    USING substituicoes s2
    WHERE s1.aula_id = s2.aula_id
      AND s1.created_at < s2.created_at
      AND s1.id <> s2.id;

    ALTER TABLE substituicoes ADD CONSTRAINT substituicoes_aula_id_unique UNIQUE (aula_id);
  END IF;
END $$;
