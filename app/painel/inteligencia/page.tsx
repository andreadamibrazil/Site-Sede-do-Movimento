import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type AnaliseDashboard = {
  total: number
  por_fase: Record<string, number> | null
  por_nivel: Record<string, number> | null
  por_origem: Record<string, number> | null
  por_bairro: { bairro: string; cnt: number }[] | null
  por_modalidade: Record<string, number> | null
  para_reativar: {
    celular: string
    resumo: string | null
    score: number
    fase_funil: string | null
    modalidades: string[] | null
  }[] | null
}

export default async function InteligenciaPage() {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: raw }, { count: pendentesCount }] = await Promise.all([
    (supabase as any).rpc('get_analise_dashboard'),
    supabase.from('conversas').select('id', { count: 'exact', head: true }).is('analisado_em', null),
  ])
  const d = (raw ?? {}) as AnaliseDashboard

  const total         = d.total ?? 0
  const funil         = d.por_fase ?? {}
  const porNivel      = d.por_nivel ?? {}
  const origens       = d.por_origem ?? {}
  const topBairros    = d.por_bairro ?? []
  const topModalidades = Object.entries(d.por_modalidade ?? {}).sort((a, b) => b[1] - a[1])
  const paraReativar  = d.para_reativar ?? []

  const fases = ['agendou_experimental', 'pediu_experimental', 'perguntou_preco', 'perguntou_horario', 'info_geral', 'sem_resposta', 'desistiu', 'matriculado', 'indefinido']
  const topOrigens = Object.entries(origens).sort((a, b) => b[1] - a[1])

  const FASE_LABEL: Record<string, string> = {
    agendou_experimental: 'Agendou experimental',
    pediu_experimental: 'Pediu experimental',
    perguntou_preco: 'Perguntou preço',
    perguntou_horario: 'Perguntou horário',
    info_geral: 'Informações gerais',
    sem_resposta: 'Sumiu sem resposta',
    desistiu: 'Desistiu',
    matriculado: 'Matriculado',
    indefinido: 'Indefinido',
  }

  const OBJECAO_LABEL: Record<string, string> = {
    preco_alto: 'Preço alto',
    horario_incompativel: 'Horário incompatível',
    distancia: 'Distância',
    crianca_nao_quis: 'Criança não quis',
    aguardando_decisao_familiar: 'Aguardando família',
    problemas_financeiros: 'Problemas financeiros',
    mudanca_cidade: 'Mudança de cidade',
    escolheu_concorrente: 'Escolheu concorrente',
    sem_retorno: 'Sem retorno',
  }

  const ORIGEM_LABEL: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    google: 'Google',
    indicacao: 'Indicação',
    aluno_atual: 'Aluno atual',
    ex_aluno: 'Ex-aluno',
    espetaculo: 'Espetáculo',
    evento: 'Evento',
    panfleto: 'Panfleto',
    indefinido: 'Indefinido',
  }

  const alto  = porNivel['alto']  ?? 0
  const medio = porNivel['medio'] ?? 0
  const baixo = porNivel['baixo'] ?? 0

  const faseMax    = Math.max(...fases.map(f => funil[f] ?? 0), 1)
  const modalMax   = topModalidades[0]?.[1] ?? 1
  const bairroMax  = topBairros[0]?.cnt ?? 1
  const origemMax  = topOrigens[0]?.[1] ?? 1

  const pendentes = pendentesCount ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Inteligência de Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total.toLocaleString('pt-BR')} conversas analisadas
            {pendentes > 0 && <span className="ml-2 text-orange-500">· {pendentes.toLocaleString('pt-BR')} pendentes</span>}
          </p>
        </div>
      </div>

      {/* Stats topo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Score alto (≥60)" value={alto} color="text-green-600" sub={pct(alto, total)} />
        <StatCard label="Score médio (31-59)" value={medio} color="text-yellow-600" sub={pct(medio, total)} />
        <StatCard label="Score baixo (≤30)" value={baixo} color="text-gray-400" sub={pct(baixo, total)} />
        <StatCard label="Para reativar" value={paraReativar.length} color="text-orange-600" sub="score≥50, sem resposta" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Funil */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Funil de conversão</h2>
          {fases.map(fase => {
            const n = funil[fase] ?? 0
            if (!n) return null
            return (
              <div key={fase} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{FASE_LABEL[fase] ?? fase}</span>
                  <span className="font-medium text-gray-700">{n} ({pct(n, total)})</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      fase === 'agendou_experimental' || fase === 'matriculado' ? 'bg-green-400' :
                      fase === 'pediu_experimental' ? 'bg-blue-400' :
                      fase === 'sem_resposta' || fase === 'desistiu' ? 'bg-gray-300' :
                      'bg-indigo-300'
                    }`}
                    style={{ width: `${(n / faseMax) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Modalidades */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Modalidades mais pedidas</h2>
          {topModalidades.map(([m, n]) => (
            <div key={m} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{m}</span>
                <span className="font-medium text-gray-700">{n}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-300 rounded-full" style={{ width: `${(n / modalMax) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bairros + Origens empilhados */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Top bairros</h2>
            {topBairros.map(({ bairro, cnt }) => (
              <div key={bairro} className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex-1 truncate">{bairro}</span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                    <div className="h-full bg-teal-300 rounded-full" style={{ width: `${(cnt / bairroMax) * 100}%` }} />
                  </div>
                  <span className="font-medium text-gray-700 w-6 text-right">{cnt}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">Origens</h2>
            {topOrigens.map(([o, n]) => (
              <div key={o} className="flex items-center justify-between text-xs text-gray-500">
                <span>{ORIGEM_LABEL[o] ?? o}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                    <div className="h-full bg-orange-300 rounded-full" style={{ width: `${(n / origemMax) * 100}%` }} />
                  </div>
                  <span className="font-medium text-gray-700 w-6 text-right">{n}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fases não mapeadas (debug) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">Fases extras detectadas</h2>
          {Object.entries(funil).filter(([f]) => !fases.includes(f)).map(([f, n]) => (
            <div key={f} className="flex justify-between text-xs text-gray-500">
              <span className="font-mono">{f}</span>
              <span className="font-medium text-gray-700">{n}</span>
            </div>
          ))}
          {Object.entries(funil).filter(([f]) => !fases.includes(f)).length === 0 && (
            <p className="text-xs text-gray-300">Nenhuma fase desconhecida.</p>
          )}
        </div>
      </div>

      {/* Leads para reativar */}
      {paraReativar.length > 0 && (
        <div className="bg-white border border-orange-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-orange-700">
            Leads para reativar — score ≥ 50, sem resposta ({paraReativar.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 text-xs font-semibold text-gray-500">Celular</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500">Modalidades</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500">Score</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500">Resumo</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paraReativar.map((c, i) => (
                  <tr key={i} className="hover:bg-orange-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-600">{fmtCelular(c.celular)}</td>
                    <td className="py-2 pr-4 text-xs text-gray-600">{(c.modalidades ?? []).join(', ') || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs font-semibold ${c.score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {c.score}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-500 max-w-xs truncate">{c.resumo ?? '—'}</td>
                    <td className="py-2">
                      <a
                        href={`https://wa.me/55${c.celular.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Contatar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value.toLocaleString('pt-BR')}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function pct(n: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function fmtCelular(cel: string) {
  const n = cel.replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return cel
}
