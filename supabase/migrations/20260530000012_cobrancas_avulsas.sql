-- Cobranças avulsas — tudo que não é mensalidade
-- Espetáculo, figurino, uniforme, workshop, aula particular, aluguel de sala, etc.

create type categoria_cobranca as enum (
  'taxa_matricula',
  'espetaculo_participacao',
  'espetaculo_figurino',
  'espetaculo_foto',
  'espetaculo_programa',
  'pratica_montagem',
  'workshop',
  'aula_particular',
  'uniforme',
  'aluguel_sala',
  'ensaio_extra',
  'outro'
);

create type status_cobranca as enum (
  'pendente', 'pago', 'cancelado', 'expirado'
);

create table cobrancas_avulsas (
  id               uuid primary key default gen_random_uuid(),
  aluno_id         uuid not null references alunos(id),
  categoria        categoria_cobranca not null,
  descricao        text not null,          -- ex: "Figurino Arcanum 2025 - 2 figurinos - 1º lote"
  valor            numeric(10,2) not null,
  vencimento       date,
  status           status_cobranca not null default 'pendente',
  forma_pagamento  text check (forma_pagamento in ('pix','boleto','cartao','dinheiro','transferencia')),
  pago_em          timestamptz,
  codigo_asaas     text,                   -- ID da cobrança no Asaas
  comprovante_url  text,
  -- Vínculo opcional com espetáculo ou evento
  espetaculo_id    uuid references espetaculos(id),
  observacoes      text,
  criado_por       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table cobrancas_avulsas enable row level security;
create policy "cobranca_all" on cobrancas_avulsas for all to authenticated using (true) with check (true);
grant select, insert, update, delete on cobrancas_avulsas to authenticated;

create index on cobrancas_avulsas(aluno_id);
create index on cobrancas_avulsas(status);
create index on cobrancas_avulsas(categoria);
create index on cobrancas_avulsas(vencimento);

create trigger trg_updated_at before update on cobrancas_avulsas
  for each row execute function set_updated_at();

create trigger audit_cobrancas_avulsas
  after insert or update or delete on cobrancas_avulsas
  for each row execute function audit_trigger_fn();

-- Seed: tabela de preços pré-configurados por categoria
-- (referência para criar cobranças rapidamente)
create table precos_referencia (
  id          uuid primary key default gen_random_uuid(),
  categoria   categoria_cobranca not null,
  descricao   text not null,
  valor       numeric(10,2),       -- null = valor variável
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table precos_referencia enable row level security;
create policy "precos_read"  on precos_referencia for select to authenticated using (true);
create policy "precos_write" on precos_referencia for all    to authenticated using (true) with check (true);
grant select, insert, update, delete on precos_referencia to authenticated;

-- Preços padrão da Sede (editáveis pelo admin)
insert into precos_referencia (categoria, descricao, valor) values
  ('taxa_matricula',          'Taxa de matrícula anual',                       null),
  ('espetaculo_participacao', 'Taxa de participação - Espetáculo (1º lote)',    700.00),
  ('espetaculo_participacao', 'Taxa de participação - Espetáculo (2º lote)',    850.00),
  ('espetaculo_participacao', 'Taxa de participação - Espetáculo (3º lote)',    1000.00),
  ('espetaculo_figurino',     'Figurino espetáculo - 1 figurino (1º lote)',     310.00),
  ('espetaculo_figurino',     'Figurino espetáculo - 2 figurinos (1º lote)',    620.00),
  ('espetaculo_figurino',     'Figurino espetáculo - 3 figurinos (1º lote)',    930.00),
  ('espetaculo_foto',         'Foto profissional do espetáculo',               null),
  ('espetaculo_programa',     'PlayBill / programa do espetáculo',             null),
  ('pratica_montagem',        'Prática de Montagem 2026 - parcela única',      null),
  ('workshop',                'Workshop avulso',                               null),
  ('aula_particular',         'Aula particular - 1h',                         null),
  ('uniforme',                'Uniforme por modalidade',                       null),
  ('aluguel_sala',            'Aluguel de sala por hora',                      null),
  ('ensaio_extra',            'Ensaio extra',                                  null);
