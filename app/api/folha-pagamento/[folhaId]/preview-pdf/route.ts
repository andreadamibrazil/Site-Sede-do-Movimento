import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { gerarPDFFolha } from '@/lib/folha-pdf'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/folha-pagamento/[folhaId]/preview-pdf — retorna o PDF para prévia (não envia)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const sb = createServiceClient()

  const { data: folha } = await sb
    .from('folhas_pagamento')
    .select('*, professores(nome, cpf, mei)')
    .eq('id', folhaId)
    .single()

  if (!folha) return NextResponse.json({ error: 'Folha não encontrada' }, { status: 404 })

  const { data: itens } = await sb
    .from('itens_folha')
    .select('*, turmas(nome)')
    .eq('folha_id', folhaId)
    .order('data_aula')

  const prof = folha.professores
  const mesRef = new Date(folha.mes_referencia + 'T12:00:00')
  const nomeMes = mesRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const mes = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)

  const pdfBytes = await gerarPDFFolha({
    professor: prof?.nome ?? '',
    cpf: prof?.cpf ?? undefined,
    mei: prof?.mei ?? undefined,
    mes,
    valor_aulas: Number(folha.valor_aulas),
    valor_fixo: Number(folha.valor_fixo),
    valor_total: Number(folha.valor_total),
    itens: (itens ?? []).map((i: any) => ({
      ...i,
      descricao: i.tipo === 'aula' ? i.turmas?.nome : i.descricao,
    })),
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="folha-${prof?.nome?.replace(/\s+/g, '-')}-${mes}.pdf"`,
    },
  })
}
