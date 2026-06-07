'use client'

import { useRouter, usePathname } from 'next/navigation'

const ABAS = [
  { id: 'analise', label: 'Análise IA' },
  { id: 'dados',   label: 'Dados' },
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

const ACAO_CONFIG: Record<string, { label: string; className: string }> = {
  ligar_agendar_experimental: { label: 'Ligar para agendar experimental', className: 'bg-green-600 text-white' },
  enviar_horarios:            { label: 'Enviar horários e preços', className: 'bg-blue-600 text-white' },
  fazer_followup:             { label: 'Fazer follow-up', className: 'bg-yellow-500 text-white' },
  reativar_lead:              { label: 'Reativar lead', className: 'bg-orange-500 text-white' },
  sem_acao:                   { label: 'Sem ação necessária', className: 'bg-gray-200 text-gray-600' },
  encaminhar_rh:              { label: 'Encaminhar para RH', className: 'bg-purple-100 text-purple-700' },
}

export default function LeadTabs({ abaAtiva, lead, analise, analisadoEm }: any) {
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

      {abaAtiva === 'analise' && <AbaAnalise analise={analise} analisadoEm={analisadoEm} />}
      {abaAtiva === 'dados'   && <AbaDados lead={lead} />}
    </div>
  )
}

function AbaAnalise({ analise, analisadoEm }: { analise: any; analisadoEm: string | null }) {
  if (!analise) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-2">
        <p className="text-gray-400 text-sm">Nenhuma análise disponível para este contato.</p>
        <p className="text-gray-300 text-xs">A análise é feita automaticamente quando há histórico de conversa no WhatsApp.</p>
      </div>
    )
  }

  if (analise.skip) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-400 text-sm">Conversa sem mensagens de texto para analisar.</p>
      </div>
    )
  }

  const score  = analise.interesse?.score  ?? 0
  const nivel  = analise.interesse?.nivel  ?? 'indefinido'
  const fase   = analise.interesse?.fase_funil ?? 'indefinido'
  const acao   = analise.proxima_acao
  const acaoConfig = acao ? ACAO_CONFIG[acao] : null
  const filled = Math.round(score / 10)

  return (
    <div className="space-y-4">
      {/* Score + resumo */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < filled
                    ? nivel === 'alto'  ? 'bg-green-500'
                    : nivel === 'medio' ? 'bg-yellow-400'
                    :                    'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
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
            {analise.resumo}
          </p>
        )}

        <p className="text-xs text-gray-400">
          Fase: <span className="text-gray-600">{FASE_LABEL[fase] ?? fase}</span>
        </p>

        {acaoConfig && (
          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${acaoConfig.className}`}>
            ▶ {acaoConfig.label}
          </div>
        )}
      </div>

      {/* Perfil + Interesse */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</h3>
          {analise.nome             && <Row label="Nome identificado" value={analise.nome} />}
          <Row label="Quem pratica" value={analise.perfil?.quem_pratica ?? '—'} />
          <Row label="Faixa etária" value={analise.perfil?.faixa_etaria ?? '—'} />
          <Row label="Quem fala"    value={analise.perfil?.quem_fala    ?? '—'} />
          {analise.perfil?.potencial_irmaos && <Row label="Pot. irmãos" value="Sim" />}
          <Row
            label="Exp. anterior"
            value={
              analise.experiencia_anterior === true  ? 'Sim' :
              analise.experiencia_anterior === false ? 'Não' : '—'
            }
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interesse</h3>
          {analise.modalidades?.length > 0 && (
            <Row label="Modalidades" value={analise.modalidades.join(', ')} />
          )}
          <Row label="Bairro"    value={analise.bairro    ?? '—'} />
          <Row label="Origem"    value={analise.origem    ?? '—'} />
          <Row label="Sentimento" value={analise.sentimento ?? '—'} />
          {analise.horarios_desejados?.length > 0 && (
            <Row label="Horários pedidos" value={analise.horarios_desejados.join(', ')} />
          )}
        </div>
      </div>

      {/* Objeções */}
      {analise.objecoes?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
            Objeções detectadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {analise.objecoes.map((o: string) => (
              <span key={o} className="text-xs px-2.5 py-1 bg-white border border-red-200 text-red-700 rounded-full">
                {OBJECAO_LABEL[o] ?? o}
              </span>
            ))}
          </div>
        </div>
      )}

      {analisadoEm && (
        <p className="text-xs text-gray-300 text-right">
          Analisado em {new Date(analisadoEm).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  )
}

function AbaDados({ lead }: { lead: any }) {
  function fmtData(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR')
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados do lead</h2>
      <Row label="Nome"          value={lead.nome              ?? '—'} />
      <Row label="Celular"       value={lead.celular           ?? '—'} />
      <Row label="Email"         value={lead.email             ?? '—'} />
      <Row label="Modalidade"    value={lead.modalidade_interesse ?? '—'} />
      <Row label="Como conheceu" value={lead.como_conheceu     ?? '—'} />
      <Row label="Entrada"       value={fmtData(lead.created_at)} />
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
