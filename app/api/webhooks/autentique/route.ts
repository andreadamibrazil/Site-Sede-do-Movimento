import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook chamado pelo DocuSeal quando documento é totalmente assinado
// URL: https://sededomovimento.art/api/webhooks/autentique
// Configurar no DocuSeal: Configurações → Webhooks → token = DOCUSEAL_WEBHOOK_SECRET
export async function POST(req: NextRequest) {
  // Verifica token de segurança — aceita via header X-Auth-Token OU query ?secret=
  const secret = process.env.DOCUSEAL_WEBHOOK_SECRET
  if (secret) {
    const headerToken = req.headers.get('x-auth-token') ?? req.headers.get('authorization')?.replace('Bearer ', '')
    const queryToken = req.nextUrl.searchParams.get('secret')
    const tokenRecebido = headerToken ?? queryToken
    if (tokenRecebido !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

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

  const agora = new Date().toISOString()

  // 1. Atualiza documento do aluno (contrato assinado via DocuSeal)
  await sb.from('documentos_aluno')
    .update({ docuseal_status: 'assinado' })
    .eq('docuseal_submission_id', submissionId)

  // 2. Atualiza folha de pagamento do professor (se aplicável)
  await sb.from('folhas_pagamento')
    .update({ status: 'assinado', assinado_em: agora })
    .eq('autentique_doc_id', submissionId)
    .eq('status', 'enviado')

  return NextResponse.json({ ok: true })
}

// GET para verificação de URL pelo DocuSeal
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Webhook DocuSeal' })
}
