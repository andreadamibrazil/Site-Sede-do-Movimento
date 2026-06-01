-- Concede acesso de leitura e escrita ao role 'authenticated'
-- (service_role já tem acesso — faltava o authenticated)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
