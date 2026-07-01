-- ============================================================
-- Seletiva Longa 2026 — campos exigidos pela agência (perfil de elenco)
-- nome artístico, altura, ballet (+ vídeo dançando).
-- Cor/etnia NÃO entra aqui (coletada só presencialmente — LGPD).
-- ============================================================

alter table seletiva_longa_2026_inscricoes
  add column if not exists nome_artistico   text,
  add column if not exists altura           text,
  add column if not exists faz_ballet       boolean not null default false,
  add column if not exists ballet_video_url text;
