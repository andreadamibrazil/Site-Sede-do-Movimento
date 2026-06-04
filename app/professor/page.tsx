import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const DIAS: Record<string, string> = {
  segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
  quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom'
}

export default async function ProfessorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/professor/login')

  const sb = createServiceClient()

  const { data: professor } = await sb
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .single()

  if (!professor) redirect('/professor/login')

  const hoje = new Date().toISOString().split('T')[0]
  const em7dias = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  // Aulas dos próximos 7 dias
  const { data: aulasProximas } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, status, turmas(nome)')
    .eq('professor_id', professor.id)
    .gte('data', hoje)
    .lte('data', em7dias)
    .order('data')
    .order('hora_inicio')

  // Turmas do professor
  const { data: turmas } = await sb
    .from('turmas')
    .select(`
      id, nome, nivel, capacidade, data_inicio, data_fim,
      modalidades(nome),
      turma_horarios(dia_semana, hora_inicio, hora_fim),
      matricula_turmas(
        matriculas(status, alunos(id, nome, status_financeiro))
      )
    `)
    .eq('professor_id', professor.id)
    .not('status', 'eq', 'encerrada')
    .order('nome')

  const aulasHoje = (aulasProximas ?? []).filter(a => a.data === hoje)
  const aulasSemana = (aulasProximas ?? []).filter(a => a.data > hoje)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs opacity-75">Portal do Professor</p>
          <h1 className="text-base font-semibold">{professor.nome}</h1>
        </div>
        <a href="/api/painel/logout" className="text-xs opacity-75 hover:opacity-100 px-2 py-1 border border-white/30 rounded-lg">Sair</a>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">

        {/* Aulas de hoje */}
        {aulasHoje.length > 0 ? (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">📅 Hoje</h2>
            <div className="space-y-2">
              {aulasHoje.map(aula => (
                <a key={aula.id} href={`/professor/chamada/${aula.id}`}
                  className="block bg-white border-2 border-indigo-300 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{(aula.turmas as any)?.nome}</p>
                      <p className="text-xs text-gray-500">{aula.hora_inicio?.slice(0,5)} – {aula.hora_fim?.slice(0,5)}</p>
                    </div>
                    <div>
                      {aula.status === 'aberta' && (
                        <span className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold">
                          Fazer chamada →
                        </span>
                      )}
                      {aula.status === 'concluida' && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full">✓ Chamada feita</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-indigo-600 mt-1.5">Inclui: presença, aluno faltou, professor faltou + atestado, substituto</p>
                </a>
              ))}
            </div>
          </section>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-5 text-center">
            <p className="text-sm text-gray-500">Nenhuma aula hoje</p>
          </div>
        )}

        {/* Próximas aulas */}
        {aulasSemana.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Próximas aulas</h2>
            <div className="space-y-1.5">
              {aulasSemana.map(aula => {
                const d = new Date(aula.data + 'T12:00:00')
                const dia = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]
                return (
                  <div key={aula.id} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{(aula.turmas as any)?.nome}</p>
                      <p className="text-xs text-gray-400">{dia} {d.toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'})} · {aula.hora_inicio?.slice(0,5)}</p>
                    </div>
                    <a href={`/professor/chamada/${aula.id}`} className="text-xs text-indigo-500 hover:text-indigo-700">Ver →</a>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Minhas turmas */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Minhas turmas ({turmas?.length ?? 0})
          </h2>
          <div className="space-y-3">
            {(turmas ?? []).map(turma => {
              const alunosAtivos = (turma.matricula_turmas ?? [])
                .filter((mt: any) => mt.matriculas?.status === 'ativa')
                .map((mt: any) => mt.matriculas?.alunos)
                .filter(Boolean)
              const horarios = (turma.turma_horarios ?? []) as any[]

              return (
                <div key={turma.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{turma.nome}</p>
                      <p className="text-xs text-gray-400">
                        {(turma.modalidades as any)?.nome}{turma.nivel ? ` · ${turma.nivel}` : ''}
                      </p>
                      {(turma as any).data_inicio && (
                        <p className="text-xs text-gray-300 mt-0.5">
                          {new Date((turma as any).data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', {month:'short',year:'numeric'})}
                          {(turma as any).data_fim ? ` → ${new Date((turma as any).data_fim + 'T12:00:00').toLocaleDateString('pt-BR', {month:'short',year:'numeric'})}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{alunosAtivos.length}/{turma.capacidade}</span>
                  </div>

                  {horarios.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {horarios.map((h: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {DIAS[h.dia_semana] ?? h.dia_semana} {h.hora_inicio?.slice(0,5)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Alunos */}
                  {alunosAtivos.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Alunos ({alunosAtivos.length})</p>
                      {alunosAtivos.slice(0,8).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{a.nome}</span>
                          {a.status_financeiro === 'inadimplente' && (
                            <span className="text-red-500 text-[10px]">Inadimplente</span>
                          )}
                        </div>
                      ))}
                      {alunosAtivos.length > 8 && <p className="text-xs text-gray-400">+{alunosAtivos.length - 8} alunos</p>}
                    </div>
                  )}

                  {/* Plano de aula */}
                  <div className="border-t border-gray-100 pt-2">
                    <a href={`/professor/plano/${turma.id}`}
                      className="flex items-center justify-between text-xs text-indigo-600 hover:text-indigo-700 py-1">
                      <span>📋 Plano de aula</span>
                      <span>Enviar / Ver →</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
