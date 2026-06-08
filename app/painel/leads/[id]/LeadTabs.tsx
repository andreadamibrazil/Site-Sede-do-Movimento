'use client'

import { useRouter, usePathname } from 'next/navigation'

const ABAS = [
  { id: 'analise',  label: 'Análise IA' },
  { id: 'historico', label: 'Histórico' },
  { id: 'dados',    label: 'Dados' },
]

const FASE_LABEL: Record<string, string> = {
  info_geral:           'Pediu informações gerais',
  perguntou_preco:      'Perguntou preço',
  perguntou_horario:    'Perguntou horário',
  pediu_experimental:   'Pediu experimental',
  agendou_experimental: 'Agendou experimental',
  matriculado:          'Matriculado',
  desistiu:             'Desistiu',
  sem_resposta:         'Sumiu após contato',
  indefinido:           'Indefinido',
}

const OBJECAO_LABEL: Record<string, string> = {
  preco_alto:                  'Preço alto',
  horario_incompativel:        'Horário incompatível',
  distancia:                   'Distância',
  crianca_nao_quis:            'Criança não quis',
  aguardando_decisao_familiar: 'Aguardando decisão familiar',
  problemas_financeiros:       'Problemas financeiros',
  mudanca_cidade:              'Mudança de cidade',
  escolheu_concorrente:        'Escolheu concorrente',
  sem_retorno:                 'Sem retorno após orçamento',
}

const TEMP_ICON: Record<string, string> = {
  quente: '🔥',
  morno:  '☀️',
  frio:   '🧊',
}

const TEMP_CLASS: Record<string, string> = {
  quente: 'bg-red-50 border-red-200 text-red-700',
  morno:  'bg-orange-50 border-orange-200 text-orange-700',
  frio:   'bg-blue-50 border-blue-200 text-blue-500',
}

export default function LeadTabs({
  abaAtiva,
  lead,
  analise,
  analisadoEm,
  analiseCron,
  historicoAnalises,
}: {
  abaAtiva: string
  lead: Record<string, unknown>
  analise: unknown
  analisadoEm: string | null
  analiseCron: Record<string, unknown> | null
  historicoAnalises: unknown[]
}) {
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            onClick={() => router.push(`${pathname}?aba=${aba.id}`)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === aba.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'analise'   && <AbaAnalise analise={analise} analisadoEm={analisadoEm} analiseCron={analiseCron} />}
      {abaAtiva === 'historico' && <AbaHistorico historico={historicoAnalises} />}
      {abaAtiva === 'dados'     && <AbaDados lead={lead} />}
    </div>
  )
}

// ── Aba Análise ──────────────────────────────────────────────────────────────

function AbaAnalise({
  analise,
  analisadoEm,
  analiseCron,
}: {
  analise: unknown
  analisadoEm: string | null
  analiseCron: Record<string, unknown> | null
}) {
  const a = analise as Record<string, unknown> | null

  // Se temos dados do cron incremental, mostra o status atual primeiro
  if (analiseCron) {
    const temp = analiseCron.temperatura as string
    return (
      <div className="space-y-4">
        {/* Status atual do cron */}
        <div className={`border rounded-xl p-5 space-y-3 ${TEMP_CLASS[temp] ?? 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {TEMP_ICON[temp] ?? ''} {temp?.charAt(0).toUpperCase() + temp?.slice(1) ?? 'Sem dados'}
            </span>
            {analiseCron.ultima_analise && (
              <span className="text-xs opacity-60">
                Analisado em {new Date(analiseCron.ultima_analise as string).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          {analiseCron.resumo && (
            <p className="text-sm leading-relaxed">{analiseCron.resumo as string}</p>
          )}
          {analiseCron.acao_sugerida && (
            <p className="text-xs font-medium opacity-80">
              Próxima ação: {analiseCron.acao_sugerida as string}
            </p>
          )}
          {Array.isArray(analiseCron.objecoes) && (analiseCron.objecoes as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {(analiseCron.objecoes as string[]).map((o: string) => (
                <span key={o} className="text-xs px-2 py-0.5 bg-white/60 rounded-full border border-current/20">
                  {OBJECAO_LABEL[o] ?? o}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Análise detalhada Gemini v2 (backup histórico) */}
        {a && !a.skip && <AnaliseDetalhadaV2 analise={a} analisadoEm={analisadoEm} />}
      </div>
    )
  }

  // Sem dados do cron — mostra só Gemini v2
  if (!a) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-2">
        <p className="text-gray-400 text-sm">Nenhuma análise disponível para este contato.</p>
        <p className="text-gray-300 text-xs">A análise ocorre automaticamente 24h após a primeira mensagem.</p>
      </div>
    )
  }

  if (a.skip) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-400 text-sm">Conversa sem texto para analisar.</p>
      </div>
    )
  }

  return <AnaliseDetalhadaV2 analise={a} analisadoEm={analisadoEm} />
}

function AnaliseDetalhadaV2({ analise, analisadoEm }: { analise: Record<string, unknown>; analisadoEm: string | null }) {
  const interesse = analise.interesse as Record<string, unknown> | null
  const score  = (interesse?.score  as number)  ?? 0
  const nivel  = (interesse?.nivel  as string)  ?? 'indefinido'
  const fase   = (interesse?.fase_funil as string) ?? 'indefinido'
  const filled = Math.round(score / 10)
  const perfil = analise.perfil as Record<string, unknown> | null

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                i < filled
                  ? nivel === 'alto'  ? 'bg-green-500'
                  : nivel === 'medio' ? 'bg-yellow-400' : 'bg-gray-400'
                  : 'bg-gray-200'
              }`} />
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-2">{score}/100</span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            nivel === 'alto'  ? 'bg-green-100 text-green-700' :
            nivel === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-500'
          }`}>
            {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
          </span>
        </div>

        {analise.resumo && (
          <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-indigo-200 pl-3">
            {analise.resumo as string}
          </p>
        )}
        <p className="text-xs text-gray-400">Fase: <span className="text-gray-600">{FASE_LABEL[fase] ?? fase}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</h3>
          <Row label="Quem pratica" value={(perfil?.quem_pratica as string) ?? '—'} />
          <Row label="Faixa etária" value={(perfil?.faixa_etaria as string) ?? '—'} />
          <Row label="Quem fala"    value={(perfil?.quem_fala    as string) ?? '—'} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interesse</h3>
          {Array.isArray(analise.modalidades) && (analise.modalidades as string[]).length > 0 && (
            <Row label="Modalidades" value={(analise.modalidades as string[]).join(', ')} />
          )}
          <Row label="Bairro"    value={(analise.bairro    as string) ?? '—'} />
          <Row label="Sentimento" value={(analise.sentimento as string) ?? '—'} />
        </div>
      </div>

      {Array.isArray(analise.objecoes) && (analise.objecoes as string[]).length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Objeções</h3>
          <div className="flex flex-wrap gap-2">
            {(analise.objecoes as string[]).map((o: string) => (
              <span key={o} className="text-xs px-2.5 py-1 bg-white border border-red-200 text-red-700 rounded-full">
                {OBJECAO_LABEL[o] ?? o}
              </span>
            ))}
          </div>
        </div>
      )}

      {analisadoEm && (
        <p className="text-xs text-gray-300 text-right">
          Análise v2: {new Date(analisadoEm).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  )
}

// ── Aba Histórico ─────────────────────────────────────────────────────────────

function AbaHistorico({ historico }: { historico: unknown[] }) {
  if (!historico || historico.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-2">
        <p className="text-gray-400 text-sm">Nenhuma análise incremental registrada ainda.</p>
        <p className="text-gray-300 text-xs">O histórico é construído a partir da segunda análise em diante.</p>
      </div>
    )
  }

  // Mais recente primeiro
  const sorted = [...historico].reverse() as Array<Record<string, unknown>>

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{historico.length} análise(s) registrada(s)</p>
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-4">
          {sorted.map((entrada, i) => {
            const temp = entrada.temperatura as string
            return (
              <div key={i} className="flex gap-4 pl-2">
                {/* Ícone na linha do tempo */}
                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                  ${temp === 'quente' ? 'bg-red-100 border-red-300' :
                    temp === 'morno'  ? 'bg-orange-100 border-orange-300' :
                                       'bg-blue-50 border-blue-200'}`}>
                  {TEMP_ICON[temp] ?? '·'}
                </div>

                <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${
                      temp === 'quente' ? 'text-red-600' :
                      temp === 'morno'  ? 'text-orange-600' : 'text-blue-500'
                    }`}>
                      {temp ? temp.charAt(0).toUpperCase() + temp.slice(1) : '—'}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {entrada.data
                        ? new Date(entrada.data as string).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>

                  {entrada.resumo && (
                    <p className="text-sm text-gray-700 leading-snug">{entrada.resumo as string}</p>
                  )}

                  {entrada.mudanca && (
                    <p className="text-xs text-indigo-500 italic">{entrada.mudanca as string}</p>
                  )}

                  <p className="text-xs text-gray-400">
                    {entrada.mensagens_analisadas as number ?? 0} mensagens analisadas
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Aba Dados ─────────────────────────────────────────────────────────────────

function AbaDados({ lead }: { lead: Record<string, unknown> }) {
  function fmtData(iso: string | null | undefined) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR')
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados do lead</h2>
      <Row label="Nome"          value={(lead.nome as string)              ?? '—'} />
      <Row label="Celular"       value={(lead.celular as string)           ?? '—'} />
      <Row label="Email"         value={(lead.email as string)             ?? '—'} />
      <Row label="Modalidade"    value={(lead.modalidade_interesse as string) ?? '—'} />
      <Row label="Como conheceu" value={(lead.como_conheceu as string)     ?? '—'} />
      <Row label="Entrada"       value={fmtData(lead.created_at as string)} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  )
}
