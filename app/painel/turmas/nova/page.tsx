import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NovaTurmaForm from './NovaTurmaForm'

export default async function NovaTurmaPage() {
  const supabase = await createClient()

  const [
    { data: modalidades },
    { data: professores },
    { data: salas },
  ] = await Promise.all([
    supabase.from('modalidades').select('id, nome, tipo').eq('ativo', true).order('nome'),
    supabase.from('professores').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('salas').select('id, nome, capacidade_max').eq('ativo', true).order('nome'),
  ])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/painel/turmas" className="text-xs text-gray-400 hover:text-gray-600">← Turmas</Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">Nova turma</h1>
      </div>
      <NovaTurmaForm
        modalidades={modalidades ?? []}
        professores={professores ?? []}
        salas={salas ?? []}
      />
    </div>
  )
}
