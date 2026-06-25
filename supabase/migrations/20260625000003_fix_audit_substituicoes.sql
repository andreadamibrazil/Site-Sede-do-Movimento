-- Corrige trigger de audit em substituicoes
-- O trigger atual referencia coluna "dados_novos" que nao existe em audit_log
-- (audit_log usa "dados_antes" / "dados_depois" — vide migration 20260530000006)
-- Dropa qualquer trigger existente e recria com a funcao padrao

DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_table = 'substituicoes'
      AND trigger_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON substituicoes', trig.trigger_name);
  END LOOP;
END;
$$;

CREATE TRIGGER audit_substituicoes
  AFTER INSERT OR UPDATE OR DELETE ON substituicoes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
