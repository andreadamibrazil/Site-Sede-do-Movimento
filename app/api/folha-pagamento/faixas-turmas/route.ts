import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

// POST — define valor/hora fixo para uma turma específica (sobrepõe faixas globais)
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const sb = createServiceClient()
  const { turma_id, valor_hora } = await req.json()
  if (!turma_id || !valor_hora) {
    return NextResponse.json({ error: 'turma_id e valor_hora obrigatórios' }, { status: 400 })
  }
  const v = parseFloat(valor_hora)
  if (isNaN(v) || v <= 0) {
    return NextResponse.json({ error: 'valor_hora inválido' }, { status: 400 })
  }

  // Remove override existente para essa turma
  await sb.from('faixas_hora_aula').delete().eq('turma_id', turma_id)

  // Insere nova linha única cobrindo qualquer número de alunos
  const { error } = await sb.from('faixas_hora_aula').insert({
    turma_id,
    min_alunos: 0,
    max_alunos: null,
    valor_hora: v,
    ativo: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE — remove override de uma turma (volta a usar faixas globais)
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const sb = createServiceClient()
  const { turma_id } = await req.json()
  if (!turma_id) return NextResponse.json({ error: 'turma_id obrigatório' }, { status: 400 })

  await sb.from('faixas_hora_aula').delete().eq('turma_id', turma_id)
  return NextResponse.json({ ok: true })
}
