import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function blank(val: string | null | undefined, ph = '&emsp;&emsp;&emsp;&emsp;&emsp;'): string {
  const v = esc(val ?? '')
  return v
    ? `<span class="filled">${v}</span>`
    : `<span class="b" contenteditable="true" spellcheck="false">${ph}</span>`
}

function fmtData(val: string | null | undefined): string | null {
  if (!val) return null
  return new Date(val + 'T12:00:00').toLocaleDateString('pt-BR')
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id } = await params
  const sb = createServiceClient()

  const { data: aluno } = await sb
    .from('alunos')
    .select(`
      nome, data_nascimento, cpf, celular, email, endereco, bairro, cep,
      responsavel_principal_id,
      responsaveis!alunos_responsavel_principal_id_fkey(nome, data_nascimento, cpf, celular, email),
      matriculas(status, data_inicio, dia_vencimento, plano, valor_final)
    `)
    .eq('id', id)
    .single()

  if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })

  const resp = (aluno as any).responsaveis
  const isMinor = !!aluno.responsavel_principal_id && !!resp

  const nomeSign = isMinor ? resp?.nome : aluno.nome
  const nascSign = isMinor ? resp?.data_nascimento : aluno.data_nascimento
  const cpfSign  = isMinor ? resp?.cpf : aluno.cpf
  const celSign  = isMinor ? (resp?.celular ?? aluno.celular) : aluno.celular
  const emailSign = isMinor ? (resp?.email ?? aluno.email) : aluno.email

  const matriculaAtiva = ((aluno as any).matriculas ?? []).find((m: any) => m.status === 'ativa')
  const dataContratoOriginal = fmtData(matriculaAtiva?.data_inicio)
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termo Aditivo — ${esc(aluno.nome)}</title>
  <style>
    @page { margin: 2.5cm 2cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 12.5px; line-height: 1.8; color: #111; }

    .no-print { background: #4f46e5; color: white; border: none; border-radius: 8px;
      padding: 10px 20px; font-size: 13px; cursor: pointer; margin-bottom: 20px;
      font-family: system-ui, sans-serif; }
    .no-print:hover { background: #4338ca; }
    @media print { .no-print { display: none !important; } }

    .header { text-align: center; margin-bottom: 28px; }
    .escola { font-size: 16px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
    .escola-sub { font-size: 11px; color: #555; margin-top: 3px; }
    hr.topo { border: none; border-top: 2px solid #111; margin: 14px 0; }

    h1 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; text-align: center;
         margin: 18px 0 22px; font-family: Georgia, serif; }

    p { margin-bottom: 10px; text-align: justify; }
    .dados { margin: 14px 0; font-size: 12.5px; }
    .dados p { margin-bottom: 4px; }
    .dados strong { min-width: 90px; display: inline-block; }

    .secao { margin: 16px 0; padding: 12px; border: 1px solid #bbb; border-radius: 4px; background: #fafafa; }
    .secao-titulo { font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;
                    margin-bottom: 8px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    .secao p { margin-bottom: 4px; }

    .clausula { margin: 14px 0; }
    .clausula-num { font-weight: bold; }

    .assinatura-bloco { margin-top: 50px; }
    .assinaturas { display: flex; gap: 60px; margin-top: 30px; }
    .ass { flex: 1; }
    .ass-linha { border-top: 1px solid #111; padding-top: 6px; font-size: 11px; text-align: center; }

    .data-rj { text-align: right; margin: 30px 0 10px; color: #444; font-size: 12px; }

    .b {
      border-bottom: 1px solid #333;
      min-width: 60px;
      display: inline-block;
      outline: none;
      cursor: text;
      padding: 0 4px;
      color: #1a3a7a;
      font-style: italic;
    }
    .b:focus { background: #fffbe6; border-bottom-color: #4f46e5; }
    .filled { color: #111; }

    @media print {
      .b { color: #111; font-style: normal; border-bottom-color: #111; background: transparent !important; }
      .secao { background: white; }
    }
  </style>
</head>
<body>

<button class="no-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
<p class="no-print" style="font-size:12px;color:#666;margin-bottom:16px;font-family:sans-serif">
  Campos em <em style="color:#1a3a7a">itálico azul</em> são editáveis — clique para preencher antes de imprimir.
</p>

<div class="header">
  <div class="escola">Sede do Movimento</div>
  <div class="escola-sub">Escola de Dança — Av. Paulo de Frontin, 698 · Rio de Janeiro, RJ · CNPJ 11.533.434/0001-73</div>
</div>
<hr class="topo"/>

<h1>Aditivo ao Contrato de Prestação de Serviços</h1>

<p>
  A <strong>Fontinelle Criações Artísticas</strong>, pessoa jurídica de direito privado, localizada na
  Avenida Paulo de Frontin, nº 698, inscrita no CNPJ 11.533.434/0001-73, doravante denominada
  <strong>CONTRATADA</strong>, aqui representada por <strong>Carlos Augusto da Silva Fontinelle</strong>,
  portador da identidade nº 21.238.873-0; e de outro lado, como <strong>CONTRATANTE</strong>:
</p>

<div class="dados">
  <p><strong>Nome:</strong> ${blank(nomeSign)}</p>
  <p><strong>Nascimento:</strong> ${blank(fmtData(nascSign))} &nbsp;&nbsp; <strong>CPF:</strong> ${blank(cpfSign)}</p>
  <p><strong>Endereço:</strong> ${blank(aluno.endereco)}</p>
  <p><strong>CEP:</strong> ${blank(aluno.cep)} &nbsp;&nbsp; <strong>Bairro:</strong> ${blank(aluno.bairro)}</p>
  <p><strong>Cidade:</strong> <span class="filled">Rio de Janeiro</span></p>
  <p><strong>Celular:</strong> ${blank(celSign)} &nbsp;&nbsp; <strong>Email:</strong> ${blank(emailSign)}</p>
</div>

${isMinor ? `<p>na qualidade de <strong>RESPONSÁVEL PELO(A) ALUNO(A) MENOR ${esc(aluno.nome)}</strong>,</p>` : ''}

<p>
  doravante denominados <strong>ESCOLA</strong> e <strong>ALUNO</strong>, resolvem de comum acordo firmar o
  presente <strong>ADITIVO AO CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong>, mediante as seguintes cláusulas e condições:
</p>

<div class="clausula">
  <p><span class="clausula-num">1º) DO OBJETO:</span>
  O presente aditivo tem por objeto alterar ${blank(null, 'a(s) modalidade(s) / o plano')} contratada(s) pelo ALUNO,
  modificando-se o quadro resumo no preâmbulo do contrato de prestação de serviços firmado
  na data de ${blank(dataContratoOriginal)}, passando a vigorar o seguinte:</p>
</div>

<div class="secao">
  <div class="secao-titulo">Alteração de Modalidade / Turma</div>
  <p><strong>Modalidade(s):</strong> ${blank(null, 'ex: Ballet, Dança Contemporânea')}</p>
  <p><strong>Turma(s):</strong> ${blank(null, 'ex: Ballet Adulto Básico/Intermediário')}</p>
  <p><strong>Carga horária semanal:</strong> ${blank(null, 'ex: 2x na semana - 1h30 de aula')}</p>
</div>

<div class="secao" style="margin-top:12px">
  <div class="secao-titulo">Alteração de Plano / Preço</div>
  <p><strong>Início do Plano:</strong> ${blank(null)}</p>
  <p><strong>Duração do Plano:</strong> ${blank(null, '12 meses')}</p>
  <p><strong>Dia de Vencimento:</strong> ${blank(matriculaAtiva?.dia_vencimento ? String(matriculaAtiva.dia_vencimento) : null)}</p>
  <p><strong>Valor Mensal do Plano:</strong> R$ ${blank(null, '000,00')}</p>
</div>

<div class="clausula" style="margin-top:16px">
  <p>
    <span class="clausula-num">2º) DAS ALTERAÇÕES DECORRENTES DO PRESENTE ADITIVO:</span>
    Tendo em vista a alteração objeto deste instrumento, os termos descritos no item 1º passam a
    vigorar imediatamente, substituindo as condições anteriormente pactuadas no contrato original.
  </p>
</div>

<div class="clausula">
  <p>
    <span class="clausula-num">3º) DA RATIFICAÇÃO DO CONTRATO DE PRESTAÇÃO DE SERVIÇOS:</span>
    Permanecem inalteradas as demais cláusulas do contrato de prestação de serviços firmado
    em ${blank(dataContratoOriginal)}, ratificando as partes a obrigação de cumpri-las integralmente.
  </p>
</div>

<p>
  Estando assim cientes e de acordo, as partes assinam o presente ADITIVO, em formato exclusivamente
  digital e, assim, dispensando-se a presença de testemunhas.
</p>

<div class="data-rj">Rio de Janeiro, ${blank(hoje)}.</div>

<div class="assinaturas">
  <div class="ass">
    <div class="ass-linha">Aluno ou Responsável pelo Aluno</div>
  </div>
  <div class="ass">
    <div class="ass-linha">Fontinelle Criações Artísticas</div>
  </div>
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="termo-aditivo-${esc(aluno.nome.split(' ')[0].toLowerCase())}.html"`,
    },
  })
}
