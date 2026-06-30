-- Calendário de bloqueios: feriados, pontos facultativos e recessos.
-- Fonte única para: geração de aulas (não criar/cancelar em dia bloqueado),
-- cron de lembretes (não cobrar chamada) e folha (pagar sem chamada em feriado).
-- Sugestões (Gemini, status='sugerido') só viram efetivas após confirmação humana.
CREATE TABLE IF NOT EXISTS calendario_bloqueios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN (
    'feriado_nacional','feriado_estadual_rj','feriado_municipal_rio',
    'ponto_facultativo','recesso','extraordinario'
  )),
  tem_aula boolean NOT NULL DEFAULT false,
  origem text NOT NULL DEFAULT 'manual' CHECK (origem IN ('gemini','manual','feriados_ts')),
  status text NOT NULL DEFAULT 'sugerido' CHECK (status IN ('sugerido','confirmado','rejeitado')),
  observacao text,
  confirmado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS calendario_bloqueios_data_uniq ON calendario_bloqueios(data);
CREATE INDEX IF NOT EXISTS calendario_bloqueios_status_idx ON calendario_bloqueios(status, tem_aula);

ALTER TABLE calendario_bloqueios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS calendario_select ON calendario_bloqueios;
CREATE POLICY calendario_select ON calendario_bloqueios FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS calendario_admin_all ON calendario_bloqueios;
CREATE POLICY calendario_admin_all ON calendario_bloqueios FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM perfis_usuario p WHERE p.id = auth.uid() AND p.perfil IN ('admin','secretaria')))
  WITH CHECK (EXISTS (SELECT 1 FROM perfis_usuario p WHERE p.id = auth.uid() AND p.perfil IN ('admin','secretaria')));

GRANT ALL ON public.calendario_bloqueios TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendario_bloqueios TO authenticated;
