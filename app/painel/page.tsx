import { createClient, createServiceClient } from '@/lib/supabase/server'
import { RetencaoChart, MetaBar, InadimplentesTable } from './DashboardCharts'

const META_ALUNOS = 120

function mesLabel(ano: number, mes: number) {
  return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = user
    ? await service.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
    : { data: null }
  const isAdmin = perfil?.perfil === 'admin'

  const hoje = new Date()
  const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1)
  const seisMesesAtrasStr = seisMesesAtras.toISOString().slice(0, 10)

  const [
    { count: totalAtivos },
    { count: totalInadimplentes },
    { data: aulasHoje },
    { data: chamadasPendentes },
    { data: entradas },
    { data: saidas },
    { data: inadimplentesDetalhes },
  ] = await Promise.all([
    supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status_pedagogico', 'ativo'),
    supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('status_financeiro', 'inadimplente'),
    supabase.from('aulas')
      .select('id, hora_inicio, hora_fim, turmas(nome), professores(nome)')
      .eq('data', hoje.toISOString().split('T')[0])
      .order('hora_inicio'),
    supabase.from('aulas')
      .select('id, data, turmas(nome)')
      .is('chamada_concluida_em', null)
      .in('status', ['aberta', 'concluida'])
      .gte('data', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
      .lt('data', hoje.toISOString().split('T')[0]),
    service.from('matricula_turmas').select('data_entrada').gte('data_entrada', seisMesesAtrasStr),
    service.from('matricula_turmas').select('data_saida').gte('data_saida', seisMesesAtrasStr).not('data_saida', 'is', null),
    isAdmin
      ? service.from('alunos').select('id, nome, celular, tentativas_contato').eq('status_financeiro', 'inadimplente').order('tentativas_contato')
      : Promise.resolve({ data: [] }),
  ])

  // Experimentais futuros (query separada por limitação do Supabase com filtro em relação)
  const { data: expRaw } = await service
    .from('experimentais')
    .select('id, leads(nome), aulas(data, hora_inicio, turmas(nome))')
    .eq('status', 'agendado')
  const experimentaisFuturos = (expRaw ?? []).filter(e => {
    const aula = e.aulas as any
    return aula?.data >= hoje.toISOString().split('T')[0]
  }).sort((a, b) => ((a.aulas as any)?.data ?? '').localeCompare((b.aulas as any)?.data ?? ''))

  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1)
    return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
  })
  const retencao = meses.map(({ ano, mes }) => ({
    mes: mesLabel(ano, mes),
    entradas: (entradas ?? []).filter(r => { const d = new Date(r.data_entrada); return d.getFullYear() === ano && d.getMonth() + 1 === mes }).length,
    saidas: (saidas ?? []).filter(r => { const d = new Date(r.data_saida!); return d.getFullYear() === ano && d.getMonth() + 1 === mes }).length,
  }))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      {/* Alertas */}
      {((chamadasPendentes?.length ?? 0) > 0 || (totalInadimplentes ?? 0) > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
          <p className="text-sm font-semibold text-red-700">🚨 Alertas</p>
          {(chamadasPendentes?.length ?? 0) > 0 && (
            <p className="text-sm text-red-600">{chamadasPendentes!.length} aula(s) sem chamada nos últimos 7 dias</p>
          )}
          {(totalInadimplentes ?? 0) > 0 && (
            <p className="text-sm text-red-600">{totalInadimplentes} aluno(s) inadimplentes</p>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Alunos ativos" value={totalAtivos ?? 0} color="blue" />
        <StatCard label="Inadimplentes" value={totalInadimplentes ?? 0} color="red" />
        <StatCard label="Aulas hoje" value={aulasHoje?.length ?? 0} color="gray" />
        <StatCard label="Chamadas em aberto" value={chamadasPendentes?.length ?? 0} color="orange" />
        <StatCard label="Experimentais" value={experimentaisFuturos.length} color="purple" />
      </div>

      {/* Meta */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <MetaBar atual={totalAtivos ?? 0} meta={META_ALUNOS} />
      </div>

      {/* Retenção */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Retenção — últimos 6 meses</h2>
        <RetencaoChart data={retencao} />
      </div>

      {/* Aulas de hoje */}
      {(aulasHoje?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Aulas de hoje</h2>
          <div className="space-y-2">
            {aulasHoje!.map((aula) => (
              <div key={aula.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{(aula.turmas as any)?.nome ?? '—'}</p>
                  <p className="text-xs text-gray-500">
                    {aula.hora_inicio.slice(0, 5)} – {aula.hora_fim.slice(0, 5)}
                    {(aula.professores as any)?.nome ? ` · ${(aula.professores as any).nome}` : ''}
                  </p>
                </div>
                <a href={`/painel/chamada/${aula.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Chamada →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chamadas pendentes */}
      {(chamadasPendentes?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Chamadas pendentes</h2>
          <div className="space-y-2">
            {chamadasPendentes!.map((aula) => (
              <div key={aula.id} className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{(aula.turmas as any)?.nome ?? '—'}</p>
                  <p className="text-xs text-orange-600">
                    {new Date(aula.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <a href={`/painel/chamada/${aula.id}`} className="text-xs font-medium text-orange-700 hover:text-orange-800">Fazer chamada →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experimentais agendados */}
      {experimentaisFuturos.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🎭 Experimentais agendados</h2>
          <div className="space-y-2">
            {experimentaisFuturos.map((e: any) => {
              const aula = e.aulas as any
              const data = aula?.data ? new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '—'
              return (
                <div key={e.id} className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{(e.leads as any)?.nome ?? '—'}</p>
                    <p className="text-xs text-purple-700">{(aula?.turmas as any)?.nome ?? '—'} · {data} às {aula?.hora_inicio?.slice(0,5)}</p>
                  </div>
                  <a href="/painel/leads" className="text-xs font-medium text-purple-600 hover:text-purple-700">Ver lead →</a>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Admin only — Inadimplência */}
      {isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Inadimplência</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <InadimplentesTable data={(inadimplentesDetalhes ?? []) as any} />
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'blue' | 'red' | 'gray' | 'orange' | 'purple' }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700', gray: 'bg-gray-50 text-gray-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-purple-50 text-purple-700' }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-[11px] font-medium opacity-70 leading-tight">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
