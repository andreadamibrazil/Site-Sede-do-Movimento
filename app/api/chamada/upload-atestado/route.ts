import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { callGeminiVision } from '@/lib/gemini'

const BUCKET = 'atestados'
const MAX_MB = 10

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
  // Aceita imagem ou PDF (PDF é rasterizado em imagem no lib/gemini). Rejeita
  // o resto cedo com mensagem clara — evita o erro genérico "sistema indisponível".
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return NextResponse.json({
      error: 'Envie uma foto (JPG/PNG) ou um PDF do atestado.',
      legivel: false,
    }, { status: 422 })
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
  // Extensão derivada do MIME type validado, nunca do nome do arquivo (evita path traversal)
  const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' }
  const ext = MIME_EXT[file.type]
  if (!ext) return NextResponse.json({ error: 'tipo de arquivo não suportado' }, { status: 400 })

  // aulaId deve ser UUID válido
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(aulaId)) {
    return NextResponse.json({ error: 'aulaId inválido' }, { status: 400 })
  }

  const sb = createServiceClient()

  // Verifica que o professor autenticado pertence a esta aula
  const { data: aulaCheck } = await sb
    .from('aulas')
    .select('turma_id, turmas!inner(professor_id)')
    .eq('id', aulaId)
    .maybeSingle()

  if (!aulaCheck) return NextResponse.json({ error: 'aula não encontrada' }, { status: 404 })

  const { data: profCheck } = await sb
    .from('professores')
    .select('id')
    .eq('email', user.email ?? '')
    .eq('ativo', true)
    .maybeSingle()

  const isPrimario = (aulaCheck.turmas as any)?.professor_id === profCheck?.id
  if (!isPrimario && profCheck) {
    const { data: coReg } = await sb
      .from('turma_professores' as any)
      .select('professor_id')
      .eq('turma_id', aulaCheck.turma_id)
      .eq('professor_id', profCheck.id)
      .maybeSingle()
    if (!coReg) return NextResponse.json({ error: 'sem permissão para esta aula' }, { status: 403 })
  } else if (!profCheck) {
    return NextResponse.json({ error: 'professor não encontrado' }, { status: 403 })
  }

  const path = `${aulaId}/${user.id}_${Date.now()}.${ext}`

  // O bucket 'atestados' deve existir no Supabase Storage antes do deploy.
  // Não verificamos/criamos em runtime: listBuckets() é lento e cria race conditions.
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Bucket privado (dados médicos sensíveis) — URL assinada com 1 ano de validade
  const { data: signedData, error: signErr } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (signErr || !signedData) return NextResponse.json({ error: 'Erro ao gerar URL do atestado' }, { status: 500 })

  return NextResponse.json({ url: signedData.signedUrl, legivel: true, dados: analise.dados })
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

async function analisarAtestado(buf: Buffer, mimeType: string): Promise<Analise> {
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

  try {
    const raw = await callGeminiVision(base64, mimeType || 'image/jpeg', prompt, { maxOutputTokens: 600 })
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return { legivel: false, eh_atestado: false, limiteAtingido: false, dados: {} }
    return JSON.parse(match[0]) as Analise
  } catch {
    return { legivel: false, eh_atestado: false, limiteAtingido: true, dados: {} }
  }
}
