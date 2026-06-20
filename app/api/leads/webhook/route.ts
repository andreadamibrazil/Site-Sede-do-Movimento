import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/leads/webhook
// Recebe leads de fontes externas (Chatwoot, formulários, etc.) e insere/atualiza no CRM.
//
// Como configurar no Chatwoot:
//   Settings → Integrations → Webhooks → New Webhook
//   URL: https://www.sededomovimento.art/api/leads/webhook
//   Eventos: contact_created, contact_updated
//   Header: X-Webhook-Secret: <WEBHOOK_SECRET>

function normalizarCelular(phone: string): string {
  const n = phone.replace(/\D/g, '')
  if (n.length === 13 && n.startsWith('55')) return n.slice(2)               // 55+DDD+9+8 → 11
  if (n.length === 14 && n.startsWith('55')) return n.slice(2, 13)           // 55+12dig → strip 55+last
  if (n.length === 12 && n.startsWith('55')) return n.slice(2, 4) + '9' + n.slice(4) // 55+DDD+8 → add 9
  if (n.length === 12) return n.slice(0, 11)                                 // trailing digit → strip
  if (n.length === 10) return n.slice(0, 2) + '9' + n.slice(2)              // DDD+8 → add 9
  return n
}

function extrairVariavel(variables: Record<string, string>, ...chaves: string[]): string | null {
  for (const chave of chaves) {
    const val = variables?.[chave] || variables?.[chave.toLowerCase()]
    if (val && val.trim()) return val.trim()
  }
  return null
}

export async function POST(req: NextRequest) {
  // Verificação de segurança
  const secret = req.headers.get('x-webhook-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '')
  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret || secret !== webhookSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // Chatwoot/webhook pode enviar subscriber diretamente ou dentro de { subscriber: ... }
  const subscriber = body?.subscriber ?? body

  const phone = subscriber?.phone ?? subscriber?.celular ?? ''
  if (!phone) return NextResponse.json({ error: 'phone obrigatório' }, { status: 400 })

  const celular = normalizarCelular(phone)
  const nome = subscriber?.full_name ?? subscriber?.first_name ?? subscriber?.nome ?? 'Sem nome'
  const variables: Record<string, string> = subscriber?.variables ?? {}
  const tags: string[] = subscriber?.tags ?? []

  // Mapeia campos do webhook → campos do lead
  const modalidade = extrairVariavel(variables, 'Modalidade', 'modalidade', 'ModalidadeInteresse')
  const comoConheceu = extrairVariavel(variables, 'ComoConheceu', 'como_conheceu', 'ComoNosConheceu')
  const horario = extrairVariavel(variables, 'Horario', 'horario', 'HorarioPreferido')

  // Monta observacoes com variáveis do webhook (para o CRM)
  const obs = Object.keys(variables).length > 0
    ? JSON.stringify({ chatwoot: variables, tags })
    : null

  const sb = createServiceClient()

  // Upsert por celular — atualiza se já existe, cria se não existe
  const { data: existente } = await sb
    .from('leads')
    .select('id, status, nome')
    .eq('celular', celular)
    .maybeSingle()

  if (existente) {
    // Faz merge de observacoes para não apagar análise Gemini existente
    const { data: leadAtual } = await sb.from('leads').select('observacoes').eq('id', existente.id).maybeSingle()
    let obsAtual: Record<string, any> = {}
    try {
      const raw = (leadAtual as any)?.observacoes
      if (typeof raw === 'string') obsAtual = JSON.parse(raw)
      else if (raw && typeof raw === 'object') obsAtual = raw
    } catch {}
    const obsAtualizado = obs
      ? JSON.stringify({ ...obsAtual, chatwoot: variables, tags })
      : (Object.keys(obsAtual).length > 0 ? JSON.stringify(obsAtual) : null)

    // Atualiza dados sem sobrescrever status se já progrediu
    const { error: updateErr } = await sb.from('leads').update({
      nome: nome !== 'Sem nome' ? nome : existente.nome,
      modalidade_interesse: modalidade,
      como_conheceu: comoConheceu,
      horario_preferido: horario,
      observacoes: obsAtualizado,
      updated_at: new Date().toISOString(),
    }).eq('id', existente.id)

    if (updateErr) { console.error('[leads/webhook] update:', updateErr); return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 }) }
    return NextResponse.json({ ok: true, action: 'updated', lead_id: existente.id })
  }

  // Cria novo lead
  const { data: novoLead, error } = await sb
    .from('leads')
    .insert({
      nome,
      celular,
      modalidade_interesse: modalidade,
      como_conheceu: comoConheceu,
      horario_preferido: horario,
      origem: 'chatwoot',
      status: 'novo',
      observacoes: obs,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, action: 'created', lead_id: novoLead.id })
}

// GET para verificação de URL do webhook
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Leads Webhook' })
}
