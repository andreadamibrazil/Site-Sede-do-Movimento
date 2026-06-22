import { NextRequest, NextResponse } from 'next/server'
import { callGeminiVision } from '@/lib/gemini'
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
    // A análise por visão só lê imagens — PDF não é suportado pelo gpt-4o-mini.
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Envie uma imagem (JPG ou PNG). PDF não é suportado na análise automática.',
      }, { status: 422 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const raw = await callGeminiVision(base64, mimeType, PROMPT)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ dados: null, raw })
    const dados = JSON.parse(jsonMatch[0])
    return NextResponse.json({ dados })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
