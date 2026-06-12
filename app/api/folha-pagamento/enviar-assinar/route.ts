import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { gerarPDFFolha } from '@/lib/folha-pdf'

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
    .select('*, professores(nome, email, cpf)')
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

  // Atualiza folha
  await sb.from('folhas_pagamento').update({
    status: 'enviado',
    autentique_doc_id: String(resultado.submission_id), // reutiliza coluna para o ID DocuSeal
  }).eq('id', folha_id)

  return NextResponse.json({
    ok: true,
    submission_id: resultado.submission_id,
    link_professor: resultado.link_professor,
    link_admin: resultado.link_admin,
    professor: prof?.nome,
    email: emailProf,
  })
}
