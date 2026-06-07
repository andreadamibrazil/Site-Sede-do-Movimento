import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatriculaWizard from './MatriculaWizard'

export default async function NovaMatriculaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: aluno },
    { data: turmas },
  ] = await Promise.all([
    supabase.from('alunos').select('id, nome, data_nascimento, celular, email').eq('id', id).single(),
    supabase
      .from('turmas')
      .select(`
        id, nome, preco_padrao, capacidade, nivel, faixa_etaria_min, faixa_etaria_max,
        modalidades(id, nome),
        professores(nome),
        salas(nome),
        turma_horarios(dia_semana, hora_inicio, hora_fim),
        matricula_turmas(id)
      `)
      .eq('status', 'ativa')
      .order('nome'),
  ])

  if (!aluno) notFound()

  // Conta alunos ativos por turma para mostrar vagas
  const turmasComVagas = (turmas ?? []).map(t => ({
    ...t,
    alunos_ativos: (t.matricula_turmas as any[])?.length ?? 0,
    vagas_restantes: t.capacidade - ((t.matricula_turmas as any[])?.length ?? 0),
  }))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <a href={`/painel/alunos/${id}`} className="text-xs text-gray-400 hover:text-gray-600">
          ← {aluno.nome}
        </a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Nova matrícula</h1>
      </div>
      <MatriculaWizard aluno={aluno as any} turmas={turmasComVagas as any} />
    </div>
  )
}
