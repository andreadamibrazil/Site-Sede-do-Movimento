import { timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { downloadContratoAssinado } from '@/lib/docuseal'
import { uploadUniversal } from '@/lib/upload-universal'

// URL: https://www.sededomovimento.art/api/webhooks/docuseal
export async function POST(req: NextRequest) {
  // Auth opcional: DocuSeal v3.0.2 self-hosted não suporta custom headers.
  // Valida apenas se o header x-auth-token foi enviado — se não foi, permite passar.
  const secret = process.env.DOCUSEAL_WEBHOOK_SECRET
  const headerToken = req.headers.get('x-auth-token') ?? ''
  if (secret && headerToken) {
    let authorized = false
    try {
      authorized = headerToken.length === secret.length &&
        timingSafeEqual(Buffer.from(headerToken), Buffer.from(secret))
    } catch { authorized = false }
    if (!authorized) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const evento = body?.event_type as string | undefined

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

  // Busca doc para atualizar + checar idempotência
  const { data: docRow } = await sb
    .from('documentos_aluno')
    .select('id, drive_url, alunos(nome)')
    .eq('docuseal_submission_id', submissionId)
    .maybeSingle()

  if (!docRow) {
    console.warn('[docuseal-webhook] submission não encontrada no banco:', submissionId)
    return NextResponse.json({ ok: true })
  }

  // Atualiza status de assinatura
  await sb
    .from('documentos_aluno')
    .update({ docuseal_status: novoStatus })
    .eq('id', docRow.id)

  // Drive + Azure OpenAI apenas na conclusão final e somente uma vez (drive_url vazio = não processado)
  if (evento === 'submission.completed' && !docRow.drive_url) {
    const alunoNome = (docRow as any).alunos?.nome ?? 'Aluno'
    try {
      const pdfBuffer = await downloadContratoAssinado(submissionId)
      if (pdfBuffer) {
        const slug = alunoNome
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-zA-Z0-9\-_ ]/g, '').trim()
          .replace(/\s+/g, '_').toLowerCase()
        const nomeArquivo = `contrato_assinado_${slug || 'aluno'}.pdf`

        const arrayBuf = pdfBuffer.buffer.slice(
          pdfBuffer.byteOffset,
          pdfBuffer.byteOffset + pdfBuffer.byteLength
        ) as ArrayBuffer

        const result = await uploadUniversal(arrayBuf, nomeArquivo, 'application/pdf', 'contrato', alunoNome)

        if (result.ok) {
          await sb
            .from('documentos_aluno')
            .update({
              drive_url: result.driveUrl,
              dados_extraidos: (result.dadosExtraidos ?? null) as any,
            })
            .eq('id', docRow.id)
        }
      }
    } catch (err) {
      // Não bloqueia o 200 — status já foi atualizado, PDF está no DocuSeal
      console.error('[docuseal-webhook] Drive/AI falhou para submission', submissionId, ':', err)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — DocuSeal Webhook' })
}
