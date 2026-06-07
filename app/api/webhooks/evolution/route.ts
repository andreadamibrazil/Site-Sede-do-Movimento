import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook da Evolution API — recebe eventos de mensagem e salva na tabela conversas
// Configurar em cada instância Evolution: POST https://sededomovimento.art/api/webhooks/evolution
// Header de autenticação: apikey = EVOLUTION_WEBHOOK_SECRET (env var)

function jidToCelular(jid: string): string | null {
  // "5521982399484@s.whatsapp.net" → "21982399484"
  const raw = jid?.split('@')[0]
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  // Remove DDI 55 se presente e resultado tiver 11 dígitos
  if (digits.startsWith('55') && digits.length === 13) return digits.slice(2)
  if (digits.length === 11) return digits
  return digits.length >= 10 ? digits : null
}

export async function POST(req: NextRequest) {
  // Autenticação via apikey no header (padrão Evolution API)
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET
  if (secret) {
    const apikey = req.headers.get('apikey') ?? req.headers.get('x-api-key')
    if (apikey?.trim() !== secret.trim()) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const event = body?.event as string | undefined
  // Processar apenas eventos de mensagem recebida ou enviada
  if (!event || !['messages.upsert', 'messages.update'].includes(event)) {
    return NextResponse.json({ ok: true, skipped: event })
  }

  const data = body?.data
  const messages = Array.isArray(data?.messages) ? data.messages : data ? [data] : []
  if (!messages.length) return NextResponse.json({ ok: true })

  const sb = createServiceClient() as any

  for (const msg of messages) {
    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''
    // Ignorar grupos e broadcasts
    if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') continue

    const celular = jidToCelular(remoteJid)
    if (!celular) continue

    const messageEntry = {
      id: msg?.key?.id,
      fromMe: msg?.key?.fromMe ?? false,
      timestamp: msg?.messageTimestamp ?? Math.floor(Date.now() / 1000),
      type: msg?.messageType ?? 'unknown',
      text: msg?.message?.conversation
        ?? msg?.message?.extendedTextMessage?.text
        ?? msg?.message?.imageMessage?.caption
        ?? null,
    }

    // Busca conversa existente para este celular (fonte whatsapp)
    const { data: existing } = await sb
      .from('conversas')
      .select('id, messages')
      .eq('celular', celular)
      .eq('source', 'whatsapp')
      .maybeSingle()

    if (existing) {
      const msgs: any[] = existing.messages ?? []
      // Evita duplicar mesma mensagem
      if (!msgs.find((m: any) => m.id === messageEntry.id)) {
        msgs.push(messageEntry)
        await sb.from('conversas')
          .update({ messages: msgs, updated_at: new Date().toISOString(), analisado_em: null })
          .eq('id', existing.id)
      }
    } else {
      // Busca lead_id para vincular
      const { data: lead } = await sb
        .from('leads')
        .select('id')
        .eq('celular', celular)
        .maybeSingle()

      await sb.from('conversas').insert({
        celular,
        lead_id: lead?.id ?? null,
        source: 'whatsapp',
        messages: [messageEntry],
        variables: { instance: body?.instance ?? null },
      })
    }
  }

  return NextResponse.json({ ok: true })
}

// GET para verificação de URL pela Evolution API
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Webhook Evolution API' })
}
