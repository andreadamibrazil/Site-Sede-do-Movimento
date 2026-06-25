import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PlanoAula from '@/app/painel/turmas/[id]/PlanoAula'

export default async function ProfessorPlanoPage({ params }: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/professor/login?next=/professor/plano/${turmaId}`)

  const sb = createServiceClient()

  const [{ data: professor }, { data: perfilRow }] = await Promise.all([
    sb.from('professores').select('id, nome').eq('email', user.email ?? '').eq('ativo', true).maybeSingle(),
    sb.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle(),
  ])

  if (!professor) redirect('/professor/login')

  const isAdmin = perfilRow?.perfil === 'admin' || perfilRow?.perfil === 'secretaria'

  // Busca turma sem filtro — verifica ownership abaixo
  const { data: turma } = await sb
    .from('turmas')
    .select('id, nome, professor_id, professores!professor_id(nome)')
    .eq('id', turmaId)
    .maybeSingle()

  if (!turma) notFound()

  // Verifica acesso: professor primário ou co-regente
  if (!isAdmin) {
    const primario = turma.professor_id === professor.id
    if (!primario) {
      const { data: coReg } = await sb
        .from('turma_professores' as any)
        .select('professor_id')
        .eq('turma_id', turmaId)
        .eq('professor_id', professor.id)
        .maybeSingle()
      if (!coReg) notFound()
    }
  }

  // Datas do semestre atual para contextualizar o plano de aula
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = agora.getMonth() + 1
  const dataInicio = mes <= 6 ? `${ano}-01-01` : `${ano}-07-01`
  const dataFim    = mes <= 6 ? `${ano}-06-30` : `${ano}-12-31`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white px-4 py-4 flex items-center gap-3">
        <a href="/professor" className="text-white/70 hover:text-white">← Voltar</a>
        <div>
          <p className="text-xs opacity-75">Plano de aula{isAdmin && (turma as any).professores?.nome ? ` · ${(turma as any).professores.nome}` : ''}</p>
          <h1 className="text-base font-semibold">{turma.nome}</h1>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
          <p className="font-medium mb-1">Como funciona</p>
          <p className="text-xs text-indigo-600">Cole ou escreva o plano de aula do ciclo. O sistema analisa com IA e extrai: objetivos, cronograma por mês, metodologia e critérios de avaliação.</p>
        </div>

        <PlanoAula
          turmaId={turmaId}
          dataInicio={dataInicio}
          dataFim={dataFim}
        />
      </div>
    </div>
  )
}
