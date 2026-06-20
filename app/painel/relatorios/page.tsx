import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

export const dynamic = 'force-dynamic'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPct(num: number, den: number) {
  if (den === 0) return '—'
  return ((num / den) * 100).toFixed(1) + '%'
}

function mesLabel(competencia: string) {
  // competencia is YYYY-MM-01
  const [year, month] = competencia.split('-')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[parseInt(month!) - 1]}/${year?.slice(2)}`
}

export default async function RelatoriosPage() {
  await requireAdmin()
  const supabase = createServiceClient()

  // ── Ultimos 6 meses ────────────────────────────────────────────────────────
  const hoje = new Date()
  const meses6: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    meses6.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    )
  }
  const mesInicio = meses6[0]!

  // ── Relatório 1: Faturamento ───────────────────────────────────────────────
  const { data: mensalidadesFat } = await supabase
    .from('mensalidades')
    .select('competencia, valor, valor_pago, status')
    .gte('competencia', mesInicio)
    .in('status', ['aberta', 'recebida', 'em_atraso', 'renegociada'])

  // Agrupa por competência
  const fatMap: Record<string, { previsto: number; recebido: number }> = {}
  for (const m of mensalidadesFat ?? []) {
    if (!fatMap[m.competencia]) fatMap[m.competencia] = { previsto: 0, recebido: 0 }
    fatMap[m.competencia]!.previsto += Number(m.valor)
    if (m.status === 'recebida') {
      fatMap[m.competencia]!.recebido += Number(m.valor_pago ?? m.valor)
    }
  }

  const faturamento = meses6.map((mes) => ({
    mes,
    previsto: fatMap[mes]?.previsto ?? 0,
    recebido: fatMap[mes]?.recebido ?? 0,
  })).reverse() // mais recente primeiro

  // ── Relatório 2: Ocupação das Turmas ──────────────────────────────────────
  const [{ data: turmas }, { data: matriculaTurmas }, { data: professores }, { data: modalidades }] =
    await Promise.all([
      supabase.from('turmas').select('id, nome, capacidade, modalidade_id, professor_id, status').eq('status', 'ativo'),
      supabase.from('matricula_turmas').select('turma_id, data_saida').is('data_saida', null),
      supabase.from('professores').select('id, nome'),
      supabase.from('modalidades').select('id, nome'),
    ])

  const profMap: Record<string, string> = {}
  for (const p of professores ?? []) profMap[p.id] = p.nome

  const modMap: Record<string, string> = {}
  for (const m of modalidades ?? []) modMap[m.id] = m.nome

  // Conta alunos ativos por turma
  const alunosPorTurma: Record<string, number> = {}
  for (const mt of matriculaTurmas ?? []) {
    alunosPorTurma[mt.turma_id] = (alunosPorTurma[mt.turma_id] ?? 0) + 1
  }

  type OcupacaoRow = {
    id: string
    nome: string
    modalidade: string
    professor: string
    alunos: number
    capacidade: number
    pct: number
  }

  const ocupacao: OcupacaoRow[] = (turmas ?? [])
    .map((t) => {
      const alunos = alunosPorTurma[t.id] ?? 0
      const capacidade = t.capacidade ?? 0
      return {
        id: t.id,
        nome: t.nome,
        modalidade: modMap[t.modalidade_id] ?? '—',
        professor: t.professor_id ? (profMap[t.professor_id] ?? '—') : '—',
        alunos,
        capacidade,
        pct: capacidade > 0 ? (alunos / capacidade) * 100 : 0,
      }
    })
    .sort((a, b) => b.pct - a.pct)

  // ── Relatório 3: Inadimplência Aging ──────────────────────────────────────
  const { data: emAtraso } = await supabase
    .from('mensalidades')
    .select(`
      id, vencimento, valor,
      matriculas(
        alunos(id, nome)
      )
    `)
    .eq('status', 'em_atraso')

  const hojeMs = hoje.getTime()

  type AgingItem = { id: string; nome: string; vencimento: string; valor: number; dias: number }
  type AgingFaixa = { label: string; items: AgingItem[]; total: number }

  const faixas: AgingFaixa[] = [
    { label: '+90 dias', items: [], total: 0 },
    { label: '61–90 dias', items: [], total: 0 },
    { label: '31–60 dias', items: [], total: 0 },
    { label: '0–30 dias', items: [], total: 0 },
  ]

  for (const m of emAtraso ?? []) {
    const venc = new Date(m.vencimento + 'T00:00:00')
    const diasAtraso = Math.floor((hojeMs - venc.getTime()) / 86_400_000)
    const nome = (m.matriculas as any)?.alunos?.nome ?? 'Desconhecido'
    const item: AgingItem = { id: m.id, nome, vencimento: m.vencimento, valor: Number(m.valor), dias: diasAtraso }

    if (diasAtraso > 90) {
      faixas[0]!.items.push(item)
      faixas[0]!.total += item.valor
    } else if (diasAtraso > 60) {
      faixas[1]!.items.push(item)
      faixas[1]!.total += item.valor
    } else if (diasAtraso > 30) {
      faixas[2]!.items.push(item)
      faixas[2]!.total += item.valor
    } else {
      faixas[3]!.items.push(item)
      faixas[3]!.total += item.valor
    }
  }

  // Ordena alunos dentro de cada faixa pelo mais atrasado primeiro
  for (const f of faixas) f.items.sort((a, b) => b.dias - a.dias)

  const totalInadimplente = faixas.reduce((s, f) => s + f.total, 0)

  // ── Renderização ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-400 mt-1">Faturamento, ocupação de turmas e inadimplência.</p>
      </div>

      {/* ── Relatório 1: Faturamento ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Faturamento — Previsto vs. Recebido (últimos 6 meses)</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Mês</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Previsto</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Recebido</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Inadimplência</th>
                  <th className="px-4 py-3 font-medium text-gray-600 w-40">Realização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faturamento.map((row) => {
                  const pct = row.previsto > 0 ? (row.recebido / row.previsto) * 100 : 0
                  const inadPct = row.previsto > 0 ? ((row.previsto - row.recebido) / row.previsto) * 100 : 0
                  return (
                    <tr key={row.mes} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{mesLabel(row.mes)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(row.previsto)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(row.recebido)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${inadPct > 20 ? 'text-red-600' : inadPct > 10 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {row.previsto > 0 ? inadPct.toFixed(1) + '%' : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{row.previsto > 0 ? pct.toFixed(0) + '%' : '—'}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200 font-semibold">
                  <td className="px-4 py-3 text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {fmt(faturamento.reduce((s, r) => s + r.previsto, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {fmt(faturamento.reduce((s, r) => s + r.recebido, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {fmtPct(
                      faturamento.reduce((s, r) => s + (r.previsto - r.recebido), 0),
                      faturamento.reduce((s, r) => s + r.previsto, 0)
                    )}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ── Relatório 2: Ocupação das Turmas ── */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Ocupação das Turmas</h2>
        {ocupacao.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
            Nenhuma turma ativa encontrada.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Turma</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Modalidade</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Professor</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Alunos</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Cap.</th>
                    <th className="px-4 py-3 font-medium text-gray-600 w-44">Ocupação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ocupacao.map((row) => {
                    const pct = Math.min(row.pct, 100)
                    const barColor =
                      row.pct >= 90 ? 'bg-red-500' :
                      row.pct >= 70 ? 'bg-amber-500' :
                      'bg-blue-500'
                    return (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.nome}</td>
                        <td className="px-4 py-3 text-gray-600">{row.modalidade}</td>
                        <td className="px-4 py-3 text-gray-600">{row.professor}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{row.alunos}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{row.capacidade}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${barColor} transition-all`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {row.capacidade > 0 ? row.pct.toFixed(0) + '%' : '—'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Relatório 3: Aging de Inadimplência ── */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Inadimplência — Aging</h2>
          {totalInadimplente > 0 && (
            <span className="text-sm font-semibold text-red-600">{fmt(totalInadimplente)} em aberto</span>
          )}
        </div>

        {totalInadimplente === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
            Nenhuma mensalidade em atraso.
          </div>
        ) : (
          <div className="space-y-4">
            {faixas.map((faixa) => {
              if (faixa.items.length === 0) return null
              const badgeColor =
                faixa.label === '+90 dias' ? 'bg-red-100 text-red-700 border-red-200' :
                faixa.label === '61–90 dias' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                faixa.label === '31–60 dias' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-yellow-100 text-yellow-700 border-yellow-200'

              const headerBg =
                faixa.label === '+90 dias' ? 'bg-red-50 border-red-200' :
                faixa.label === '61–90 dias' ? 'bg-orange-50 border-orange-200' :
                faixa.label === '31–60 dias' ? 'bg-amber-50 border-amber-200' :
                'bg-yellow-50 border-yellow-200'

              return (
                <div key={faixa.label} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${headerBg}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {faixa.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {faixa.items.length} {faixa.items.length === 1 ? 'mensalidade' : 'mensalidades'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{fmt(faixa.total)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">Aluno</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Vencimento</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Dias em atraso</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-500 text-xs">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {faixa.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-800">{item.nome}</td>
                            <td className="px-4 py-2.5 text-right text-gray-500">
                              {new Date(item.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <span className={`font-medium ${item.dias > 90 ? 'text-red-600' : item.dias > 60 ? 'text-orange-600' : item.dias > 30 ? 'text-amber-600' : 'text-yellow-600'}`}>
                                {item.dias}d
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-gray-700">{fmt(item.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
