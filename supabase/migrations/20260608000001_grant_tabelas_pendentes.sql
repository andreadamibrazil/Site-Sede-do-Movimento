-- Grants para tabelas criadas após a migration inicial de grants.
-- Causa raiz: GRANT ALL ON ALL TABLES cobre apenas tabelas existentes no momento
-- da execução. Tabelas criadas em migrations posteriores precisam de grant explícito.

GRANT ALL ON TABLE
  familias,
  familia_membros,
  uniforme_retiradas,
  audit_log,
  config_auditoria,
  config_itens,
  experimentais,
  planos_aula
TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  familias,
  familia_membros,
  uniforme_retiradas,
  config_itens,
  experimentais,
  planos_aula
TO authenticated;

-- audit_log e config_auditoria: leitura apenas para authenticated (escrita via triggers/service_role)
GRANT SELECT ON TABLE audit_log, config_auditoria TO authenticated;
