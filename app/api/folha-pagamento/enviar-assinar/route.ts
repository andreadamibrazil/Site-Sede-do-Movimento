import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { gerarPDFFolha } from '@/lib/folha-pdf'
import { uploadParaDrive, DRIVE_FOLDERS } from '@/lib/google-drive'

const DOCUSEAL_URL = process.env.DOCUSEAL_URL
const DOCUSEAL_KEY = process.env.DOCUSEAL_API_KEY

async function criarSubmissaoDocuSeal(
  pdfBytes: Uint8Array,
  nomeDoc: string,
  professor: { nome: string; email: string },
  admin: { nome: string; email: string }
): Promise<{ submission_id: number; link_professor: string; link_admin: string } | null> {
  try {
    // 1. Faz upload do PDF como template
    const form = new FormData()
    form.append('file', new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${nomeDoc}.pdf`)
    form.append('name', nomeDoc)

    const tplRes = await fetch(`${DOCUSEAL_URL}/api/templates/pdf`, {
      method: 'POST',
      headers: { 'X-Auth-Token': DOCUSEAL_KEY ?? '' },
      body: form,
    })
    if (!tplRes.ok) {
      console.error('DocuSeal template error:', await tplRes.text())
      return null
    }
    const tpl = await tplRes.json()
    const templateId = tpl.id

    // 2. Cria submissão com os dois assinantes
    const subRes = await fetch(`${DOCUSEAL_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'X-Auth-Token': DOCUSEAL_KEY ?? '', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        send_email: true,
        submitters: [
          { name: professor.nome, email: professor.email, role: 'Professor' },
          { name: admin.nome,     email: admin.email,     role: 'Escola' },
        ],
      }),
    })
    if (!subRes.ok) {
      console.error('DocuSeal submission error:', await subRes.text())
      return null
    }
    const sub = await subRes.json()
    const profSub = sub.find((s: any) => s.role === 'Professor') ?? sub[0]
    const adminSub = sub.find((s: any) => s.role === 'Escola') ?? sub[1]

    return {
      submission_id: profSub?.submission_id ?? profSub?.id,
      link_professor: profSub?.embed_src ?? profSub?.link ?? '',
      link_admin: adminSub?.embed_src ?? adminSub?.link ?? '',
    }
  } catch (e) {
    console.error('DocuSeal erro:', e)
    return null
  }
}

// POST /api/folha-pagamento/enviar-assinar — restrito a admins
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  if (!DOCUSEAL_URL || !DOCUSEAL_KEY) {
    return NextResponse.json({ error: 'DocuSeal não configurado' }, { status: 503 })
  }

  const sb = createServiceClient()
  const { folha_id, professor_email, admin_email } = await req.json()
  if (!folha_id) return NextResponse.json({ error: 'folha_id obrigatório' }, { status: 400 })

  const { data: folha } = await sb
    .from('folhas_pagamento')
    .select('*, professores(nome, email, cpf, mei)')
    .eq('id', folha_id)
    .single()

  if (!folha) return NextResponse.json({ error: 'Folha não encontrada' }, { status: 404 })

  const { data: itens } = await sb
    .from('itens_folha')
    .select('*, turmas(nome)')
    .eq('folha_id', folha_id)
    .order('data_aula')

  const prof = folha.professores as any
  const mesRef = new Date(folha.mes_referencia + 'T12:00:00')
  const nomeMes = mesRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const nomeDoc = `Folha de Pagamento — ${prof?.nome} — ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}`

  // Gera PDF
  const pdfBytes = await gerarPDFFolha({
    professor: prof?.nome ?? '',
    cpf: prof?.cpf ?? undefined,
    mei: prof?.mei ?? undefined,
    mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
    valor_aulas: Number(folha.valor_aulas),
    valor_fixo: Number(folha.valor_fixo),
    valor_total: Number(folha.valor_total),
    itens: (itens ?? []).map((i: any) => ({
      ...i,
      descricao: i.tipo === 'aula' ? (i.turmas as any)?.nome : i.descricao,
    })),
  })

  const emailProf = professor_email ?? prof?.email
  const emailAdmin = admin_email ?? process.env.EMAIL_ADMIN ?? 'carlos@sededomovimento.art'

  if (!emailProf) {
    return NextResponse.json({ error: 'Professor sem email cadastrado.', precisa_email: true }, { status: 422 })
  }

  const resultado = await criarSubmissaoDocuSeal(
    pdfBytes,
    nomeDoc,
    { nome: prof?.nome ?? '', email: emailProf },
    { nome: 'Sede do Movimento', email: emailAdmin }
  )

  if (!resultado) {
    return NextResponse.json({ error: 'Erro ao criar documento no DocuSeal' }, { status: 500 })
  }

  // Upload para o Google Drive (pasta: Pagamento Equipe / MM.YYYY)
  let driveFileId: string | null = null
  let drivePdfUrl: string | null = null
  try {
    const mesFolder = `${String(mesRef.getMonth() + 1).padStart(2, '0')}.${mesRef.getFullYear()}`
    const nomeArquivo = `Folha - ${prof?.nome} - ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}.pdf`
    const driveResult = await uploadParaDrive(
      pdfBytes.buffer as ArrayBuffer,
      nomeArquivo,
      'application/pdf',
      DRIVE_FOLDERS.pagamentoEquipe,
      mesFolder,
    )
    driveFileId = driveResult.fileId
    drivePdfUrl = driveResult.viewUrl
    console.log(`[folha-pdf] Drive upload OK: ${drivePdfUrl}`)
  } catch (driveErr) {
    console.error('[folha-pdf] Drive upload FALHOU (não bloqueia envio):', driveErr)
  }

  // Atualiza folha
  await sb.from('folhas_pagamento').update({
    status: 'enviado',
    autentique_doc_id: String(resultado.submission_id),
    ...(driveFileId ? { drive_pdf_id: driveFileId, drive_pdf_url: drivePdfUrl } : {}),
  }).eq('id', folha_id)

  return NextResponse.json({
    ok: true,
    submission_id: resultado.submission_id,
    link_professor: resultado.link_professor,
    link_admin: resultado.link_admin,
    professor: prof?.nome,
    email: emailProf,
    drive_url: drivePdfUrl,
  })
}
