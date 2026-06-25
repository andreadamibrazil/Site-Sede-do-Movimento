import { timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// URL: https://www.sededomovimento.art/api/webhooks/docuseal
// DocuSeal: Settings → Webhooks → secret = DOCUSEAL_WEBHOOK_SECRET (header X-Auth-Token)
export async function POST(req: NextRequest) {
  const secret = process.env.DOCUSEAL_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'webhook not configured' }, { status: 503 })

  const headerToken = req.headers.get('x-auth-token') ?? ''
  let authorized = false
  try {
    authorized = headerToken.length === secret.length &&
      timingSafeEqual(Buffer.from(headerToken), Buffer.from(secret))
  } catch { authorized = false }
  if (!authorized) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const evento = body?.event_type as string | undefined

  // form.completed → um assinante concluiu
  // submission.completed → todos os assinantes concluíram
  if (evento !== 'form.completed' && evento !== 'submission.completed') {
    return NextResponse.json({ ok: true })
  }

  const submissionId = String(
    body?.data?.submission_id ??  // form.completed
    body?.data?.id ??             // submission.completed
    ''
  )
  if (!submissionId || submissionId === '0') return NextResponse.json({ ok: true })

  const novoStatus = evento === 'submission.completed' ? 'assinado' : 'parcialmente_assinado'
  const sb = createServiceClient()

  const { data, error } = await sb
    .from('documentos_aluno')
    .update({ docuseal_status: novoStatus })
    .eq('docuseal_submission_id', submissionId)
    .select('id')

  if (error || !data?.length) console.warn('[docuseal-webhook] submission não encontrada no banco:', submissionId, error?.message)

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — DocuSeal Webhook' })
}
