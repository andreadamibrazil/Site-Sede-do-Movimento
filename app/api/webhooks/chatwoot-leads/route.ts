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
  if (n.length === 13 && n.startsWith('55')) return n.slice(2)               // 55+DDD+9+8 → 11
  if (n.length === 14 && n.startsWith('55')) return n.slice(2, 13)           // 55+12dig → strip 55+last
  if (n.length === 12 && n.startsWith('55')) return n.slice(2, 4) + '9' + n.slice(4) // 55+DDD+8 → add 9
  if (n.length === 12) return n.slice(0, 11)                                 // trailing digit → strip
  if (n.length === 10) return n.slice(0, 2) + '9' + n.slice(2)              // DDD+8 → add 9
  if (n.length === 11) return n
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

  const sb = createServiceClient()

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
      nome,
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
