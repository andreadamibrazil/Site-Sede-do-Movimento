import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InteligenciaPage() {
  const supabase = await createClient()

  // Busca todas as conversas analisadas com o JSON de análise
  const { data: conversas } = await supabase
    .from('conversas')
    .select('celular, variables, analisado_em')
    .not('analisado_em', 'is', null)

  const analises = (conversas ?? [])
    .map(c => (c.variables as any)?.analise)
    .filter(a => a && !a.skip && !a.erro && a.interesse)

  const total = analises.length

  // Funil
  const funil: Record<string, number> = {}
  const fases = ['agendou_experimental', 'pediu_experimental', 'perguntou_preco', 'perguntou_horario', 'info_geral', 'sem_resposta', 'desistiu', 'matriculado', 'indefinido']
  analises.forEach(a => {
    const f = a.interesse?.fase_funil ?? 'indefinido'
    funil[f] = (funil[f] ?? 0) + 1
  })

  // Objeções
  const objecoes: Record<string, number> = {}
  analises.forEach(a => {
    (a.objecoes ?? []).forEach((o: string) => {
      objecoes[o] = (objecoes[o] ?? 0) + 1
    })
  })

  // Modalidades
  const modalidades: Record<string, number> = {}
  analises.forEach(a => {
    (a.modalidades ?? []).forEach((m: string) => {
      modalidades[m] = (modalidades[m] ?? 0) + 1
    })
  })

  // Bairros
  const bairros: Record<string, number> = {}
  analises.forEach(a => {
    if (a.bairro) bairros[a.bairro] = (bairros[a.bairro] ?? 0) + 1
  })

  // Origens
  const origens: Record<string, number> = {}
  analises.forEach(a => {
    if (a.origem) origens[a.origem] = (origens[a.origem] ?? 0) + 1
  })

  // Score distribuição
  const porNivel = {
    alto:  analises.filter(a => a.interesse?.nivel === 'alto').length,
    medio: analises.filter(a => a.interesse?.nivel === 'medio').length,
    baixo: analises.filter(a => a.interesse?.nivel === 'baixo').length,
  }

  // Leads para reativar (score >= 50, sem_resposta ou desistiu)
  const reativar = await supabase
    .from('conversas')
    .select('celular, variables, analisado_em')
    .not('analisado_em', 'is', null)
    .order('analisado_em', { ascending: false })
    .limit(500)

  const paraReativar = ((reativar.data ?? []) as any[])
    .map(c => ({ celular: c.celular, analise: (c.variables as any)?.analise }))
    .filter(c => {
      const a = c.analise
      if (!a || a.skip || a.erro) return false
      const fase = a.interesse?.fase_funil
      const score = a.interesse?.score ?? 0
      return score >= 50 && (fase === 'sem_resposta' || fase === 'desistiu')
    })
    .slice(0, 20)

  // Sorts
  const topObjecoes = Object.entries(objecoes).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topModalidades = Object.entries(modalidades).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const topBairros = Object.entries(bairros).sort((a, b) => b[1] - a[1]).slice(0, 10)
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

  const faseMax = Math.max(...fases.map(f => funil[f] ?? 0), 1)
  const modalMax = topModalidades[0]?.[1] ?? 1
  const bairroMax = topBairros[0]?.[1] ?? 1
  const objecaoMax = topObjecoes[0]?.[1] ?? 1
  const origemMax = topOrigens[0]?.[1] ?? 1

  const analisadoTotal = conversas?.length ?? 0
  const pendentes = 10616 - analisadoTotal

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
        <StatCard label="Score alto (≥60)" value={porNivel.alto} color="text-green-600" sub={pct(porNivel.alto, total)} />
        <StatCard label="Score médio (31-59)" value={porNivel.medio} color="text-yellow-600" sub={pct(porNivel.medio, total)} />
        <StatCard label="Score baixo (≤30)" value={porNivel.baixo} color="text-gray-400" sub={pct(porNivel.baixo, total)} />
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

        {/* Objeções */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Principais objeções</h2>
          {topObjecoes.length === 0 && <p className="text-xs text-gray-400">Nenhuma objeção registrada ainda.</p>}
          {topObjecoes.map(([o, n]) => (
            <div key={o} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{OBJECAO_LABEL[o] ?? o}</span>
                <span className="font-medium text-gray-700">{n} ({pct(n, total)})</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-300 rounded-full" style={{ width: `${(n / objecaoMax) * 100}%` }} />
              </div>
            </div>
          ))}
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
            {topBairros.map(([b, n]) => (
              <div key={b} className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex-1 truncate">{b}</span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                    <div className="h-full bg-teal-300 rounded-full" style={{ width: `${(n / bairroMax) * 100}%` }} />
                  </div>
                  <span className="font-medium text-gray-700 w-6 text-right">{n}</span>
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
                {paraReativar.map((c, i) => {
                  const a = c.analise
                  const score = a.interesse?.score ?? 0
                  return (
                    <tr key={i} className="hover:bg-orange-50">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-600">{fmtCelular(c.celular)}</td>
                      <td className="py-2 pr-4 text-xs text-gray-600">{(a.modalidades ?? []).join(', ') || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-semibold ${score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-gray-500 max-w-xs truncate">{a.resumo ?? '—'}</td>
                      <td className="py-2">
                        <a
                          href={`https://wa.me/55${c.celular.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          📱 Contatar
                        </a>
                      </td>
                    </tr>
                  )
                })}
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
