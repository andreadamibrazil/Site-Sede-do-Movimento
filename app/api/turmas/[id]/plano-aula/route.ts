import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { uploadParaDrive, DRIVE_FOLDERS } from '@/lib/google-drive'
import { ADMIN_EMAILS } from '@/lib/auth/adminEmails'
import { callGemini, callGeminiVision } from '@/lib/gemini'

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

  // Professor comum: acessa turma se for o professor_id principal ou co-regente
  const { data: turma } = await sb
    .from('turmas').select('id, professor_id')
    .eq('id', turmaId).maybeSingle()
  if (turma?.professor_id === professor.id) return { ok: true }

  const { data: coProf } = await sb
    .from('turma_professores' as any).select('professor_id')
    .eq('turma_id', turmaId).eq('professor_id', professor.id).maybeSingle()
  if (coProf) return { ok: true }

  return { ok: false, response: NextResponse.json({ error: 'acesso negado' }, { status: 403 }) }
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

    // Visão só lê imagens (gpt-4o-mini não aceita PDF). Arquivo é processado em
    // memória e descartado — não vai para o Supabase Storage.
    let parsedPdf: any
    try {
      const rawPdf = await callGeminiVision(base64, arquivo.type || 'application/pdf', PROMPT_EXTRACAO, { maxOutputTokens: 4096 })
      parsedPdf = JSON.parse(rawPdf.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      return NextResponse.json({ error: 'Não consigo ler PDF automaticamente. Cole o texto do plano no campo "Colar texto" ao lado.' }, { status: 422 })
    }
    resumo = parsedPdf.resumo ?? ''
    conteudo = parsedPdf
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

    const rawTxt = await callGemini(`${PROMPT_EXTRACAO}\n\nPLANO:\n${textoOriginal}`, { maxOutputTokens: 4096 })
    let parsedTxt: any
    try {
      parsedTxt = JSON.parse(rawTxt.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      return NextResponse.json({ error: 'Gemini retornou resposta inválida para o texto. Tente novamente.' }, { status: 422 })
    }
    resumo = parsedTxt.resumo ?? ''
    conteudo = parsedTxt
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
