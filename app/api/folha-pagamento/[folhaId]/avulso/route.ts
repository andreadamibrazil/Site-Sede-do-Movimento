import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { recalcularFolha } from '@/lib/folha/recalcular'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/folha-pagamento/[folhaId]/avulso — adiciona item avulso (workshop, passagem, etc.)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const { descricao, valor } = await req.json()

  const numValor = Number(String(valor).replace(',', '.'))
  if (!descricao?.trim() || !valor || isNaN(numValor) || numValor <= 0) {
    return NextResponse.json({ error: 'descricao e valor são obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient() as any

  const { data: folha } = await sb
    .from('folhas_pagamento')
    .select('id, status')
    .eq('id', folhaId)
    .single()

  if (!folha) return NextResponse.json({ error: 'Folha não encontrada' }, { status: 404 })
  if (folha.status === 'assinado' || folha.status === 'pago') {
    return NextResponse.json({ error: 'Folha bloqueada para edição' }, { status: 403 })
  }

  const { error } = await sb.from('itens_folha').insert({
    folha_id: folhaId,
    tipo: 'avulso',
    descricao: descricao.trim(),
    valor: Math.round(numValor * 100) / 100,
    pago: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcularFolha(sb, folhaId)

  return NextResponse.json({ ok: true })
}
