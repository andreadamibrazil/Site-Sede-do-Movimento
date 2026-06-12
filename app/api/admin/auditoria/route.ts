import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

const GEMINI_KEYS = [
  process.env.GOOGLE_AI_KEY,
  process.env.GOOGLE_AI_API_KEY_2,
  process.env.GOOGLE_AI_API_KEY_3,
].filter(Boolean)

async function chamarGemini(prompt: string): Promise<string> {
  for (const key of GEMINI_KEYS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    } catch { continue }
  }
  throw new Error('Gemini indisponível')
}

export async function POST() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const sb = createServiceClient()

  // Carrega contexto do negócio
  const { data: contextoRows } = await sb
    .from('config_auditoria')
    .select('secao, conteudo')

  const contexto = (contextoRows ?? [])
    .map((r: any) => `### ${r.secao}\n${r.conteudo}`)
    .join('\n\n')

  // Carrega itens não verificados
  const { data: itens } = await sb
    .from('config_itens')
    .select('id, categoria, valor, label, verificado')
    .eq('ativo', true)

  const naoVerificados = (itens ?? []).filter((i: any) => !i.verificado)
  const todos = itens ?? []

  if (naoVerificados.length === 0 && todos.length === 0) {
    return NextResponse.json({ ok: true, relatorio: 'Nenhum item cadastrado para auditar.', verificados: 0, problemas: [] })
  }

  const listaItens = todos.map((i: any) =>
    `- [${i.verificado ? 'verificado' : 'NÃO VERIFICADO'}] categoria="${i.categoria}" valor="${i.valor}" label="${i.label}"`
  ).join('\n')

  const prompt = `Você é um auditor de sistema para uma escola de dança. Use o contexto abaixo para auditar os itens cadastrados.

## CONTEXTO DO NEGÓCIO
${contexto}

## ITENS CADASTRADOS NO SISTEMA
${listaItens}

## TAREFA
Analise CADA item e retorne um JSON com esta estrutura:
{
  "resumo": "texto geral da auditoria em 2-3 frases",
  "itens": [
    {
      "valor": "valor_do_item",
      "categoria": "categoria_do_item",
      "status": "ok" | "problema" | "revisar",
      "nota": "observação breve",
      "sugestao": "sugestão de correção se houver problema"
    }
  ],
  "problemas_criticos": ["lista de problemas que precisam atenção imediata"],
  "sugestoes_gerais": ["melhorias sugeridas"]
}

Seja objetivo. Foque em: (1) item faz sentido para escola de dança? (2) está na categoria certa? (3) label é claro? (4) há duplicatas ou inconsistências?`

  let resultado: any
  try {
    const raw = await chamarGemini(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    resultado = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Gemini não retornou JSON válido' }, { status: 500 })
  }

  // Marca itens auditados como verificados + salva nota
  for (const item of resultado.itens ?? []) {
    await sb.from('config_itens')
      .update({ verificado: true, gemini_nota: `${item.status}: ${item.nota}` })
      .eq('categoria', item.categoria)
      .eq('valor', item.valor)
  }

  return NextResponse.json({
    ok: true,
    relatorio: resultado,
    total: todos.length,
    verificados: naoVerificados.length,
    problemas: resultado.problemas_criticos ?? [],
  })
}
