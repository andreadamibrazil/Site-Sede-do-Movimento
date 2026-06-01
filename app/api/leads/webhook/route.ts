import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/leads/webhook
// Chamado pelo BotConversa quando um novo contato entra ou é atualizado.
//
// Como configurar no BotConversa:
//   Configurações → Integrações → Webhooks → Novo Webhook
//   URL: https://sededomovimento.art/api/leads/webhook
//   Evento: Novo assinante / Assinante atualizado
//   Header: X-Webhook-Secret: <WEBHOOK_SECRET>

function normalizarCelular(phone: string): string {
  const n = phone.replace(/\D/g, '')
  // Remove código do país se presente (55 + DDD + número)
  if (n.startsWith('55') && n.length >= 12) return n.slice(2)
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

  // BotConversa pode enviar subscriber diretamente ou dentro de { subscriber: ... }
  const subscriber = body?.subscriber ?? body

  const phone = subscriber?.phone ?? subscriber?.celular ?? ''
  if (!phone) return NextResponse.json({ error: 'phone obrigatório' }, { status: 400 })

  const celular = normalizarCelular(phone)
  const nome = subscriber?.full_name ?? subscriber?.first_name ?? subscriber?.nome ?? 'Sem nome'
  const variables: Record<string, string> = subscriber?.variables ?? {}
  const tags: string[] = subscriber?.tags ?? []

  // Mapeia campos BotConversa → campos do lead
  const modalidade = extrairVariavel(variables, 'Modalidade', 'modalidade', 'ModalidadeInteresse')
  const comoConheceu = extrairVariavel(variables, 'ComoConheceu', 'como_conheceu', 'ComoNosConheceu')
  const horario = extrairVariavel(variables, 'Horario', 'horario', 'HorarioPreferido')

  // Monta observacoes com variáveis do BotConversa (para o CRM)
  const obs = Object.keys(variables).length > 0
    ? JSON.stringify({ botconversa: variables, tags })
    : null

  const sb = createServiceClient() as any

  // Upsert por celular — atualiza se já existe, cria se não existe
  const { data: existente } = await sb
    .from('leads')
    .select('id, status')
    .eq('celular', celular)
    .maybeSingle()

  if (existente) {
    // Atualiza dados sem sobrescrever status se já progrediu
    const { error: updateErr } = await sb.from('leads').update({
      nome: nome !== 'Sem nome' ? nome : existente.nome,
      modalidade_interesse: modalidade,
      como_conheceu: comoConheceu,
      horario_preferido: horario,
      observacoes: obs,
      updated_at: new Date().toISOString(),
    }).eq('id', existente.id)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
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
      origem: 'botconversa',
      status: 'novo',
      observacoes: obs,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, action: 'created', lead_id: novoLead.id })
}

// GET para verificação de URL pelo BotConversa
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Sede do Movimento — Leads Webhook' })
}
