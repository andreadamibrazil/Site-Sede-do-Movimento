import { createServiceClient } from '@/lib/supabase/server'
import { appendMessage } from '@/lib/azure-blob'
import { NextRequest, NextResponse } from 'next/server'

// Webhook da Evolution API — recebe eventos de mensagem e salva na tabela conversas
// Também grava no Azure Blob (fonte do cron de análise IA)
// Configurar em cada instância Evolution: POST https://sededomovimento.art/api/webhooks/evolution
// Header de autenticação: apikey = EVOLUTION_WEBHOOK_SECRET (env var)

function jidToCelular(jid: string): string | null {
  // "5521982399484@s.whatsapp.net" → "21982399484"
  if (jid?.endsWith('@lid')) return null
  const raw = jid?.split('@')[0]
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('55')) return d.slice(2)               // 55+DDD+9+8 → 11
  if (d.length === 14 && d.startsWith('55')) return d.slice(2, 13)           // 55+12dig → strip 55+last
  if (d.length === 12 && d.startsWith('55')) return d.slice(2, 4) + '9' + d.slice(4) // 55+DDD+8 → add 9
  if (d.length === 12) return d.slice(0, 11)                                 // trailing digit → strip
  if (d.length === 11) return d
  if (d.length === 10) return d.slice(0, 2) + '9' + d.slice(2)              // DDD+8 → add 9
  return d.length >= 10 ? d.slice(0, 11) : null
}

async function resolveLidCelular(lid: string, instance: string): Promise<string | null> {
  // Consulta Evolution API para mapear @lid → número real
  const evoUrl = process.env.EVOLUTION_API_URL
  const evoKey = process.env.EVOLUTION_API_KEY
  if (!evoUrl || !evoKey) return null
  try {
    const res = await fetch(`${evoUrl}/contact/find/${instance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: evoKey },
      body: JSON.stringify({ where: { remoteJid: lid } }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const contacts = await res.json()
    const contact = Array.isArray(contacts) ? contacts[0] : contacts
    const realJid: string = contact?.remoteJid ?? contact?.jid ?? ''
    if (realJid && !realJid.endsWith('@lid')) return jidToCelular(realJid)
    // Tenta campo number direto
    const num: string = contact?.number ?? ''
    if (num) return jidToCelular(`${num}@s.whatsapp.net`)
  } catch { /* silencioso */ }
  return null
}

export async function POST(req: NextRequest) {
  // Autenticação via apikey no header (padrão Evolution API)
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/evolution] EVOLUTION_WEBHOOK_SECRET não configurada — endpoint bloqueado')
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 })
  }
  const apikey = req.headers.get('apikey') ?? req.headers.get('x-api-key')
  if (apikey?.trim() !== secret.trim()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
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

  const sb = createServiceClient()

  for (const msg of messages) {
    const remoteJid: string = msg?.key?.remoteJid ?? msg?.remoteJid ?? ''
    // Ignorar grupos e broadcasts
    if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') continue

    let celular = jidToCelular(remoteJid)
    if (!celular && remoteJid.endsWith('@lid')) {
      celular = await resolveLidCelular(remoteJid, body?.instance ?? '')
    }
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

    const instance: string = body?.instance ?? 'sede-movimento'

    if (existing) {
      const msgs: any[] = Array.isArray(existing.messages) ? (existing.messages as any[]) : []
      // Evita duplicar mesma mensagem; limita array aos últimos 200
      if (!msgs.find((m: any) => m.id === messageEntry.id)) {
        msgs.push(messageEntry)
        const msgsTruncadas = msgs.length > 200 ? msgs.slice(-200) : msgs
        await sb.from('conversas')
          .update({ messages: msgsTruncadas, updated_at: new Date().toISOString(), analisado_em: null })
          .eq('id', existing.id)
        // Sincroniza com Azure Blob para o cron de análise IA conseguir ler
        try { await appendMessage(instance, celular, messageEntry) } catch { /* sem Azure configurado — ignora */ }
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
        variables: { instance },
      })
      // Sincroniza com Azure Blob para o cron de análise IA conseguir ler
      try { await appendMessage(instance, celular, messageEntry) } catch { /* sem Azure configurado — ignora */ }
    }
  }

  return NextResponse.json({ ok: true })
}

// GET para verificação de URL pela Evolution API
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Webhook Evolution API' })
}
