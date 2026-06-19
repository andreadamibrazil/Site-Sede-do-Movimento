import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ADMIN_EMAILS } from '@/lib/auth/adminEmails'

export default async function FrequenciaTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>
}) {
  const { turmaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/professor/login')

  const service = createServiceClient()
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '')

  const { data: professor } = await service
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .maybeSingle()

  if (!professor) redirect('/professor/login')

  const { data: turma } = await service
    .from('turmas')
    .select('id, nome, modalidades(nome)')
    .eq('id', turmaId)
    .maybeSingle()

  if (!turma) notFound()

  // Alunos ativos na turma
  const { data: matriculaTurmas } = await service
    .from('matricula_turmas')
    .select('matriculas!inner(aluno_id, status, alunos(id, nome, nome_social))')
    .eq('turma_id', turmaId)
    .is('data_saida', null)

  const alunos = (matriculaTurmas ?? [])
    .map((mt: any) => mt.matriculas?.alunos)
    .filter(Boolean)
    .sort((a: any, b: any) => a.nome.localeCompare(b.nome))

  // Aulas concluídas da turma (últimos 6 meses)
  const seisAtras = new Date()
  seisAtras.setMonth(seisAtras.getMonth() - 6)

  const { data: aulas } = await service
    .from('aulas')
    .select('id, data, hora_inicio, status')
    .eq('turma_id', turmaId)
    .eq('status', 'concluida')
    .gte('data', seisAtras.toISOString().split('T')[0])
    .order('data', { ascending: false })

  // Presenças de todas as aulas
  const aulaIds = (aulas ?? []).map((a: any) => a.id)
  const { data: presencas } = aulaIds.length > 0
    ? await service
        .from('presencas')
        .select('aluno_id, aula_id, status')
        .in('aula_id', aulaIds)
    : { data: [] }

  // Calcular frequência por aluno
  const totalAulas = aulas?.length ?? 0
  const frequencias = alunos.map((aluno: any) => {
    const minhas = (presencas ?? []).filter((p: any) => p.aluno_id === aluno.id)
    const presentes = minhas.filter((p: any) => p.status === 'presente' || p.status === 'reposicao').length
    const faltas = minhas.filter((p: any) => p.status === 'falta').length
    const justificadas = minhas.filter((p: any) => p.status === 'falta_justificada').length
    const semRegistro = totalAulas - minhas.length
    const pct = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : null
    return { aluno, presentes, faltas, justificadas, semRegistro, pct }
  })

  const nomeDisplay = (aluno: any) => aluno.nome_social || aluno.nome

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <a href="/professor" className="text-xs text-gray-400 hover:text-gray-600">← Voltar</a>
          <h1 className="text-lg font-semibold text-gray-900 mt-1">{turma.nome}</h1>
          <p className="text-xs text-gray-500">
            {(turma.modalidades as any)?.nome} · {totalAulas} aulas concluídas (últimos 6 meses)
          </p>
        </div>

        {totalAulas === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-400">Nenhuma aula concluída ainda.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500">
              <span className="col-span-5">Aluno</span>
              <span className="col-span-2 text-center">Freq.</span>
              <span className="col-span-2 text-center">Faltas</span>
              <span className="col-span-3 text-center">Justificadas</span>
            </div>
            <div className="divide-y divide-gray-50">
              {frequencias.map(({ aluno, presentes, faltas, justificadas, pct }) => (
                <div key={aluno.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <p className="text-sm text-gray-800 truncate">{nomeDisplay(aluno)}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    {pct !== null ? (
                      <span className={`text-sm font-semibold ${
                        pct >= 75 ? 'text-green-600' :
                        pct >= 50 ? 'text-orange-500' :
                        'text-red-600'
                      }`}>{pct}%</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm ${faltas > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {faltas}
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className={`text-sm ${justificadas > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {justificadas}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Verde ≥ 75% · Laranja ≥ 50% · Vermelho &lt; 50%
        </p>
      </div>
    </div>
  )
}
