import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import type { Json } from '@/lib/supabase/types'
import { uploadParaDrive, DRIVE_FOLDERS } from '@/lib/google-drive'
import { callGeminiVision } from '@/lib/gemini'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/pdf',
]

const PROMPT_COMPROVANTE = `Você é um extrator de dados de comprovantes de pagamento brasileiros.
Analise esta imagem ou PDF e extraia os dados em JSON válido.
Retorne APENAS o JSON, sem markdown, sem explicações, sem texto extra.

Formato exato:
{"valor":<número decimal ou null>,"data":"<YYYY-MM-DD ou null>","tipo_pagamento":"<Pix|TED|DOC|Transferência|Boleto|null>","banco_origem":"<nome do banco remetente ou null>","chave_pix":"<chave pix usada ou null>","nome_destinatario":"<nome do recebedor ou null>"}

Se um campo não for encontrado no documento, use null. NUNCA invente dados.`

// POST — upload de arquivo (imagem ou PDF)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const sb = createServiceClient()

  const { data: folha } = await sb
    .from('folhas_pagamento')
    .select('id, status, mes_referencia, professores(nome)')
    .eq('id', folhaId)
    .single()

  if (!folha) return NextResponse.json({ error: 'Folha não encontrada' }, { status: 404 })

  // Parse multipart
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Formato inválido — envie multipart/form-data com campo "file"' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Campo "file" obrigatório' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 })
  }

  const mimeType = file.type || 'application/octet-stream'
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: `Tipo não suportado: "${mimeType}". Use JPG, PNG, WebP, HEIC ou PDF.` },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  // Subpasta: mesmo padrão das folhas (MM.YYYY)
  const [anoStr, mesStr] = (folha.mes_referencia as string).slice(0, 7).split('-')
  const mesPasta = `${mesStr}.${anoStr}` // ex: "06.2026"
  const profNome = ((folha.professores as any)?.nome ?? 'Professor')
    .replace(/[/\\?%*:|"<>]/g, '-') // sanitiza nome para nome de arquivo
  const ext = (file.name?.split('.').pop() ?? 'jpg').toLowerCase()
  const fileName = `Comprovante - ${profNome} - ${mesPasta}.${ext}`

  // Upload para Drive
  let driveUrl: string
  try {
    const result = await uploadParaDrive(
      arrayBuffer,
      fileName,
      mimeType,
      DRIVE_FOLDERS.pagamentoEquipe,
      mesPasta
    )
    driveUrl = result.viewUrl
  } catch (err) {
    return NextResponse.json({ error: `Erro ao salvar no Drive: ${String(err)}` }, { status: 500 })
  }

  // Salva URL imediatamente (não depende do Gemini)
  await sb.from('folhas_pagamento').update({
    comprovante_url: driveUrl,
    comprovante_adicionado_em: new Date().toISOString(),
  }).eq('id', folhaId)

  // Extração com Gemini (falha silenciosa — URL já foi salva)
  let dadosExtraidos: Json | null = null
  let geminiErro: string | null = null
  try {
    const raw = await callGeminiVision(base64, mimeType, PROMPT_COMPROVANTE)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      dadosExtraidos = parsed
    }
  } catch (err) {
    geminiErro = String(err)
  }

  // Salva dados do Gemini
  if (dadosExtraidos) {
    await sb.from('folhas_pagamento')
      .update({ comprovante_dados: dadosExtraidos })
      .eq('id', folhaId)
  }

  return NextResponse.json({
    ok: true,
    comprovante_url: driveUrl,
    comprovante_dados: dadosExtraidos,
    gemini_erro: geminiErro,
  })
}

// PATCH — salvar URL manual (compatibilidade)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const { comprovante_url } = await req.json()
  const sb = createServiceClient()

  if (comprovante_url) {
    await sb.from('folhas_pagamento').update({
      comprovante_url,
      comprovante_adicionado_em: new Date().toISOString(),
    }).eq('id', folhaId)
  } else {
    await sb.from('folhas_pagamento').update({ comprovante_url: null }).eq('id', folhaId)
  }
  return NextResponse.json({ ok: true })
}
