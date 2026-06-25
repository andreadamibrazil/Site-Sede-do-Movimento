import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { recalcularFolha } from '@/lib/folha/recalcular'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/folha-pagamento/[folhaId]/turma-alunos
// Ajusta num_alunos_mes de todos os itens de uma turma na folha e recalcula valores
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const body = await req.json()
  const { turma_id, num_alunos } = body

  if (!turma_id || typeof num_alunos !== 'number' || num_alunos < 0) {
    return NextResponse.json({ error: 'turma_id e num_alunos obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient()

  const { data: folha } = await sb
    .from('folhas_pagamento')
    .select('id, status')
    .eq('id', folhaId)
    .single()

  if (!folha) return NextResponse.json({ error: 'Folha não encontrada' }, { status: 404 })
  if (folha.status !== 'rascunho') {
    return NextResponse.json({ error: 'Só é possível ajustar folhas em rascunho' }, { status: 409 })
  }

  // Faixas de hora/aula para recalcular valor_hora
  const { data: faixas } = await sb
    .from('faixas_hora_aula')
    .select('*')
    .eq('ativo', true)
    .order('min_alunos')

  function calcularValorHora(n: number, tId: string) {
    const faixasTurma = (faixas ?? []).filter((f: any) => f.turma_id === tId)
    const faixasGlobais = (faixas ?? []).filter((f: any) => !f.turma_id)
    const pool = faixasTurma.length > 0 ? faixasTurma : faixasGlobais
    const sorted = [...pool].sort((a: any, b: any) => a.min_alunos - b.min_alunos)
    const faixa = pool.find((f: any) =>
      n >= f.min_alunos && (f.max_alunos === null || n <= f.max_alunos)
    ) ?? sorted[sorted.length - 1]
    const valorHora = faixa?.valor_hora ?? 31.50
    const piso = sorted[0]?.valor_hora ?? 31.50
    return { valor: valorHora, bonus: Math.max(0, valorHora - piso), piso }
  }

  const { valor: valorHora, bonus: bonusHora, piso: pisoHora } = calcularValorHora(num_alunos, turma_id)

  // Busca itens de aula desta turma
  const { data: itens } = await sb
    .from('itens_folha')
    .select('id, horas_aula, pago')
    .eq('folha_id', folhaId)
    .eq('turma_id', turma_id)
    .eq('tipo', 'aula')

  if (!itens || itens.length === 0) {
    return NextResponse.json({ error: 'Nenhuma aula encontrada para esta turma na folha' }, { status: 404 })
  }

  // Atualiza campos comuns em bulk
  await sb
    .from('itens_folha')
    .update({ num_alunos_mes: num_alunos, valor_hora_base: pisoHora, bonus_hora: bonusHora, valor_hora_efetivo: valorHora })
    .in('id', itens.map((i: any) => i.id))

  // Atualiza valor individualmente (depende de horas_aula por item)
  await Promise.all(
    itens.map((item: any) => {
      const valor = item.pago ? Math.round((item.horas_aula ?? 0) * valorHora * 100) / 100 : 0
      return sb.from('itens_folha').update({ valor }).eq('id', item.id)
    })
  )

  // Recalcula totais da folha (centralizado para consistência com outras rotas)
  await recalcularFolha(sb, folhaId)

  return NextResponse.json({ ok: true, num_alunos, valor_hora: valorHora })
}
