import { createServiceClient } from '@/lib/supabase/server'
import { readBlobData } from '@/lib/azure-blob'
import { callGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

// Roda 2x por dia: 12:00 e 00:00 via cron Azure VM
// GET https://sededomovimento.art/api/cron/analisar-conversas
// Header: Authorization: Bearer {CRON_SECRET}

// Limite por execução para não bater rate limit do free tier
const MAX_POR_EXECUCAO = 30

// Só analisa conversas com ao menos 24h (tempo de acumular conteúdo)
const MATURIDADE_HORAS = 24

// Re-analisa conversas já analisadas a mais de N dias (atualiza perfil com histórico crescente)
const REANALISAR_APOS_DIAS = 7

async function geminiAnalyze(conversaText: string): Promise<Record<string, unknown> | null> {
  const prompt = `Você é especialista em análise de conversas de uma escola de dança chamada Sede do Movimento.

Analise esta conversa de WhatsApp/chatbot e extraia informações estruturadas sobre o contato.

CONVERSA:
${conversaText}

Retorne APENAS um JSON válido (sem markdown, sem explicações) com esta estrutura exata:
{
  "temperatura": "quente|morno|frio",
  "demanda": "o que a pessoa procurava (texto livre, máx 100 chars)",
  "objecoes": ["preço", "horário", "localização", "modalidade"],
  "oportunidade": "primeira_matricula|ex_aluno_retorno|segundo_filho|informacao|outro",
  "acao_sugerida": "ação concreta recomendada (máx 80 chars)",
  "resumo": "parágrafo resumindo o histórico (máx 300 chars)"
}

Regras:
- temperatura=quente: interesse claro, quer matricular
- temperatura=morno: curioso, pediu info mas não confirmou
- temperatura=frio: sem resposta, cancelou, só curiosidade
- objecoes: lista apenas objeções mencionadas explicitamente
- Se não há informação suficiente, use valores conservadores (frio, oportunidade=informacao)`

  try {
    const text = await callGemini(prompt, { temperature: 0.1, maxOutputTokens: 512 })
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) return null
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
  } catch (e) {
    console.error('[analisar-conversas] Gemini falhou:', e)
    return null
  }
}

function formatarConversa(messages: unknown[]): string {
  if (!Array.isArray(messages) || messages.length === 0) return '(sem mensagens)'

  return messages
    .slice(-50)
    .map((m: unknown) => {
      const msg = m as Record<string, unknown>
      const who = msg.fromMe ? 'Escola' : 'Cliente'
      const text = (msg.text as string) ?? `[${(msg.type as string) ?? 'media'}]`
      const ts = msg.timestamp ? new Date((msg.timestamp as number) * 1000).toLocaleDateString('pt-BR') : ''
      return `${who}${ts ? ` (${ts})` : ''}: ${text}`
    })
    .join('\n')
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient() as ReturnType<typeof createServiceClient> & {
    from: (table: string) => unknown
  }

  const agora = new Date()
  const maturidade = new Date(agora.getTime() - MATURIDADE_HORAS * 60 * 60 * 1000).toISOString()
  const reanalisarDesde = new Date(agora.getTime() - REANALISAR_APOS_DIAS * 24 * 60 * 60 * 1000).toISOString()

  // Fila primária: não analisadas + maduras (≥24h)
  const { data: primarias, error: err1 } = await (sb as unknown as ReturnType<typeof createServiceClient>)
    .from('conversas')
    .select('id, celular, lead_id, source, messages, blob_path, variables, tags, analisado_em')
    .is('analisado_em', null)
    .lt('created_at', maturidade)
    .order('created_at', { ascending: false })
    .limit(Math.ceil(MAX_POR_EXECUCAO * 0.7))

  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })

  // Fila de re-análise: já analisadas mas há mais de 7 dias (perfil desatualizado)
  const slotsRestantes = MAX_POR_EXECUCAO - (primarias?.length ?? 0)
  const { data: reanalisar } = slotsRestantes > 0
    ? await (sb as unknown as ReturnType<typeof createServiceClient>)
        .from('conversas')
        .select('id, celular, lead_id, source, messages, blob_path, variables, tags, analisado_em')
        .not('analisado_em', 'is', null)
        .lt('analisado_em', reanalisarDesde)
        .order('analisado_em', { ascending: true })
        .limit(slotsRestantes)
    : { data: [] }

  const conversas = [...(primarias ?? []), ...(reanalisar ?? [])]

  if (conversas.length === 0) {
    return NextResponse.json({ ok: true, analisadas: 0, mensagem: 'nada pendente' })
  }

  let analisadas = 0
  let erros = 0
  const agoraISO = agora.toISOString()

  for (const conversa of conversas) {
    // Lê mensagens do Azure Blob se o campo messages estiver vazio
    let messages = (conversa as Record<string, unknown>).messages as unknown[]
    if ((!messages || messages.length === 0) && (conversa as Record<string, unknown>).blob_path) {
      try {
        const cvars = (conversa as Record<string, unknown>).variables as Record<string, unknown> | null
        const instance = (cvars?.instance as string) ?? 'sede-movimento'
        const blobData = await readBlobData(instance, (conversa as Record<string, unknown>).celular as string)
        messages = blobData.messages
      } catch { /* sem blob — tenta com mensagens vazias */ }
    }

    const texto = formatarConversa(messages ?? [])
    const analise = await geminiAnalyze(texto)

    if (!analise) {
      erros++
      continue
    }

    const inteligencia = {
      ...analise,
      ultima_analise: agoraISO,
      source: (conversa as Record<string, unknown>).source,
    }

    // Atualiza analisado_em na conversa (redefine o clock da re-análise)
    await (sb as unknown as ReturnType<typeof createServiceClient>)
      .from('conversas')
      .update({ analisado_em: agoraISO })
      .eq('id', (conversa as Record<string, unknown>).id)

    // Atualiza leads.observacoes: AI fields sobrescritos, campos manuais preservados
    const leadId = (conversa as Record<string, unknown>).lead_id as string | null
    const celular = (conversa as Record<string, unknown>).celular as string

    async function atualizarLead(id: string) {
      const { data: lead } = await (sb as unknown as ReturnType<typeof createServiceClient>)
        .from('leads')
        .select('observacoes')
        .eq('id', id)
        .maybeSingle()

      let obsExistente: Record<string, unknown> = {}
      try { if (lead?.observacoes) obsExistente = JSON.parse(lead.observacoes) } catch { /* ignora */ }

      await (sb as unknown as ReturnType<typeof createServiceClient>)
        .from('leads')
        .update({
          observacoes: JSON.stringify({ ...obsExistente, ...inteligencia }),
          updated_at: agoraISO,
        })
        .eq('id', id)
    }

    if (leadId) {
      await atualizarLead(leadId)
    } else {
      // Tenta vincular pelo celular
      const { data: lead } = await (sb as unknown as ReturnType<typeof createServiceClient>)
        .from('leads')
        .select('id')
        .eq('celular', celular)
        .maybeSingle()

      if (lead) {
        await (sb as unknown as ReturnType<typeof createServiceClient>)
          .from('conversas')
          .update({ lead_id: lead.id })
          .eq('id', (conversa as Record<string, unknown>).id)
        await atualizarLead(lead.id)
      }
    }

    analisadas++
  }

  return NextResponse.json({
    ok: true,
    analisadas,
    erros,
    primarias: primarias?.length ?? 0,
    reanalisadas: reanalisar?.length ?? 0,
    executado_em: agoraISO,
  })
}
