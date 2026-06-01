-- Quantidade e preço unitário nas cobranças avulsas
alter table cobrancas_avulsas
  add column if not exists quantidade int not null default 1,
  add column if not exists preco_unitario numeric(10,2),
  add column if not exists descricao_detalhada text;

-- Categoria pode ser texto livre além do enum (para novas categorias sem deploy)
alter table cobrancas_avulsas
  add column if not exists categoria_custom text;
