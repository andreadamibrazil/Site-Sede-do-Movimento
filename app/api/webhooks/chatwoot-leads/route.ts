import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook do Chatwoot — cria lead quando uma nova conversa começa com contato desconhecido
//
// Configurar em crm.sededomovimento.art → Settings → Integrations → Webhooks:
//   URL: https://sededomovimento.art/api/webhooks/chatwoot-leads
//   Eventos: conversation_created
//   (se tiver campo de token secreto, defina CHATWOOT_WEBHOOK_SECRET no Vercel)

function normalizarCelular(phone: string | null | undefined): string | null {
  if (!phone) return null
  const n = phone.replace(/\D/g, '')
  if (n.startsWith('55') && n.length >= 12) return n.slice(2)
  if (n.length >= 10) return n
  return null
}

export async function POST(req: NextRequest) {
  // Autenticação opcional via token secreto
  const secret = process.env.CHATWOOT_WEBHOOK_SECRET?.trim()
  if (secret) {
    const token = req.headers.get('x-chatwoot-token')?.trim()
    if (token !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  // Só processa conversation_created
  if (body?.event !== 'conversation_created') {
    return NextResponse.json({ ok: true, skipped: body?.event })
  }

  // Extrai dados do remetente (contato)
  const sender = body?.meta?.sender
  const nome: string = sender?.name ?? 'Sem nome'
  const celular = normalizarCelular(sender?.phone_number)

  if (!celular) {
    return NextResponse.json({ ok: true, skipped: 'no phone' })
  }

  const sb = createServiceClient() as any

  // Verifica se já é lead — se for, não duplica
  const { data: existente } = await sb
    .from('leads')
    .select('id')
    .eq('celular', celular)
    .maybeSingle()

  if (existente) {
    return NextResponse.json({ ok: true, action: 'already_lead', lead_id: existente.id })
  }

  // Cria novo lead
  const { data: novoLead, error } = await sb
    .from('leads')
    .insert({
      nome: nome !== 'Sem nome' ? nome : null,
      celular,
      origem: 'chatwoot',
      status: 'novo',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[chatwoot-leads] insert:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, action: 'created', lead_id: novoLead.id })
}

// GET para verificação de URL pelo Chatwoot
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Chatwoot Leads Webhook' })
}
