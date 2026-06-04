import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id } = await params
  const sb = createServiceClient()

  // Busca dados do aluno e responsável
  const { data: aluno } = await sb
    .from('alunos')
    .select(`
      nome,
      responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(nome, email, celular),
      matriculas(status, plano, valor_final, dia_vencimento, data_inicio,
        matricula_turmas(turmas(nome, modalidades(nome))))
    `)
    .eq('id', id)
    .single()

  if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })

  const resp = aluno.responsavel_principal as any
  const emailDestino = resp?.email
  if (!emailDestino) return NextResponse.json({ error: 'Responsável sem e-mail cadastrado' }, { status: 400 })

  // Gera URL da declaração
  const baseUrl = req.nextUrl.origin
  const declaracaoUrl = `${baseUrl}/api/alunos/${id}/declaracao`

  // Envia e-mail via SMTP configurado (nodemailer via fetch para o endpoint interno)
  const SMTP_FROM = process.env.SMTP_FROM_EMAIL ?? 'andreadami@sededomovimento.art'

  try {
    const { createTransport } = await import('nodemailer')
    const transport = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME ?? SMTP_FROM,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transport.sendMail({
      from: `"Sede do Movimento" <${SMTP_FROM}>`,
      to: emailDestino,
      subject: `Declaração de Matrícula — ${aluno.nome}`,
      html: `
        <p>Olá, ${resp?.nome ?? 'responsável'}!</p>
        <p>Segue abaixo o link para a Declaração de Matrícula de <strong>${aluno.nome}</strong>:</p>
        <p><a href="${declaracaoUrl}" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin:12px 0">
          📄 Ver Declaração de Matrícula
        </a></p>
        <p style="font-size:12px;color:#666">Clique no link, aguarde carregar e use Ctrl+P (ou ⌘+P) para salvar como PDF.</p>
        <p style="font-size:12px;color:#666;margin-top:20px">— Sede do Movimento</p>
      `,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Falha ao enviar e-mail: ' + e.message }, { status: 500 })
  }

  // Registra no audit_log
  await sb.from('audit_log').insert({
    tabela: 'declaracao_matricula',
    operacao: 'EMITIDA',
    registro_id: id,
    usuario_id: guard.userId,
    descricao: `Declaração emitida para ${emailDestino}`,
    dados_novos: { aluno_id: id, email_destino: emailDestino },
  })

  return NextResponse.json({ ok: true, enviado_para: emailDestino })
}
