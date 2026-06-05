import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PlanoAula from '@/app/painel/turmas/[id]/PlanoAula'
import { ADMIN_EMAILS } from '@/lib/auth/adminEmails'

export default async function ProfessorPlanoPage({ params }: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/professor/login')

  const sb = createServiceClient()

  // Verifica que é professor desta turma
  const { data: professor } = await sb
    .from('professores')
    .select('id, nome')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .single()

  if (!professor) redirect('/professor/login')

  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '')

  const turmaQuery = sb
    .from('turmas')
    .select('id, nome, professores(nome)')
    .eq('id', turmaId)
  if (!isAdmin) turmaQuery.eq('professor_id', professor.id)
  const { data: turma } = await turmaQuery.single()

  if (!turma) notFound()

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
        />
      </div>
    </div>
  )
}
