import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook chamado pelo DocuSeal quando documento é totalmente assinado
// URL: https://sededomovimento.art/api/webhooks/autentique?secret=DOCUSEAL_WEBHOOK_SECRET
// Evento: form.completed
export async function POST(req: NextRequest) {
  const secret = process.env.DOCUSEAL_WEBHOOK_SECRET
  if (!secret || req.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // DocuSeal envia: { event_type: "form.completed", data: { submission: { id, ... } } }
  // Também aceita formato Autentique legado: { event: "document.signed", document: { id } }
  const evento = (body?.event_type ?? body?.event ?? body?.type) as string | undefined
  const submissionId =
    body?.data?.submission?.id ??
    body?.submission?.id ??
    body?.document?.id ??
    body?.id

  if (!submissionId) return NextResponse.json({ ok: true })

  const sb = createServiceClient() as any

  const concluido = evento === 'form.completed' || evento === 'document.signed' || evento === 'signed'

  if (concluido) {
    const { error: updateErr } = await sb.from('folhas_pagamento')
      .update({ status: 'assinado', assinado_em: new Date().toISOString() })
      .eq('autentique_doc_id', String(submissionId))
      .eq('status', 'enviado')
    if (updateErr) {
      console.error('webhook autentique: falha ao atualizar folha', updateErr.message)
      return NextResponse.json({ error: 'falha ao atualizar' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
