import { createServiceClient } from '@/lib/supabase/server'
import { readBlobData, markAnalyzed } from '@/lib/azure-blob'
import { callGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

// Roda 2x por dia: 12:00 e 00:00 via cron Azure VM
// GET https://www.sededomovimento.art/api/cron/analisar-conversas
// Header: Authorization: Bearer {CRON_SECRET}
//
// Lógica incremental:
//  - Lê apenas mensagens NOVAS desde ultima_analise_idx no Azure Blob
//  - Acumula histórico de análises em leads.observacoes.historico_analises
//  - markAnalyzed() avança o ponteiro no blob após cada análise

const MAX_POR_EXECUCAO = 10
const MATURIDADE_HORAS = 24        // só analisa conversas com 24h+ (tempo de acumular conteúdo)
const REANALISAR_APOS_DIAS = 7     // re-verifica a cada 7 dias se chegaram novas mensagens
const MAX_HISTORICO = 20           // máximo de entradas no histórico por lead

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

async function geminiAnalyze(
  textoNovas: string,
  analiseAnterior: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  const contexto = analiseAnterior
    ? `\n\nCONTEXTO DA ANÁLISE ANTERIOR (não repita, apenas evolua):
Temperatura anterior: ${analiseAnterior.temperatura ?? 'desconhecida'}
Resumo anterior: ${analiseAnterior.resumo ?? 'sem resumo'}`
    : ''

  const prompt = `Você é especialista em análise de conversas da escola de dança Sede do Movimento.

Analise estas NOVAS mensagens de WhatsApp desde a última análise.${contexto}

NOVAS MENSAGENS:
${textoNovas}

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "temperatura": "quente|morno|frio",
  "demanda": "o que a pessoa procurava (máx 100 chars)",
  "objecoes": ["preço", "horário", "localização", "modalidade"],
  "oportunidade": "primeira_matricula|ex_aluno_retorno|segundo_filho|informacao|outro",
  "acao_sugerida": "próxima ação recomendada (máx 80 chars)",
  "resumo": "o que aconteceu nestas mensagens (máx 200 chars)",
  "mudanca": "como evoluiu em relação ao histórico anterior, ou null se primeira análise"
}

- temperatura=quente: quer matricular, interesse claro
- temperatura=morno: curioso, pediu info mas não confirmou
- temperatura=frio: sem resposta, cancelou, só curiosidade`

  try {
    const text = await callGemini(prompt, { temperature: 0.1, maxOutputTokens: 512 })
    const j0 = text.indexOf('{')
    const j1 = text.lastIndexOf('}')
    if (j0 === -1 || j1 === -1) return null
    return JSON.parse(text.slice(j0, j1 + 1))
  } catch (e) {
    console.error('[analisar-conversas] Gemini falhou:', e)
    return null
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createServiceClient()
  const agora = new Date()
  const agoraISO = agora.toISOString()
  const maturidade = new Date(agora.getTime() - MATURIDADE_HORAS * 3600_000).toISOString()
  const reanalisarDesde = new Date(agora.getTime() - REANALISAR_APOS_DIAS * 86_400_000).toISOString()

  // Fila primária: nunca analisadas + maduras (≥24h)
  const { data: primarias, error: err1 } = await sb
    .from('conversas')
    .select('id, celular, source, blob_path, variables, analisado_em')
    .is('analisado_em', null)
    .lt('created_at', maturidade)
    .order('created_at', { ascending: false })
    .limit(Math.ceil(MAX_POR_EXECUCAO * 0.7))

  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })

  // Fila de re-análise: já analisadas há mais de 7 dias (verifica se chegaram novas mensagens)
  const slotsRestantes = MAX_POR_EXECUCAO - (primarias?.length ?? 0)
  const { data: reanalisar } = slotsRestantes > 0
    ? await sb
        .from('conversas')
        .select('id, celular, source, blob_path, variables, analisado_em')
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
  let semNovas = 0
  let erros = 0

  for (const conversa of conversas) {
    const celular = conversa.celular as string
    const cvars = conversa.variables as Record<string, unknown> | null
    const instance = (cvars?.instance as string) ?? 'sede-movimento'

    // Lê blob — pega apenas mensagens NOVAS desde ultima_analise_idx
    let blobData = { messages: [] as unknown[], ultima_analise_idx: 0 }
    try {
      blobData = await readBlobData(instance, celular)
    } catch { /* sem blob — continua com vazio */ }

    const novasMensagens = blobData.messages.slice(blobData.ultima_analise_idx)

    if (novasMensagens.length === 0) {
      // Nenhuma mensagem nova — só avança o analisado_em para voltar ao fim da fila
      await sb.from('conversas').update({ analisado_em: agoraISO }).eq('id', conversa.id)
      semNovas++
      continue
    }

    // Busca análise anterior para dar contexto ao Gemini (via celular — lead_id não existe em conversas)
    let analiseAnterior: Record<string, unknown> | null = null
    if (celular) {
      const { data: leadAtual } = await sb
        .from('leads')
        .select('observacoes')
        .eq('celular', celular)
        .not('observacoes', 'is', null)
        .maybeSingle()
      try {
        if (leadAtual?.observacoes) analiseAnterior = JSON.parse(leadAtual.observacoes)
      } catch { /* ignora */ }
    }

    const texto = formatarConversa(novasMensagens)
    const analise = await geminiAnalyze(texto, analiseAnterior)

    if (!analise) {
      erros++
      continue
    }

    // Entrada que vai para o histórico
    const entradaHistorico = {
      data: agoraISO,
      temperatura: analise.temperatura,
      resumo: analise.resumo ?? '',
      mudanca: analise.mudanca ?? null,
      mensagens_analisadas: novasMensagens.length,
    }

    // analise não é null aqui (verificado acima com continue)
    const analiseSegura = analise as Record<string, unknown>

    // Normaliza temperatura do Gemini (quente/morno/frio) para os valores da coluna SQL (quente/morna/fria)
    const TEMP_MAP: Record<string, string> = { quente: 'quente', morno: 'morna', frio: 'fria' }
    const temperaturaColuna = TEMP_MAP[String(analiseSegura.temperatura ?? '')] ?? null

    // Atualiza leads.observacoes — sobrescreve campos de IA, preserva manuais, acumula histórico
    async function atualizarLead(id: string) {
      const { data: lead } = await sb
        .from('leads')
        .select('observacoes')
        .eq('id', id)
        .maybeSingle()

      let obs: Record<string, unknown> = {}
      try { if (lead?.observacoes) obs = JSON.parse(lead.observacoes) } catch { /* ignora */ }

      const historico = Array.isArray(obs.historico_analises) ? obs.historico_analises as unknown[] : []
      historico.push(entradaHistorico)

      // Salva temperatura no JSON (backward compatibility) e na coluna SQL (permite filtros no banco)
      await (sb.from('leads') as any).update({
        observacoes: JSON.stringify({
          ...obs,
          temperatura: analiseSegura.temperatura,
          demanda: analiseSegura.demanda,
          objecoes: analiseSegura.objecoes,
          oportunidade: analiseSegura.oportunidade,
          acao_sugerida: analiseSegura.acao_sugerida,
          resumo: analiseSegura.resumo,
          ultima_analise: agoraISO,
          historico_analises: historico.slice(-MAX_HISTORICO),
        }),
        temperatura: temperaturaColuna,
        updated_at: agoraISO,
      }).eq('id', id)
    }

    // Vincula pelo celular (lead_id não existe em conversas)
    const { data: lead } = await sb
      .from('leads')
      .select('id')
      .eq('celular', celular)
      .maybeSingle()

    if (lead) {
      await atualizarLead(lead.id)
    }

    // Avança o ponteiro no blob e marca conversa como analisada
    try { await markAnalyzed(instance, celular, blobData.messages.length) } catch { /* ignora */ }
    await sb.from('conversas').update({ analisado_em: agoraISO }).eq('id', conversa.id)

    analisadas++
  }

  return NextResponse.json({
    ok: true,
    analisadas,
    sem_novas: semNovas,
    erros,
    primarias: primarias?.length ?? 0,
    reanalisadas: reanalisar?.length ?? 0,
    executado_em: agoraISO,
  })
}
