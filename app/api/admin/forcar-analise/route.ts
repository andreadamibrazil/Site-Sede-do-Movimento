import { createServiceClient } from '@/lib/supabase/server'
import { readBlobData, markAnalyzed } from '@/lib/azure-blob'
import { callGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/forcar-analise
// Força a re-análise de leads que têm conversa no WhatsApp mas nunca receberam análise IA.
// Isso acontece quando o cron analisou a conversa mas não encontrou o lead pelo celular
// (ex: bug do dígito extra que foi corrigido).
//
// Autenticação: Authorization: Bearer {CRON_SECRET}
// Parâmetros: ?limit=20 (default 20, máx 50 por execução)

const MAX_POR_EXECUCAO = 20

function formatarConversa(messages: unknown[]): string {
  if (!Array.isArray(messages) || messages.length === 0) return '(sem mensagens)'
  return messages
    .slice(-150)
    .map((m: unknown) => {
      const msg = m as Record<string, unknown>
      const who = msg.fromMe ? 'Escola' : 'Cliente'
      const text = (msg.text as string) ?? `[${(msg.type as string) ?? 'media'}]`
      const ts = msg.timestamp
        ? new Date((msg.timestamp as number) * 1000).toLocaleDateString('pt-BR')
        : ''
      return `${who}${ts ? ` (${ts})` : ''}: ${text}`
    })
    .join('\n')
}

async function geminiAnalyze(texto: string): Promise<Record<string, unknown> | null> {
  const prompt = `Você é especialista em análise de conversas da escola de dança Sede do Movimento.

Analise estas mensagens de WhatsApp e retorne APENAS um JSON válido (sem markdown):
{
  "temperatura": "quente|morno|frio",
  "demanda": "o que a pessoa procurava (máx 100 chars)",
  "objecoes": ["preço", "horário", "localização", "modalidade"],
  "oportunidade": "primeira_matricula|ex_aluno_retorno|segundo_filho|informacao|outro",
  "acao_sugerida": "próxima ação recomendada (máx 80 chars)",
  "resumo": "o que aconteceu nestas mensagens (máx 200 chars)",
  "mudanca": null
}

- temperatura=quente: quer matricular, interesse claro
- temperatura=morno: curioso, pediu info mas não confirmou
- temperatura=frio: sem resposta, cancelou, só curiosidade

MENSAGENS:
${texto}`

  try {
    const text = await callGemini(prompt, { temperature: 0.1, maxOutputTokens: 512 })
    const j0 = text.indexOf('{')
    const j1 = text.lastIndexOf('}')
    if (j0 === -1 || j1 === -1) return null
    return JSON.parse(text.slice(j0, j1 + 1))
  } catch (e) {
    console.error('[forcar-analise] Gemini falhou:', e)
    return null
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const limitParam = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')
  const limit = Math.min(Math.max(1, limitParam), MAX_POR_EXECUCAO)

  const sb = createServiceClient()
  const agora = new Date().toISOString()

  // Busca leads sem análise que têm conversa no WhatsApp
  const { data: candidatos, error } = await sb
    .from('leads')
    .select('id, celular, observacoes')
    .or('observacoes.is.null,observacoes.not.like.%temperatura%')
    .not('celular', 'is', null)
    .neq('celular', '')
    .limit(limit * 3) // busca mais para filtrar os que têm conversa

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtra apenas os que têm conversa no supabase
  const celulares = (candidatos ?? []).map(l => l.celular).filter(Boolean)
  if (!celulares.length) {
    return NextResponse.json({ ok: true, analisados: 0, mensagem: 'nenhum candidato encontrado' })
  }

  const { data: conversas } = await sb
    .from('conversas')
    .select('id, celular, variables, analisado_em')
    .in('celular', celulares)
    .order('created_at', { ascending: false })

  // Mapeia celular → conversa (pega a mais recente por celular)
  const conversaPorCelular = new Map<string, { id: string; celular: string; variables: unknown; analisado_em: string | null }>()
  for (const c of conversas ?? []) {
    if (!conversaPorCelular.has(c.celular)) {
      conversaPorCelular.set(c.celular, c as any)
    }
  }

  // Processa até `limit` leads
  let analisados = 0
  let semMensagens = 0
  let erros = 0
  const detalhes: string[] = []

  for (const lead of candidatos ?? []) {
    if (analisados >= limit) break

    const conversa = conversaPorCelular.get(lead.celular)
    if (!conversa) continue // sem conversa — pula

    const cvars = conversa.variables as Record<string, unknown> | null
    const instance = (cvars?.instance as string) ?? 'sede-movimento'

    // Lê TODAS as mensagens do blob (ignora ultima_analise_idx)
    let blobData = { messages: [] as unknown[], ultima_analise_idx: 0 }
    try {
      blobData = await readBlobData(instance, lead.celular)
    } catch { /* blob vazio é ok */ }

    if (blobData.messages.length === 0) {
      semMensagens++
      continue
    }

    const texto = formatarConversa(blobData.messages)
    const analise = await geminiAnalyze(texto)

    if (!analise) {
      erros++
      continue
    }

    // Preserva campos manuais (notas, etc.) e sobrescreve campos de IA
    let obs: Record<string, unknown> = {}
    try {
      if (lead.observacoes) obs = JSON.parse(lead.observacoes as string)
    } catch { /* ignora */ }

    const historico = Array.isArray(obs.historico_analises) ? obs.historico_analises as unknown[] : []
    historico.push({
      data: agora,
      temperatura: analise.temperatura,
      resumo: analise.resumo ?? '',
      mudanca: null,
      mensagens_analisadas: blobData.messages.length,
      origem: 'forcar-analise',
    })

    await sb.from('leads').update({
      observacoes: JSON.stringify({
        ...obs,
        temperatura: analise.temperatura,
        demanda: analise.demanda,
        objecoes: analise.objecoes,
        oportunidade: analise.oportunidade,
        acao_sugerida: analise.acao_sugerida,
        resumo: analise.resumo,
        ultima_analise: agora,
        historico_analises: historico.slice(-20),
      }),
      updated_at: agora,
    }).eq('id', lead.id)

    // Avança o ponteiro no blob e marca conversa como analisada
    try { await markAnalyzed(instance, lead.celular, blobData.messages.length) } catch { /* ignora */ }
    await sb.from('conversas').update({ analisado_em: agora }).eq('id', conversa.id)

    detalhes.push(`${lead.celular}: ${analise.temperatura}`)
    analisados++
  }

  return NextResponse.json({
    ok: true,
    analisados,
    sem_mensagens_no_blob: semMensagens,
    erros,
    detalhes,
    executado_em: agora,
  })
}
