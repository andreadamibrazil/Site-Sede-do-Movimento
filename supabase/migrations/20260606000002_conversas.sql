-- Tabela de conversas: armazena histórico WhatsApp (Evolution API) e BotConversa
-- Alimenta o sistema de inteligência conversacional via análise Gemini 2x/dia

CREATE TABLE IF NOT EXISTS conversas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celular       TEXT NOT NULL,           -- 11 dígitos sem DDI 55 (ex: 21982399484)
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  source        TEXT NOT NULL CHECK (source IN ('whatsapp', 'botconversa')),
  messages      JSONB NOT NULL DEFAULT '[]',  -- array de mensagens
  variables     JSONB NOT NULL DEFAULT '{}',  -- vars BotConversa ou metadata WhatsApp
  tags          TEXT[] NOT NULL DEFAULT '{}',
  analisado_em  TIMESTAMPTZ,               -- null = pendente análise Gemini
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversas_celular_idx ON conversas (celular);
CREATE INDEX IF NOT EXISTS conversas_lead_id_idx ON conversas (lead_id);
CREATE INDEX IF NOT EXISTS conversas_source_idx ON conversas (source);
CREATE INDEX IF NOT EXISTS conversas_analisado_em_idx ON conversas (analisado_em) WHERE analisado_em IS NULL;

ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role gerencia conversas" ON conversas
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT ALL ON conversas TO service_role;
