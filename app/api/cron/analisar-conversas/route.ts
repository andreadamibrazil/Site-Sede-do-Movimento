import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Roda 2x por dia: 12:00 e 00:00 via cron Azure VM
// Chama: GET https://sededomovimento.art/api/cron/analisar-conversas
// Header: Authorization: Bearer {CRON_SECRET}
//
// Fluxo: busca conversas não analisadas → Gemini Flash → atualiza leads.observacoes

// Todas as chaves disponíveis em rotação — free tier reseta diariamente
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_VIVA ?? '',   // Vivá (formato AQ.)
  process.env.GEMINI_API_KEY ?? '',         // Carlos ou André principal
  process.env.GOOGLE_AI_KEY ?? '',          // André principal (GOOGLE_AI_KEY)
  process.env.GOOGLE_AI_KEY_2 ?? '',
  process.env.GOOGLE_AI_KEY_3 ?? '',
  process.env.GOOGLE_AI_KEY_4 ?? '',
].filter(Boolean)

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// Limite por execução para não bater rate limit do free tier
const MAX_POR_EXECUCAO = 30

async function geminiAnalyze(conversaText: string): Promise<Record<string, any> | null> {
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

  let lastErr: string | null = null

  for (const key of GEMINI_KEYS) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      })

      if (res.status === 429 || res.status === 401 || res.status === 403) {
        lastErr = `HTTP ${res.status}`
        continue
      }

      if (!res.ok) {
        lastErr = `HTTP ${res.status}`
        continue
      }

      const data = await res.json()
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      // Extrai JSON da resposta
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1) { lastErr = 'no json in response'; continue }

      return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    } catch (e: any) {
      lastErr = e?.message ?? 'unknown error'
      continue
    }
  }

  console.error('[analisar-conversas] Gemini falhou:', lastErr)
  return null
}

function formatarConversa(messages: any[]): string {
  if (!Array.isArray(messages) || messages.length === 0) return '(sem mensagens)'

  return messages
    .slice(-50) // últimas 50 mensagens para não exceder contexto
    .map((m: any) => {
      const who = m.fromMe ? 'Escola' : 'Cliente'
      const text = m.text ?? `[${m.type ?? 'media'}]`
      const ts = m.timestamp ? new Date(m.timestamp * 1000).toLocaleDateString('pt-BR') : ''
      return `${who}${ts ? ` (${ts})` : ''}: ${text}`
    })
    .join('\n')
}

export async function GET(req: NextRequest) {
  // Auth via CRON_SECRET
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (GEMINI_KEYS.length === 0) {
    return NextResponse.json({ error: 'nenhuma chave Gemini configurada' }, { status: 500 })
  }

  const sb = createServiceClient() as any

  // Busca conversas não analisadas, ordenadas pela mais recente
  const { data: conversas, error } = await sb
    .from('conversas')
    .select('id, celular, lead_id, source, messages, variables, tags')
    .is('analisado_em', null)
    .order('created_at', { ascending: false })
    .limit(MAX_POR_EXECUCAO)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!conversas || conversas.length === 0) {
    return NextResponse.json({ ok: true, analisadas: 0, mensagem: 'nada pendente' })
  }

  let analisadas = 0
  let erros = 0
  const agora = new Date().toISOString()

  for (const conversa of conversas) {
    const texto = formatarConversa(conversa.messages)
    const analise = await geminiAnalyze(texto)

    if (!analise) {
      erros++
      continue
    }

    // Monta objeto de inteligência para salvar em leads.observacoes
    const inteligencia = {
      ...analise,
      ultima_analise: agora,
      source: conversa.source,
    }

    // Marca conversa como analisada
    await sb.from('conversas')
      .update({ analisado_em: agora })
      .eq('id', conversa.id)

    // Atualiza leads.observacoes se tiver lead vinculado
    if (conversa.lead_id) {
      const { data: lead } = await sb
        .from('leads')
        .select('observacoes')
        .eq('id', conversa.lead_id)
        .maybeSingle()

      // Mescla com observacoes existentes (preserva dados anteriores)
      let obsExistente: Record<string, any> = {}
      try {
        if (lead?.observacoes) obsExistente = JSON.parse(lead.observacoes)
      } catch { /* observacoes não é JSON — ignora */ }

      const obsAtualizada = JSON.stringify({ ...obsExistente, ...inteligencia })

      await sb.from('leads')
        .update({ observacoes: obsAtualizada, updated_at: agora })
        .eq('id', conversa.lead_id)
    } else {
      // Tenta vincular ao lead pelo celular
      const { data: lead } = await sb
        .from('leads')
        .select('id, observacoes')
        .eq('celular', conversa.celular)
        .maybeSingle()

      if (lead) {
        // Vincula conversa ao lead
        await sb.from('conversas').update({ lead_id: lead.id }).eq('id', conversa.id)

        let obsExistente: Record<string, any> = {}
        try {
          if (lead.observacoes) obsExistente = JSON.parse(lead.observacoes)
        } catch { /* ignora */ }

        await sb.from('leads')
          .update({
            observacoes: JSON.stringify({ ...obsExistente, ...inteligencia }),
            updated_at: agora,
          })
          .eq('id', lead.id)
      }
    }

    analisadas++
  }

  return NextResponse.json({
    ok: true,
    analisadas,
    erros,
    total_pendentes: conversas.length,
    executado_em: agora,
  })
}
