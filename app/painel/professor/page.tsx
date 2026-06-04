import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfessorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/painel/login')

  const sb = createServiceClient()

  // Busca dados do professor pelo email
  const { data: professor } = await sb
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .single()

  if (!professor) redirect('/painel/login')

  const hoje = new Date().toISOString().split('T')[0]
  const diasSemana = ['domingo','segunda','terca','quarta','quinta','sexta','sabado']
  const diaSemanaHoje = diasSemana[new Date().getDay()]

  // Busca turmas do professor com alunos
  const { data: turmas } = await sb
    .from('turmas')
    .select(`
      id, nome, nivel, capacidade,
      modalidades(nome),
      turma_horarios(dia_semana, hora_inicio, hora_fim),
      matricula_turmas(
        matriculas(status, alunos(id, nome, status_financeiro))
      )
    `)
    .eq('professor_id', professor.id)
    .not('status', 'eq', 'encerrada')
    .order('nome')

  // Aulas de hoje do professor
  const { data: aulasHoje } = await sb
    .from('aulas')
    .select('id, hora_inicio, hora_fim, status, turmas(nome)')
    .eq('professor_id', professor.id)
    .eq('data', hoje)
    .order('hora_inicio')

  // Logout action
  const logoutUrl = '/api/auth/signout'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs opacity-75">Portal do Professor</p>
          <h1 className="text-base font-semibold">{professor.nome}</h1>
        </div>
        <a href={logoutUrl} className="text-xs opacity-75 hover:opacity-100">Sair</a>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {/* Aulas hoje */}
        {aulasHoje && aulasHoje.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hoje</h2>
            <div className="space-y-2">
              {aulasHoje.map(aula => (
                <a
                  key={aula.id}
                  href={`/painel/professor/chamada/${aula.id}`}
                  className="block bg-white border border-indigo-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{(aula.turmas as any)?.nome}</p>
                    <p className="text-xs text-gray-500">{aula.hora_inicio?.slice(0,5)} – {aula.hora_fim?.slice(0,5)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {aula.status === 'aberta' && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Fazer chamada →</span>
                    )}
                    {aula.status === 'concluida' && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Feita</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Turmas */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Minhas turmas ({turmas?.length ?? 0})
          </h2>
          <div className="space-y-3">
            {(turmas ?? []).map(turma => {
              const alunos = (turma.matricula_turmas ?? [])
                .map((mt: any) => mt.matriculas?.alunos)
                .filter((a: any) => a && mt?.matriculas?.status === 'ativa')

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
                        {(turma.modalidades as any)?.nome}
                        {turma.nivel ? ` · ${turma.nivel}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{alunosAtivos.length}/{turma.capacidade} alunos</span>
                  </div>

                  {horarios.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {horarios.map((h: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {h.dia_semana} {h.hora_inicio?.slice(0,5)}
                        </span>
                      ))}
                    </div>
                  )}

                  {alunosAtivos.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 space-y-1">
                      {alunosAtivos.slice(0,5).map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{a.nome}</span>
                          {a.status_financeiro === 'inadimplente' && (
                            <span className="text-red-500 font-medium">Inadimplente</span>
                          )}
                        </div>
                      ))}
                      {alunosAtivos.length > 5 && (
                        <p className="text-xs text-gray-400">+{alunosAtivos.length - 5} alunos</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
