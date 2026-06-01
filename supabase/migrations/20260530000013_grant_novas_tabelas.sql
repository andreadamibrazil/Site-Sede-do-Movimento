-- Grant para tabelas criadas após o grant global inicial
grant all on documentos_aluno to service_role;
grant all on cobrancas_avulsas to service_role;
grant all on precos_referencia to service_role;
grant select, insert, update, delete on documentos_aluno to authenticated;
grant select, insert, update, delete on cobrancas_avulsas to authenticated;
grant select on precos_referencia to authenticated;
