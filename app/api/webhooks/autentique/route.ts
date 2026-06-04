import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook chamado pelo DocuSeal quando documento é totalmente assinado
// URL: https://sededomovimento.art/api/webhooks/autentique
// Evento: form.completed
export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const evento = (body?.event_type ?? body?.event ?? body?.type) as string | undefined
  const submissionId = String(
    body?.data?.submission?.id ??
    body?.submission?.id ??
    body?.document?.id ??
    body?.id ?? ''
  )

  if (!submissionId) return NextResponse.json({ ok: true })

  const sb = createServiceClient() as any
  const concluido = evento === 'form.completed' || evento === 'document.signed' || evento === 'signed'

  if (!concluido) return NextResponse.json({ ok: true })

  // 1. Atualiza contrato de aluno (se tiver docuseal_id vinculado)
  await sb.from('alunos')
    .update({
      contrato_status: 'assinado',
      contrato_assinado_em: new Date().toISOString(),
    })
    .eq('contrato_docuseal_id', submissionId)

  // 2. Atualiza folha de pagamento (folha do professor)
  await sb.from('folhas_pagamento')
    .update({ status: 'assinado', assinado_em: new Date().toISOString() })
    .eq('autentique_doc_id', submissionId)
    .eq('status', 'enviado')

  return NextResponse.json({ ok: true })
}

// GET para verificação de URL pelo DocuSeal
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Webhook DocuSeal' })
}
