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
    .select('id, folha_id, tipo, valor, pago, valor_hora_efetivo, horas_aula')
    .eq('id', itemId)
    .single()

  if (fetchErr || !item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

  const updates: Record<string, any> = {}
  if (typeof body.pago === 'boolean') updates.pago = body.pago

  // descricao_motivo é o campo enviado pelo componente; null limpa o motivo
  if ('descricao_motivo' in body) updates.descricao = body.descricao_motivo ?? null

  // Zerando: pago false → zera valor
  if (body.pago === false && item.pago !== false) updates.valor = 0

  // Restaurando: pago true → recalcula valor a partir da taxa horária armazenada
  if (body.pago === true && item.pago === false) {
    const vh = Number(item.valor_hora_efetivo ?? 0)
    const h = Number(item.horas_aula ?? 0)
    if (vh > 0 && h > 0) updates.valor = Math.round(vh * h * 100) / 100
  }

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
    .select('folha_id, tipo')
    .eq('id', itemId)
    .single()

  if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
  if ((item as any).tipo !== 'avulso') {
    return NextResponse.json({ error: 'Apenas itens avulsos podem ser removidos' }, { status: 403 })
  }

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
    .update({
      valor_aulas: Math.round(valorAulas * 100) / 100,
      valor_fixo: Math.round(valorFixo * 100) / 100,
      valor_total: valorTotal,
    })
    .eq('id', folhaId)
}
