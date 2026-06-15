import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
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

  if (!descricao?.trim() || !valor || Number(valor) <= 0) {
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
    valor: Math.round(Number(valor) * 100) / 100,
    pago: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await recalcularFolha(sb, folhaId)

  return NextResponse.json({ ok: true })
}

async function recalcularFolha(sb: any, folhaId: string) {
  const { data: itens } = await sb
    .from('itens_folha')
    .select('tipo, valor, pago')
    .eq('folha_id', folhaId)

  let valorAulas = 0
  let valorFixo = 0

  for (const item of (itens ?? [])) {
    const v = item.pago ? (item.valor ?? 0) : 0
    if (item.tipo === 'aula') valorAulas += v
    else valorFixo += v
  }

  await sb.from('folhas_pagamento').update({
    valor_aulas: Math.round(valorAulas * 100) / 100,
    valor_fixo: Math.round(valorFixo * 100) / 100,
    valor_total: Math.round((valorAulas + valorFixo) * 100) / 100,
  }).eq('id', folhaId)
}
