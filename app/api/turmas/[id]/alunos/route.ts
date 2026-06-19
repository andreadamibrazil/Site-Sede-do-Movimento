import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

// GET — alunos com matrícula ativa que ainda não estão nesta turma
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id: turmaId } = await params
  const sb = createServiceClient()

  // IDs já matriculados nesta turma
  const { data: jaMatriculados } = await sb
    .from('matricula_turmas')
    .select('matricula_id')
    .eq('turma_id', turmaId)
    .is('data_saida', null)

  const idsJaMatriculados = (jaMatriculados ?? []).map((m: any) => m.matricula_id as string)

  // Todas as matrículas ativas com aluno (limite para evitar payloads gigantes)
  const { data: matriculas } = await sb
    .from('matriculas')
    .select('id, aluno_id, alunos(id, nome)')
    .eq('status', 'ativa')
    .limit(500)

  const disponiveis = (matriculas ?? [])
    .filter((m: any) => !idsJaMatriculados.includes(m.id))
    .map((m: any) => ({
      matricula_id: m.id as string,
      aluno_id: m.aluno_id as string,
      nome: (m.alunos as any)?.nome as string ?? '',
    }))
    .filter(m => m.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return NextResponse.json(disponiveis)
}

// POST — adiciona vários alunos à turma de uma vez
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id: turmaId } = await params
  const { matriculaIds, dataEntrada } = await req.json()

  if (!Array.isArray(matriculaIds) || matriculaIds.length === 0) {
    return NextResponse.json({ error: 'matriculaIds deve ser array não vazio' }, { status: 400 })
  }

  const sb = createServiceClient()
  const hoje = new Date().toISOString().split('T')[0]

  const { error } = await sb.from('matricula_turmas').insert(
    matriculaIds.map((matriculaId: string) => ({
      matricula_id: matriculaId,
      turma_id: turmaId,
      data_entrada: dataEntrada ?? hoje,
    }))
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, adicionados: matriculaIds.length })
}
