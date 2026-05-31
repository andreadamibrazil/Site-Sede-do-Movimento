import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditarTurmaForm from './EditarTurmaForm'

export default async function EditarTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: turma },
    { data: horarios },
    { data: modalidades },
    { data: professores },
    { data: salas },
  ] = await Promise.all([
    supabase.from('turmas').select('*').eq('id', id).single(),
    supabase.from('turma_horarios').select('*').eq('turma_id', id).order('dia_semana'),
    supabase.from('modalidades').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('professores').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('salas').select('id, nome, capacidade_max').eq('ativo', true).order('nome'),
  ])

  if (!turma) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href={`/painel/turmas/${id}`} className="text-xs text-gray-400 hover:text-gray-600">← {turma.nome}</a>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Editar turma</h1>
      </div>
      <EditarTurmaForm
        turma={turma}
        horarios={horarios ?? []}
        modalidades={modalidades ?? []}
        professores={professores ?? []}
        salas={salas ?? []}
      />
    </div>
  )
}
