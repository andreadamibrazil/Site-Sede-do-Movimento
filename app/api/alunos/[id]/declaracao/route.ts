import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id } = await params
  const sb = createServiceClient()

  const { data: aluno } = await sb
    .from('alunos')
    .select(`
      nome, nome_social, data_nascimento, cpf,
      responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(nome, cpf),
      matriculas(
        id, status, plano, data_inicio, dia_vencimento, valor_final, created_at,
        matricula_turmas(turmas(nome, modalidades(nome)))
      )
    `)
    .eq('id', id)
    .single()

  if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })

  const matriculaAtiva = (aluno.matriculas ?? []).find((m: any) => m.status === 'ativa')
  const turmas = (matriculaAtiva?.matricula_turmas ?? [])
    .map((mt: any) => mt.turmas?.nome)
    .filter(Boolean)
    .join(', ')

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const dataInicio = matriculaAtiva?.data_inicio
    ? new Date(matriculaAtiva.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '—'

  const PLANOS: Record<string, string> = {
    mensal: 'Plano Mensal',
    anual: 'Plano Anual (Fidelidade 12x)',
    trimestral: 'Plano Trimestral',
    semestral: 'Plano Semestral',
  }

  const resp = aluno.responsavel_principal as any
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Declaração de Matrícula — ${aluno.nome}</title>
  <style>
    @page { margin: 2cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; font-size: 13px; line-height: 1.7; color: #222; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 18px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { font-size: 11px; color: #555; margin-top: 4px; }
    h1 { font-size: 15px; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin: 24px 0; }
    hr { border: none; border-top: 2px solid #222; margin: 16px 0; }
    .body-text { text-align: justify; margin: 20px 0; line-height: 1.9; }
    .bold { font-weight: bold; }
    .section { margin: 16px 0; }
    .label { color: #555; display: inline-block; min-width: 180px; }
    .footer { margin-top: 60px; }
    .assinatura { border-top: 1px solid #222; width: 280px; margin: 0 auto; text-align: center; padding-top: 6px; font-size: 11px; }
    .data { text-align: right; margin-top: 40px; color: #555; font-size: 12px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-text">Sede do Movimento</div>
    <div class="subtitle">Escola de Dança — Rio de Janeiro, RJ</div>
  </div>
  <hr/>
  <h1>Declaração de Matrícula</h1>

  <p class="body-text">
    Declaramos, para os devidos fins, que <span class="bold">${aluno.nome}${aluno.nome_social ? ` (${aluno.nome_social})` : ''}</span>${aluno.data_nascimento ? `, nascido(a) em ${new Date(aluno.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}${aluno.cpf ? `, CPF ${aluno.cpf}` : ''}, encontra-se regularmente matriculado(a) nesta escola, ${matriculaAtiva ? `desde ${dataInicio}` : 'com matrícula registrada'}, nas seguintes atividades:
  </p>

  <div class="section">
    <p><span class="label">Modalidades / Turmas:</span> <span class="bold">${turmas || '—'}</span></p>
    ${matriculaAtiva ? `
    <p><span class="label">Plano:</span> ${PLANOS[matriculaAtiva.plano] ?? matriculaAtiva.plano}</p>
    <p><span class="label">Valor mensal:</span> ${matriculaAtiva.valor_final != null ? `R$ ${Number(matriculaAtiva.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</p>
    <p><span class="label">Vencimento:</span> Dia ${matriculaAtiva.dia_vencimento} de cada mês</p>
    ` : ''}
    ${resp?.nome ? `<p><span class="label">Responsável financeiro:</span> ${resp.nome}${resp.cpf ? ` — CPF ${resp.cpf}` : ''}</p>` : ''}
  </div>

  <p class="body-text">
    Esta declaração é emitida a pedido do interessado, para fins de comprovação de vínculo com esta instituição.
  </p>

  <div class="data">Rio de Janeiro, ${hoje}</div>

  <div class="footer">
    <div class="assinatura">
      Sede do Movimento — Direção<br/>
      <small>CNPJ: — </small>
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="declaracao-matricula-${aluno.nome.split(' ')[0].toLowerCase()}.html"`,
    },
  })
}
