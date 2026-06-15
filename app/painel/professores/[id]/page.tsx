import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProfessorPerfil from './ProfessorPerfil'

export default async function ProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()

  const { data: prof } = await sb
    .from('professores')
    .select('id, nome, email, celular, cpf, mei, forma_pagamento, valor_base, ativo, observacoes')
    .eq('id', id)
    .single()

  if (!prof) notFound()

  // Turmas vinculadas
  const { data: turmas } = await sb
    .from('turmas')
    .select('id, nome, status, nivel, modalidades(nome), turma_horarios(dia_semana, hora_inicio)')
    .eq('professor_id', id)
    .not('status', 'eq', 'encerrada')
    .order('nome')

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <Link href="/painel/professores" className="text-xs text-gray-400 hover:text-gray-600">← Professores</Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-1">{prof.nome}</h1>
      </div>
      <ProfessorPerfil professor={prof as any} turmas={(turmas ?? []) as any[]} />
    </div>
  )
}
