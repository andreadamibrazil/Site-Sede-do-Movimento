'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { criarSubmission } from '@/lib/docuseal'
import { buscarOuCriarCliente, criarCobranca, resolverPagador } from '@/lib/asaas/client'

// ── BotaoExcluirAluno ────────────────────────────────────────
export async function excluirAluno(alunoId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('alunos')
    .update({ status_pedagogico: 'excluido' as any })
    .eq('id', alunoId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/alunos')
}

// ── AbaUniforme ──────────────────────────────────────────────
export async function inserirRetiradaUniforme(data: {
  aluno_id: string
  item: string
  tamanho: string
  quantidade: number
  valor: number | null
  observacao: string | null
  responsavel_nome: string | null
}) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: retirada, error } = await (supabase as any).from('uniforme_retiradas')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
  return retirada
}

// ── NovoAlunoForm ────────────────────────────────────────────
export async function obterOuCriarResponsavel(data: {
  cpf: string
  nome: string
  celular: string
  email: string | null
  parentesco: string | null
  notificacao: string
}): Promise<string> {
  const supabase = createServiceClient()
  const cpfLimpo = data.cpf.replace(/\D/g, '')

  if (cpfLimpo.length === 11) {
    const { data: existente } = await supabase
      .from('responsaveis')
      .select('id')
      .eq('cpf', cpfLimpo)
      .maybeSingle()
    if (existente) return existente.id as string
  }

  const { data: criado, error } = await supabase
    .from('responsaveis')
    .insert({
      nome: data.nome.trim(),
      cpf: cpfLimpo.length === 11 ? cpfLimpo : null,
      celular: data.celular || 'não informado',
      email: data.email || null,
      parentesco: data.parentesco || null,
      notificacao: data.notificacao as any,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return criado.id as string
}

export async function salvarAluno(data: {
  nome: string
  nome_social: string | null
  sexo: string | null
  data_nascimento: string | null
  cpf: string | null
  rg: string | null
  celular: string | null
  email: string | null
  cep: string | null
  endereco: string | null
  bairro: string | null
  origem: string | null
  como_conheceu: string | null
  info_saude: string | null
  observacoes: string | null
  responsavel_principal_id: string | null
  responsavel_secundario_id: string | null
  leadId?: string | null
}): Promise<string> {
  const supabase = createServiceClient()
  const { leadId, ...alunoData } = data

  const { data: aluno, error } = await supabase
    .from('alunos')
    .insert({ ...alunoData, status_pedagogico: 'ativo', status_financeiro: 'em_dia' })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  if (leadId) {
    await supabase.from('leads').update({ status: 'convertido' }).eq('id', leadId)
  }

  return aluno.id as string
}

// ── VincularFamilia ──────────────────────────────────────────
export async function criarFamilia(nome: string): Promise<string> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('familias')
    .insert({ nome })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id as string
}

export async function vincularAlunoFamilia(alunoId: string, familiaId: string) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('alunos').update({ familia_id: familiaId }).eq('id', alunoId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('familia_membros').insert({ familia_id: familiaId, aluno_id: alunoId, papeis: ['aluno'] })
  revalidatePath(`/painel/alunos/${alunoId}`)
}

// ── AbaMatriculas ────────────────────────────────────────────
export async function salvarAditivo(data: {
  matricula_id: string
  tipo: string
  motivo: string | null
  antes: Record<string, any>
  depois: Record<string, any>
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('termos_aditivos').insert(data as any)
  if (error) throw new Error(error.message)
}

// ── AbaPresenca ──────────────────────────────────────────────
export async function justificarFalta(presencaId: string, obs: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('presencas')
    .update({ status: 'falta_justificada' as any, observacao: obs || 'Atestado entregue' })
    .eq('id', presencaId)
  if (error) throw new Error(error.message)
}

// ── AbaCobrancas ─────────────────────────────────────────────
export async function adicionarCobrancaAvulsa(data: {
  aluno_id: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string | null
}) {
  const supabase = createServiceClient()
  const { data: nova, error } = await supabase
    .from('cobrancas_avulsas')
    .insert({ ...data, status: 'pendente' } as any)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
  return nova
}

export async function marcarCobrancaAvulsaPaga(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('cobrancas_avulsas')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── AbaDocumentos ─────────────────────────────────────────────
export async function salvarDocumentoLink(data: {
  aluno_id: string
  tipo: string
  nome: string
  observacao: string | null
  drive_url: string
}) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .insert({ ...data, storage_path: '' })
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${data.aluno_id}`)
}

export async function editarDocumento(id: string, data: { observacao: string | null; tipo: string }) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function excluirDocumentoDB(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('documentos_aluno')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ── AbaFinanceiro: lançar mensalidades no Asaas ─────────────
export async function lancarMensalidadesAsaas(
  alunoId: string,
): Promise<{ lancadas: number; erros: string[] }> {
  if (!process.env.ASAAS_API_KEY) return { lancadas: 0, erros: ['ASAAS_API_KEY não configurada'] }

  const supabase = createServiceClient()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select(`
      id, responsavel_financeiro_id,
      responsavel_financeiro:responsaveis!matriculas_responsavel_financeiro_id_fkey(
        id, nome, cpf, email, celular, asaas_customer_id
      ),
      alunos!matriculas_aluno_id_fkey(
        id, nome, cpf, email, celular, asaas_customer_id,
        responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(
          id, nome, cpf, email, celular, notificacao, asaas_customer_id
        )
      )
    `)
    .eq('aluno_id', alunoId)
    .eq('status', 'ativa')

  if (!matriculas?.length) return { lancadas: 0, erros: [] }

  const matriculaIds = matriculas.map(m => m.id)
  const { data: mensalidades } = await supabase
    .from('mensalidades')
    .select('id, matricula_id, valor, vencimento, competencia')
    .in('matricula_id', matriculaIds)
    .in('status', ['aberta', 'em_atraso'])
    .is('codigo_asaas', null)

  if (!mensalidades?.length) return { lancadas: 0, erros: [] }

  let lancadas = 0
  const erros: string[] = []

  for (const mens of mensalidades) {
    const mat = matriculas.find(m => m.id === mens.matricula_id)
    if (!mat) continue

    const aluno = (mat as any).alunos
    const respFinanceiro = (mat as any).responsavel_financeiro
    const respPrincipal = aluno?.responsavel_principal

    const { pagador, tabela, asaas_customer_id: existingId } = resolverPagador(
      aluno, respPrincipal, respFinanceiro,
    )

    try {
      let customerId = existingId
      if (!customerId) {
        customerId = await buscarOuCriarCliente(pagador)
        if (tabela === 'responsaveis') {
          await supabase.from('responsaveis').update({ asaas_customer_id: customerId } as any).eq('id', pagador.id)
        } else {
          await supabase.from('alunos').update({ asaas_customer_id: customerId }).eq('id', pagador.id)
        }
      }

      const mes = new Date(mens.competencia + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const { id: codigoAsaas, invoiceUrl } = await criarCobranca({
        customerId,
        valor: Number(mens.valor),
        vencimento: mens.vencimento,
        descricao: `Mensalidade ${mes} — ${aluno.nome}`,
        externalReference: `mensalidade:${mens.id}`,
      })

      await supabase.from('mensalidades').update({
        codigo_asaas: codigoAsaas,
        link_pagamento: invoiceUrl,
      } as any).eq('id', mens.id)

      lancadas++
    } catch (e: any) {
      erros.push(e?.message ?? 'erro desconhecido')
    }
  }

  revalidatePath(`/painel/alunos/${alunoId}`)
  return { lancadas, erros }
}

// ── AbaFinanceiro: baixa manual presencial ───────────────────
export async function darBaixaMensalidade(
  mensalidadeId: string,
  forma: string,
  alunoId: string,
) {
  const supabase = createServiceClient()

  const { data: mens } = await supabase
    .from('mensalidades')
    .select('valor')
    .eq('id', mensalidadeId)
    .single()

  if (!mens) throw new Error('Mensalidade não encontrada')

  await supabase.from('mensalidades').update({
    status: 'recebida',
    valor_pago: mens.valor,
    pago_em: new Date().toISOString(),
  }).eq('id', mensalidadeId)

  await supabase.from('pagamentos').insert({
    mensalidade_id: mensalidadeId,
    valor: mens.valor,
    forma: forma as any,
    data_pagamento: new Date().toISOString().split('T')[0],
  })

  revalidatePath(`/painel/alunos/${alunoId}`)
  revalidatePath('/painel/financeiro')
}

// ── BotaoEnviarContrato ──────────────────────────────────────
export async function enviarContratoManual(
  alunoId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = createServiceClient()

    const { data: aluno, error: errAluno } = await supabase
      .from('alunos')
      .select(`
        nome, data_nascimento, cpf, endereco, bairro, cep, email,
        responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(nome, cpf, celular, email)
      `)
      .eq('id', alunoId)
      .single()

    if (errAluno || !aluno) return { error: 'Aluno não encontrado' }

    const { data: matricula, error: errMat } = await supabase
      .from('matriculas')
      .select('id, plano, data_inicio, dia_vencimento, valor_final')
      .eq('aluno_id', alunoId)
      .eq('status', 'ativa')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (errMat || !matricula) return { error: 'Nenhuma matrícula ativa encontrada' }

    const { data: turmasData } = await supabase
      .from('matricula_turmas')
      .select('turmas(nome, modalidades(nome), turma_horarios(dia_semana, hora_inicio, hora_fim))')
      .eq('matricula_id', matricula.id)

    const responsavel = (aluno as any).responsavel_principal
    const emailDestino = responsavel?.email || aluno.email
    if (!emailDestino) return { error: 'Nenhum e-mail disponível para envio' }

    const turmasNomes = turmasData?.map((mt: any) => mt.turmas?.nome).filter(Boolean).join(', ') ?? ''
    const modalidadesNomes = [...new Set(
      turmasData?.map((mt: any) => mt.turmas?.modalidades?.nome).filter(Boolean)
    )].join(', ')

    const totalHoras = turmasData?.reduce((acc: number, mt: any) => {
      const horarios = mt.turmas?.turma_horarios ?? []
      return acc + horarios.reduce((h: number, hr: any) => {
        const [ih, im] = (hr.hora_inicio ?? '00:00').split(':').map(Number)
        const [fh, fm] = (hr.hora_fim ?? '00:00').split(':').map(Number)
        return h + ((fh * 60 + fm) - (ih * 60 + im)) / 60
      }, 0)
    }, 0) ?? 0

    const duracaoLabel: Record<string, string> = {
      mensal: '1 mês', trimestral: '3 meses',
      semestral: '6 meses', anual: '12 meses', fidelidade: '12 meses',
    }

    const submission = await criarSubmission('contrato_matricula', [{
      email: emailDestino,
      role: 'Responsável',
      values: {
        nome_responsavel: responsavel?.nome ?? aluno.nome,
        data_nascimento:  (aluno as any).data_nascimento ?? '',
        cpf:              responsavel?.cpf ?? (aluno as any).cpf ?? '',
        endereco:         (aluno as any).endereco ?? '',
        cep:              (aluno as any).cep ?? '',
        bairro:           (aluno as any).bairro ?? '',
        cidade:           'Rio de Janeiro',
        celular:          responsavel?.celular ?? '',
        email:            emailDestino,
        nome_aluno:       aluno.nome,
        modalidades:      modalidadesNomes,
        turmas:           turmasNomes,
        carga_horaria:    `${totalHoras.toFixed(1)}h/semana`,
        data_inicio:      (matricula as any).data_inicio,
        duracao_plano:    duracaoLabel[(matricula as any).plano] ?? (matricula as any).plano,
        dia_vencimento:   String((matricula as any).dia_vencimento),
        valor_mensal:     `R$ ${((matricula as any).valor_final as number).toFixed(2).replace('.', ',')}`,
        data_contrato:    new Date().toLocaleDateString('pt-BR'),
      },
    }])

    const signerSlug = submission.submitters?.[0]?.slug
    const docusealUrl = signerSlug
      ? `${process.env.DOCUSEAL_URL}/s/${signerSlug}`
      : `${process.env.DOCUSEAL_URL}/submissions/${submission.id}`

    await supabase.from('documentos_aluno').insert({
      aluno_id:                alunoId,
      tipo:                    'contrato',
      nome:                    `Contrato — ${aluno.nome}`,
      observacao:              `Matrícula ${matricula.id} · ${duracaoLabel[(matricula as any).plano] ?? (matricula as any).plano} · ${modalidadesNomes}`,
      docuseal_submission_id:  String(submission.id),
      docuseal_url:            docusealUrl,
      docuseal_status:         'pendente',
    } as any)

    revalidatePath(`/painel/alunos/${alunoId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err?.message ?? 'Erro desconhecido' }
  }
}
