import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { uploadParaDrive, DRIVE_FOLDERS } from '@/lib/google-drive'
import { ADMIN_EMAILS } from '@/lib/auth/adminEmails'

const GEMINI_KEYS = [
  process.env.GOOGLE_AI_KEY,
  process.env.GOOGLE_AI_KEY_2,
  process.env.GOOGLE_AI_KEY_3,
  process.env.GOOGLE_AI_KEY_4,
  process.env.GOOGLE_AI_KEY_5,
  process.env.GOOGLE_AI_KEY_6,
  process.env.GOOGLE_AI_KEY_7,
  process.env.GOOGLE_AI_KEY_8,
  process.env.GOOGLE_AI_KEY_9,
  process.env.GOOGLE_AI_KEY_10,
].filter(Boolean)

// Aceita: admin, secretaria OU professor com acesso à turma
async function verificarAcesso(turmaId: string): Promise<{ ok: boolean; response?: NextResponse }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, response: NextResponse.json({ error: 'não autenticado' }, { status: 401 }) }

  const sb = createServiceClient()

  // Staff (admin/secretaria)?
  const { data: perfil } = await sb.from('perfis_usuario').select('perfil').eq('id', user.id).maybeSingle()
  if (perfil?.perfil === 'admin' || perfil?.perfil === 'secretaria') return { ok: true }

  // Professor ativo?
  const { data: professor } = await sb
    .from('professores').select('id')
    .eq('email', user.email ?? '').eq('ativo', true).maybeSingle()
  if (!professor) return { ok: false, response: NextResponse.json({ error: 'acesso negado' }, { status: 403 }) }

  // Admin professor: acessa qualquer turma
  if (ADMIN_EMAILS.includes(user.email ?? '')) return { ok: true }

  // Professor comum: só acessa turmas dele
  const { data: turma } = await sb
    .from('turmas').select('id')
    .eq('id', turmaId).eq('professor_id', professor.id).maybeSingle()
  if (!turma) return { ok: false, response: NextResponse.json({ error: 'acesso negado' }, { status: 403 }) }

  return { ok: true }
}

const PROMPT_EXTRACAO = `Você é um assistente pedagógico de uma escola de dança.

Analise o plano de aula e extraia as informações em formato JSON estruturado.

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

// AQ. keys precisam de header x-goog-api-key; AIzaSy usam ?key= param
function geminiRequest(apiKey: string, body: object): Promise<Response> {
  const base = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
  if (apiKey.startsWith('AQ.')) {
    return fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    })
  }
  return fetch(`${base}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function chamarGemini(parts: object[]): Promise<{ resumo: string; conteudo: any }> {
  for (const key of GEMINI_KEYS) {
    try {
      const res = await geminiRequest(key as string, { contents: [{ parts }] })
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
  const { id: turma_id } = await params

  const guard = await verificarAcesso(turma_id)
  if (!guard.ok) return guard.response!

  const sb = createServiceClient()
  let resumo: string
  let conteudo: any
  let textoOriginal = ''
  let dataInicio: string | null = null
  let dataFim: string | null = null
  let driveFileId: string | null = null
  let driveUrl: string | null = null

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const arquivo = formData.get('arquivo') as File | null
    dataInicio = formData.get('data_inicio') as string | null
    dataFim = formData.get('data_fim') as string | null

    if (!arquivo) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    // 5MB — PDF típico de plano de aula fica bem abaixo disso
    if (arquivo.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB). Comprima o PDF antes de enviar.' }, { status: 400 })

    const buffer = await arquivo.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // PDF é processado em memória pelo Gemini e descartado — não vai para o Supabase Storage
    const resultado = await chamarGemini([
      { inline_data: { mime_type: 'application/pdf', data: base64 } },
      { text: PROMPT_EXTRACAO },
    ])
    resumo = resultado.resumo
    conteudo = resultado.conteudo
    textoOriginal = `[PDF: ${arquivo.name}]`

    // Upload para o Drive: Sites/Sede do Movimento/Planos de Aula/{turma}/
    try {
      const { data: turmaInfo } = await sb.from('turmas').select('nome').eq('id', turma_id).maybeSingle()
      const nomeTurma = turmaInfo?.nome ?? turma_id
      const driveResult = await uploadParaDrive(buffer, arquivo.name, 'application/pdf', DRIVE_FOLDERS.sedePlanos, nomeTurma)
      driveFileId = driveResult.fileId
      driveUrl = driveResult.viewUrl
    } catch (driveErr) {
      console.error('Drive upload falhou (continuando sem Drive):', driveErr)
    }
  } else {
    const body = await req.json()
    textoOriginal = body.texto
    dataInicio = body.data_inicio ?? null
    dataFim = body.data_fim ?? null
    if (!textoOriginal?.trim()) return NextResponse.json({ error: 'Texto do plano é obrigatório' }, { status: 400 })

    const resultado = await chamarGemini([{ text: `${PROMPT_EXTRACAO}\n\nPLANO:\n${textoOriginal}` }])
    resumo = resultado.resumo
    conteudo = resultado.conteudo
  }

  const { data, error } = await sb
    .from('planos_aula')
    .upsert({
      turma_id,
      texto_original: textoOriginal,
      gemini_resumo: resumo,
      gemini_conteudo: conteudo,
      data_inicio: dataInicio || null,
      data_fim: dataFim || null,
      drive_file_id: driveFileId,
      drive_url: driveUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'turma_id' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: data.id, resumo, conteudo })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: turma_id } = await params

  const guard = await verificarAcesso(turma_id)
  if (!guard.ok) return guard.response!

  const sb = createServiceClient()

  const { data } = await sb
    .from('planos_aula')
    .select('*')
    .eq('turma_id', turma_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ plano: data })
}
