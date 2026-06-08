import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireStaff } from '@/lib/api-auth'

const PROMPT = `Você é um sistema especializado em extrair dados de documentos médicos brasileiros.

Analise esta imagem e extraia as informações em formato JSON. Se um campo não existir no documento, use null.

Retorne APENAS o JSON, sem nenhum texto extra:
{
  "nome_paciente": "nome completo do paciente",
  "nome_medico": "nome completo do médico com título (ex: Dr. João Silva)",
  "crm": "número do CRM com estado (ex: 12345/RJ)",
  "data_consulta": "data da consulta em YYYY-MM-DD",
  "hora_consulta": "hora da consulta em HH:MM",
  "diagnostico": "diagnóstico ou motivo do atestado",
  "data_inicio_afastamento": "início do afastamento em YYYY-MM-DD",
  "data_fim_afastamento": "fim do afastamento em YYYY-MM-DD",
  "dias_afastamento": número inteiro de dias ou null,
  "observacoes": "qualquer outra informação relevante do documento"
}

Se o documento não for um atestado médico (por exemplo, RG, CPF, autorização), retorne:
{ "tipo_detectado": "nome do tipo de documento detectado" }`

export async function POST(request: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    // Pega todas as chaves disponíveis em rotação
    const keys = [
      process.env.GEMINI_API_KEY_VIVA,
      process.env.GEMINI_API_KEY,
      process.env.GOOGLE_AI_KEY,
      process.env.GOOGLE_AI_KEY_2,
      process.env.GOOGLE_AI_KEY_3,
      process.env.GOOGLE_AI_KEY_4,
    ].filter(Boolean) as string[]

    if (!keys.length) {
      return NextResponse.json({ error: 'GOOGLE_AI_KEY não configurada' }, { status: 500 })
    }

    // Converte arquivo para base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    // Tenta cada chave (fallback por quota)
    let lastError: Error | null = null
    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const result = await model.generateContent([
          PROMPT,
          { inlineData: { mimeType, data: base64 } },
        ])

        const text = result.response.text().trim()

        // Extrai só o JSON da resposta
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          return NextResponse.json({ dados: null, raw: text })
        }

        const dados = JSON.parse(jsonMatch[0])
        return NextResponse.json({ dados })
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const isQuota = lastError.message.includes('429') || lastError.message.includes('RESOURCE_EXHAUSTED')
        if (!isQuota) break
      }
    }

    return NextResponse.json(
      { error: lastError?.message ?? 'Erro ao analisar documento' },
      { status: 500 }
    )
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
