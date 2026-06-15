import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/folha-pagamento/itens/[itemId] — toggle pago ou atualiza motivo
// DELETE /api/folha-pagamento/itens/[itemId] — remove item e recalcula totais

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { itemId } = await params
  const body = await req.json()
  const sb = createServiceClient()

  const { data: item, error: fetchErr } = await sb
    .from('itens_folha')
    .select('id, folha_id, tipo, valor, pago')
    .eq('id', itemId)
    .single()

  if (fetchErr || !item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const updates: Record<string, any> = {}
  if (typeof body.pago === 'boolean') updates.pago = body.pago
  if (typeof body.descricao === 'string') updates.descricao = body.descricao

  // Se mudando pago para false, zera o valor
  if (body.pago === false && item.pago === true) updates.valor = 0
  // Se reativando (pago true), não recalculamos — admin deve gerar novamente

  await (sb as any).from('itens_folha').update(updates).eq('id', itemId)

  await recalcularFolha(sb, item.folha_id)

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { itemId } = await params
  const sb = createServiceClient()

  const { data: item } = await sb
    .from('itens_folha')
    .select('folha_id')
    .eq('id', itemId)
    .single()

  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const folhaId = item.folha_id
  await sb.from('itens_folha').delete().eq('id', itemId)
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

  const valorTotal = Math.round((valorAulas + valorFixo) * 100) / 100

  await sb
    .from('folhas_pagamento')
    .update({ valor_aulas: valorAulas, valor_fixo: valorFixo, valor_total: valorTotal })
    .eq('id', folhaId)
}
