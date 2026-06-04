import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'atestados'
const MAX_MB = 10

// Rotação de chaves free tier — nunca usa chave paga
function getGeminiKeys(): string[] {
  const keys: string[] = []
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY)
  if (process.env.GOOGLE_AI_KEY_2) keys.push(process.env.GOOGLE_AI_KEY_2)
  if (process.env.GOOGLE_AI_KEY_3) keys.push(process.env.GOOGLE_AI_KEY_3)
  return keys.filter(Boolean)
}

const ERRO_LIMITE = 'No momento o sistema não consegue receber o atestado. Entre em contato com a secretaria.'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const aulaId = form.get('aulaId') as string | null

  if (!file || !aulaId) {
    return NextResponse.json({ error: 'file e aulaId obrigatórios' }, { status: 400 })
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Arquivo muito grande (máx ${MAX_MB}MB)` }, { status: 413 })
  }

  const bytes = await file.arrayBuffer()

  // --- Análise Gemini Flash (free tier, com rotação de chaves) ---
  const analise = await analisarAtestado(Buffer.from(bytes), file.type)

  if (analise.limiteAtingido) {
    return NextResponse.json({ error: ERRO_LIMITE, legivel: false }, { status: 503 })
  }
  if (!analise.legivel) {
    return NextResponse.json({
      error: analise.motivo_rejeicao ?? 'Atestado ilegível. Tire uma foto nítida com boa iluminação.',
      legivel: false,
    }, { status: 422 })
  }
  if (!analise.eh_atestado) {
    return NextResponse.json({
      error: analise.motivo_rejeicao ?? 'O documento não parece ser um atestado médico válido.',
      legivel: false,
    }, { status: 422 })
  }

  // --- Upload para Supabase Storage ---
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${aulaId}/${user.id}_${Date.now()}.${ext}`
  const sb = createServiceClient()

  const { data: buckets } = await sb.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await sb.storage.createBucket(BUCKET, { public: false })
  }

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl, legivel: true, dados: analise.dados })
}

// --- Tipos ---

type Analise = {
  legivel: boolean
  eh_atestado: boolean
  limiteAtingido?: boolean
  dados: {
    nome_paciente?: string | null
    data_atestado?: string | null
    dias_afastamento?: string | null
    nome_medico?: string | null
    crm?: string | null
  }
  motivo_rejeicao?: string | null
}

// --- Lógica Gemini com rotação de chaves ---

async function analisarAtestado(buf: Buffer, mimeType: string): Promise<Analise> {
  const keys = getGeminiKeys()
  if (!keys.length) return { legivel: false, eh_atestado: false, limiteAtingido: true, dados: {} }

  const base64 = buf.toString('base64')
  const prompt = `Analise este documento médico.

Responda APENAS com JSON válido (sem markdown, sem explicação):
{
  "legivel": true,
  "eh_atestado": true,
  "dados": {
    "nome_paciente": "Nome",
    "data_atestado": "DD/MM/AAAA",
    "dias_afastamento": "X dias",
    "nome_medico": "Dr(a). Nome",
    "crm": "CRM XXXXX/UF"
  },
  "motivo_rejeicao": null
}

Regras:
- Imagem desfocada ou ilegível: legivel=false, motivo_rejeicao com orientação clara
- Não é atestado médico: eh_atestado=false, motivo_rejeicao explicando
- Preencha só campos que consiga ler com certeza; coloque null nos demais`

  for (const key of keys) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
            { text: prompt },
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
        }),
      })

      // 429 = rate limit desta chave → tenta a próxima
      if (res.status === 429) continue

      if (!res.ok) {
        // Outro erro → tenta próxima chave
        continue
      }

      const data = await res.json()
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) continue

      return JSON.parse(match[0]) as Analise
    } catch {
      continue
    }
  }

  // Todas as chaves falharam ou atingiram o limite
  return { legivel: false, eh_atestado: false, limiteAtingido: true, dados: {} }
}
