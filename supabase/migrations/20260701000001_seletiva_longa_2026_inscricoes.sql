-- ============================================================
-- Seletiva de elenco — Longa-metragem 2026
-- Inscrições públicas (formulário no site).
-- Tabela da ESCOLA (schema public, SEM prefixo movirio_ — não misturar com o festival).
-- Dados de menor de idade: leitura restrita a admin (LGPD).
-- ============================================================

create table if not exists seletiva_longa_2026_inscricoes (
  id                          uuid primary key default gen_random_uuid(),

  -- criança candidata
  crianca_nome                text not null,
  crianca_nascimento          date not null,
  crianca_idade               int,
  crianca_cidade              text,

  -- responsável legal
  responsavel_nome            text not null,
  responsavel_parentesco      text,
  responsavel_whatsapp        text not null,
  responsavel_email           text not null,

  -- perfil / material de audição
  sobre                       text,
  experiencia_tvcinema        boolean not null default false,
  experiencia_descricao       text,
  portfolio_url               text,
  selftape_url                text,
  foto_drive_url              text,
  foto_drive_id               text,
  material_profissional       boolean not null default false,
  material_profissional_link  text,

  -- consentimentos
  consentimento_menor         boolean not null default false,
  consentimento_lgpd          boolean not null default false,
  optin_aulas                 boolean not null default false,

  -- gestão / funil
  status                      text not null default 'novo',
  lead_id                     uuid references leads(id),
  origem                      text not null default 'seletiva-longa-2026',

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists seletiva_longa_2026_created_idx
  on seletiva_longa_2026_inscricoes (created_at desc);
create index if not exists seletiva_longa_2026_status_idx
  on seletiva_longa_2026_inscricoes (status);

-- RLS: apenas admin lê/gerencia. As inscrições do formulário público
-- entram via service_role (que bypassa RLS), então não há policy de insert público.
alter table seletiva_longa_2026_inscricoes enable row level security;

create policy "read_admin"   on seletiva_longa_2026_inscricoes
  for select to authenticated using (is_admin());
create policy "update_admin" on seletiva_longa_2026_inscricoes
  for update to authenticated using (is_admin()) with check (is_admin());
create policy "delete_admin" on seletiva_longa_2026_inscricoes
  for delete to authenticated using (is_admin());

-- Grants (mesmo padrão de 20260530000013_grant_novas_tabelas.sql)
grant all on seletiva_longa_2026_inscricoes to service_role;
grant select, insert, update, delete on seletiva_longa_2026_inscricoes to authenticated;
