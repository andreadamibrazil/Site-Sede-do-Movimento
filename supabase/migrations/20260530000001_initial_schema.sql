-- ============================================================
-- GETDANCE — Schema inicial
-- Sede do Movimento — 2026-05-30
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type status_pedagogico as enum (
  'lead', 'experimental', 'ativo', 'trancado', 'cancelado', 'ex_aluno'
);

create type status_financeiro as enum (
  'em_dia', 'em_atraso', 'inadimplente', 'renegociando', 'isento'
);

create type tipo_plano as enum (
  'mensal', 'trimestral', 'semestral', 'anual'
);

create type tipo_desconto as enum (
  'bairro', 'familia', 'all_dance', 'vip', 'bolsa', 'outro'
);

create type status_matricula as enum (
  'ativa', 'trancada', 'cancelada', 'encerrada'
);

create type status_aula as enum (
  'agendada', 'aberta', 'concluida', 'cancelada'
);

create type status_presenca as enum (
  'presente', 'falta', 'falta_justificada', 'reposicao', 'experimental', 'professor_faltou'
);

create type status_mensalidade as enum (
  'aberta', 'recebida', 'em_atraso', 'renegociada', 'cancelada'
);

create type forma_pagamento_professor as enum (
  'fixo_mensal', 'por_aluno', 'percentual', 'diaria'
);

create type perfil_usuario as enum (
  'admin', 'secretaria', 'professor'
);

create type dia_semana as enum (
  'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
);

create type tipo_notif_responsavel as enum (
  'notificacao_e_cobranca', 'so_notificacao', 'so_cobranca', 'nenhum'
);

create type status_lead as enum (
  'novo', 'em_contato', 'experimental_agendada', 'convertido', 'perdido'
);

-- ============================================================
-- TABELAS BASE
-- ============================================================

create table modalidades (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null unique,
  tipo        text not null default 'danca'
                check (tipo in ('danca', 'musica', 'teatro', 'outro')),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table salas (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null unique,
  capacidade_max   int,
  restricoes       text,
  ativo            boolean not null default true,
  created_at       timestamptz not null default now()
);

create table professores (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  celular           text,
  email             text,
  cpf               text,
  forma_pagamento   forma_pagamento_professor not null default 'fixo_mensal',
  valor_base        numeric(10,2),
  ativo             boolean not null default true,
  observacoes       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- TURMAS — entidade central com preço nativo
-- ============================================================

create table turmas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  modalidade_id   uuid not null references modalidades(id),
  professor_id    uuid references professores(id),
  sala_id         uuid references salas(id),
  capacidade      int not null default 15,
  nivel           text,
  faixa_etaria_min int,
  faixa_etaria_max int,
  preco_padrao    numeric(10,2) not null,
  status          text not null default 'ativa'
                    check (status in ('ativa', 'suspensa', 'encerrada')),
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table turma_horarios (
  id          uuid primary key default gen_random_uuid(),
  turma_id    uuid not null references turmas(id) on delete cascade,
  dia_semana  dia_semana not null,
  hora_inicio time not null,
  hora_fim    time not null,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PESSOAS
-- ============================================================

create table responsaveis (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  cpf          text,
  celular      text not null,
  email        text,
  parentesco   text,
  notificacao  tipo_notif_responsavel not null default 'notificacao_e_cobranca',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Decisão central: dois status independentes
-- status_pedagogico: o aluno existe e frequenta → não muda por inadimplência
-- status_financeiro: situação do pagamento → nunca bloqueia presença na chamada
create table alunos (
  id                        uuid primary key default gen_random_uuid(),
  nome                      text not null,
  nome_social               text,
  sexo                      text check (sexo in ('masculino','feminino','outro','prefiro_nao_informar')),
  data_nascimento           date,
  cpf                       text,
  rg                        text,
  celular                   text,
  email                     text,
  cep                       text,
  endereco                  text,
  bairro                    text,

  status_pedagogico         status_pedagogico not null default 'ativo',
  status_financeiro         status_financeiro not null default 'em_dia',

  responsavel_principal_id  uuid references responsaveis(id),
  responsavel_secundario_id uuid references responsaveis(id),

  origem                    text,
  como_conheceu             text,
  info_saude                text,
  observacoes               text,

  codigo_nextfit            text, -- ID original para rastreabilidade na migração

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table leads (
  id                  uuid primary key default gen_random_uuid(),
  nome                text not null,
  celular             text not null,
  email               text,
  modalidade_interesse text,
  dia_experimental    date,
  horario_preferido   text,
  como_conheceu       text,
  origem              text,
  status              status_lead not null default 'novo',
  aluno_id            uuid references alunos(id),
  observacoes         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- MATRÍCULAS
-- ============================================================

create table matriculas (
  id                    uuid primary key default gen_random_uuid(),
  aluno_id              uuid not null references alunos(id),

  plano                 tipo_plano not null,
  data_inicio           date not null,
  data_fim              date,
  dia_vencimento        int not null default 10
                          check (dia_vencimento between 1 and 28),

  valor_final           numeric(10,2) not null,
  tipo_desconto         tipo_desconto,
  percentual_desconto   numeric(5,2) default 0,
  observacao_desconto   text,

  status                status_matricula not null default 'ativa',
  trancamentos_usados   int not null default 0,

  contrato_autentique_id text,
  contrato_assinado_em   timestamptz,

  codigo_nextfit        text,
  observacoes           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Turmas vinculadas à matrícula (aluno pode estar em várias)
create table matricula_turmas (
  id           uuid primary key default gen_random_uuid(),
  matricula_id uuid not null references matriculas(id) on delete cascade,
  turma_id     uuid not null references turmas(id),
  data_entrada date not null default current_date,
  data_saida   date,
  created_at   timestamptz not null default now(),
  unique(matricula_id, turma_id, data_entrada)
);

create table termos_aditivos (
  id                   uuid primary key default gen_random_uuid(),
  matricula_id         uuid not null references matriculas(id),
  tipo                 text not null check (tipo in ('turma','preco','pacote','plano')),
  descricao_anterior   text,
  descricao_nova       text,
  valor_anterior       numeric(10,2),
  valor_novo           numeric(10,2),
  data_vigencia        date not null,
  created_at           timestamptz not null default now()
);

create table trancamentos (
  id            uuid primary key default gen_random_uuid(),
  matricula_id  uuid not null references matriculas(id),
  data_inicio   date not null,
  data_fim      date,
  motivo        text,
  aprovado_por  uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- AULAS E PRESENÇA
-- ============================================================

create table aulas (
  id                   uuid primary key default gen_random_uuid(),
  turma_id             uuid not null references turmas(id),
  professor_id         uuid references professores(id),
  sala_id              uuid references salas(id),
  data                 date not null,
  hora_inicio          time not null,
  hora_fim             time not null,
  status               status_aula not null default 'agendada',
  observacoes          text,
  chamada_concluida_em timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(turma_id, data, hora_inicio)
);

create table presencas (
  id              uuid primary key default gen_random_uuid(),
  aula_id         uuid not null references aulas(id) on delete cascade,
  aluno_id        uuid not null references alunos(id),
  status          status_presenca not null,
  observacao      text,
  registrado_por  uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  unique(aula_id, aluno_id)
);

-- Regra: professor faltou com atestado → recebe normalmente
--        professor faltou com substituto → recebe, mas substituto é descontado na folha dele
--        professor faltou sem atestado e sem substituto → não recebe aquela aula
create table substituicoes (
  id                       uuid primary key default gen_random_uuid(),
  aula_id                  uuid not null references aulas(id),
  professor_ausente_id     uuid not null references professores(id),
  professor_substituto_id  uuid references professores(id),
  tem_atestado             boolean not null default false,
  motivo                   text,
  aprovado_por             uuid references auth.users(id),
  created_at               timestamptz not null default now()
);

-- ============================================================
-- FINANCEIRO
-- ============================================================

create table mensalidades (
  id                uuid primary key default gen_random_uuid(),
  matricula_id      uuid not null references matriculas(id),
  competencia       date not null, -- 2026-06-01 = junho/2026
  valor             numeric(10,2) not null,
  vencimento        date not null,
  status            status_mensalidade not null default 'aberta',
  desconto_aplicado numeric(10,2) default 0,
  juros_aplicados   numeric(10,2) default 0,
  valor_pago        numeric(10,2),
  pago_em           timestamptz,
  codigo_asaas      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(matricula_id, competencia)
);

create table pagamentos (
  id               uuid primary key default gen_random_uuid(),
  mensalidade_id   uuid not null references mensalidades(id),
  valor            numeric(10,2) not null,
  forma            text not null
                     check (forma in ('pix','boleto','cartao','dinheiro','transferencia')),
  data_pagamento   date not null,
  codigo_asaas     text,
  comprovante_url  text,
  registrado_por   uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

create table renegociacoes (
  id               uuid primary key default gen_random_uuid(),
  mensalidade_id   uuid not null references mensalidades(id),
  valor_original   numeric(10,2) not null,
  valor_negociado  numeric(10,2) not null,
  motivo           text,
  aprovado_por     uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

-- ============================================================
-- AVALIAÇÕES PEDAGÓGICAS
-- ============================================================

-- Professor lança nota → fica em rascunho
-- Coordenadora libera em bloco (nunca aluno a aluno)
-- Sistema calcula a média automaticamente
create table avaliacoes (
  id                  uuid primary key default gen_random_uuid(),
  aluno_id            uuid not null references alunos(id),
  turma_id            uuid not null references turmas(id),
  semestre            int not null check (semestre in (1, 2)),
  ano                 int not null,
  nota_professor      numeric(4,2) check (nota_professor between 0 and 10),
  nota_banca          numeric(4,2) check (nota_banca between 0 and 10),
  media_final         numeric(4,2), -- preenchida automaticamente pelo trigger
  comentario          text,
  status              text not null default 'rascunho'
                        check (status in ('rascunho','finalizada','liberada')),
  liberada_em         timestamptz,
  liberada_por        uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(aluno_id, turma_id, semestre, ano)
);

-- ============================================================
-- ESPETÁCULOS
-- ============================================================

create table espetaculos (
  id                      uuid primary key default gen_random_uuid(),
  nome                    text not null,
  ano                     int not null,
  data_estreia            date,
  teatro                  text,
  inscricoes_abertas      boolean not null default false,
  data_limite_inscricao   date,
  created_at              timestamptz not null default now()
);

create table inscricoes_espetaculo (
  id                  uuid primary key default gen_random_uuid(),
  espetaculo_id       uuid not null references espetaculos(id),
  aluno_id            uuid not null references alunos(id),
  lote                int not null check (lote in (1, 2, 3)),
  quantidade_figurinos int not null default 1,
  e_bolsista          boolean not null default false,
  valor_total         numeric(10,2) not null,
  status              text not null default 'inscrito'
                        check (status in ('inscrito','pago','cancelado')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(espetaculo_id, aluno_id)
);

-- ============================================================
-- USUÁRIOS DO SISTEMA
-- ============================================================

create table perfis_usuario (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null,
  email         text not null,
  perfil        perfil_usuario not null default 'secretaria',
  professor_id  uuid references professores(id),
  ativo         boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index on alunos(status_pedagogico);
create index on alunos(status_financeiro);
create index on alunos(celular);
create index on alunos(codigo_nextfit);
create index on matriculas(aluno_id);
create index on matriculas(status);
create index on matricula_turmas(turma_id);
create index on matricula_turmas(matricula_id);
create index on aulas(turma_id, data);
create index on aulas(data);
create index on presencas(aluno_id);
create index on presencas(aula_id);
create index on mensalidades(matricula_id);
create index on mensalidades(status);
create index on mensalidades(vencimento);
create index on leads(celular);
create index on leads(status);

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_updated_at before update on professores    for each row execute function set_updated_at();
create trigger trg_updated_at before update on turmas         for each row execute function set_updated_at();
create trigger trg_updated_at before update on responsaveis   for each row execute function set_updated_at();
create trigger trg_updated_at before update on alunos         for each row execute function set_updated_at();
create trigger trg_updated_at before update on leads          for each row execute function set_updated_at();
create trigger trg_updated_at before update on matriculas     for each row execute function set_updated_at();
create trigger trg_updated_at before update on aulas          for each row execute function set_updated_at();
create trigger trg_updated_at before update on mensalidades   for each row execute function set_updated_at();
create trigger trg_updated_at before update on avaliacoes     for each row execute function set_updated_at();
create trigger trg_updated_at before update on inscricoes_espetaculo for each row execute function set_updated_at();

-- Média de avaliação calculada automaticamente
create or replace function calcular_media_avaliacao()
returns trigger as $$
begin
  if new.nota_professor is not null and new.nota_banca is not null then
    new.media_final = round((new.nota_professor + new.nota_banca) / 2.0, 2);
  elsif new.nota_professor is not null then
    new.media_final = new.nota_professor;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_media_avaliacao
  before insert or update on avaliacoes
  for each row execute function calcular_media_avaliacao();

-- Quando matrícula é criada, atualiza status_pedagogico do aluno para 'ativo'
create or replace function ativar_aluno_na_matricula()
returns trigger as $$
begin
  update alunos
  set status_pedagogico = 'ativo', updated_at = now()
  where id = new.aluno_id
    and status_pedagogico in ('lead', 'experimental');
  return new;
end;
$$ language plpgsql;

create trigger trg_ativar_aluno
  after insert on matriculas
  for each row execute function ativar_aluno_na_matricula();

-- ============================================================
-- SEED — dados base da Sede do Movimento
-- ============================================================

insert into modalidades (nome, tipo) values
  ('Ballet', 'danca'),
  ('Jazz', 'danca'),
  ('Sapateado', 'danca'),
  ('Dança Contemporânea', 'danca'),
  ('Danças Urbanas', 'danca'),
  ('Charme', 'danca'),
  ('Preparação para o Movimento', 'danca'),
  ('Preparação Física para Bailarinos', 'danca'),
  ('Baby Class', 'danca'),
  ('Canto', 'musica'),
  ('Musicalização Infantil', 'musica'),
  ('Teclado', 'musica'),
  ('Violão', 'musica'),
  ('Teatro', 'teatro'),
  ('Alongamento', 'outro'),
  ('Grupo de Competições', 'outro'),
  ('Repertório', 'outro');

insert into salas (nome, capacidade_max, restricoes) values
  ('Amarela', 20, null),
  ('Branca', 20, null),
  ('Verde', 20, null),
  ('Azul', 15, 'Exclusiva para Música — sem barra, acústica'),
  ('Lilás', 12, 'Menor sala, sem espelho — não serve para algumas modalidades'),
  ('Roxa', 18, null);
