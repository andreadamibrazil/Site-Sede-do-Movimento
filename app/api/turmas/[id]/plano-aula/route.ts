import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

const GEMINI_KEYS = [
  'AIzaSyCb3KseTy1xboh1OYypLeI5MRZL0yugTdc',
  process.env.GOOGLE_AI_API_KEY_2,
  process.env.GOOGLE_AI_API_KEY_3,
].filter(Boolean)

async function chamarGemini(texto: string): Promise<{ resumo: string; conteudo: any }> {
  const prompt = `Você é um assistente pedagógico de uma escola de dança.

Analise o plano de aula abaixo e extraia as informações em formato JSON estruturado.

PLANO:
${texto}

Retorne APENAS um JSON válido com esta estrutura (sem markdown, sem explicações):
{
  "resumo": "resumo em 2-3 frases do que o professor vai trabalhar",
  "objetivos": ["objetivo 1", "objetivo 2"],
  "metodologia": "como as aulas serão conduzidas",
  "conteudo_por_mes": [
    { "mes": "Março", "conteudo": ["item 1", "item 2"] },
    { "mes": "Abril", "conteudo": ["item 1"] }
  ],
  "avaliacao": "como o professor vai avaliar o progresso"
}`

  for (const key of GEMINI_KEYS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      return { resumo: parsed.resumo ?? '', conteudo: parsed }
    } catch { continue }
  }
  throw new Error('Gemini indisponível')
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id: turma_id } = await params
  const { texto, data_inicio, data_fim } = await req.json()

  if (!texto?.trim()) return NextResponse.json({ error: 'Texto do plano é obrigatório' }, { status: 400 })

  const { resumo, conteudo } = await chamarGemini(texto)

  const sb = createServiceClient() as any
  const { data, error } = await sb
    .from('planos_aula')
    .upsert({
      turma_id,
      texto_original: texto,
      gemini_resumo: resumo,
      gemini_conteudo: conteudo,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'turma_id' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: data.id, resumo, conteudo })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: turma_id } = await params
  const sb = createServiceClient() as any

  const { data } = await sb
    .from('planos_aula')
    .select('*')
    .eq('turma_id', turma_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ plano: data })
}
