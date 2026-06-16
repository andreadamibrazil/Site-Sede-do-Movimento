'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { callGemini } from '@/lib/gemini'
import { readBlobData, markAnalyzed } from '@/lib/azure-blob'

export async function atualizarLead(
  id: string,
  dados: {
    nome?: string
    celular?: string
    email?: string
    modalidade_interesse?: string
    como_conheceu?: string
    status?: string
    horario_preferido?: string
    dia_experimental?: string
  }
) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('leads').update(dados as any).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${id}`)
  revalidatePath('/painel/leads')
}

export async function adicionarNota(leadId: string, texto: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('lead_notas')
    .insert({ lead_id: leadId, texto })
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${leadId}`)
}

export async function removerNota(leadId: string, notaId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('lead_notas')
    .delete()
    .eq('id', notaId)
    .eq('lead_id', leadId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${leadId}`)
}

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

export async function analisarLeadAgora(leadId: string): Promise<{ ok: boolean; temperatura?: string; erro?: string }> {
  const supabase = createServiceClient()
  const agora = new Date().toISOString()

  const { data: lead } = await supabase
    .from('leads')
    .select('id, celular, observacoes')
    .eq('id', leadId)
    .single()

  if (!lead) return { ok: false, erro: 'Lead não encontrado' }
  if (!lead.celular) return { ok: false, erro: 'Lead sem celular cadastrado' }

  const { data: conversa } = await supabase
    .from('conversas')
    .select('id, celular, variables')
    .eq('celular', lead.celular)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const cvars = (conversa?.variables as Record<string, unknown> | null)
  const instance = (cvars?.instance as string) ?? 'sede-movimento'

  let blobData = { messages: [] as unknown[], ultima_analise_idx: 0 }
  try {
    blobData = await readBlobData(instance, lead.celular)
  } catch { /* blob vazio é ok */ }

  if (blobData.messages.length === 0) {
    return { ok: false, erro: 'Nenhuma mensagem de WhatsApp encontrada para este lead' }
  }

  const texto = formatarConversa(blobData.messages)

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

  let analise: Record<string, unknown>
  try {
    const text = await callGemini(prompt, { temperature: 0.1, maxOutputTokens: 512 })
    const j0 = text.indexOf('{')
    const j1 = text.lastIndexOf('}')
    if (j0 === -1 || j1 === -1) return { ok: false, erro: 'Gemini retornou formato inválido' }
    analise = JSON.parse(text.slice(j0, j1 + 1))
  } catch (e) {
    return { ok: false, erro: `Gemini falhou: ${String(e)}` }
  }

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
    origem: 'manual',
  })

  const { error } = await supabase.from('leads').update({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  } as any).eq('id', leadId)

  if (error) return { ok: false, erro: error.message }

  try { await markAnalyzed(instance, lead.celular, blobData.messages.length) } catch { /* ignora */ }
  if (conversa) {
    await supabase.from('conversas').update({ analisado_em: agora }).eq('id', conversa.id)
  }

  revalidatePath(`/painel/leads/${leadId}`)
  revalidatePath('/painel/leads')
  return { ok: true, temperatura: analise.temperatura as string }
}
