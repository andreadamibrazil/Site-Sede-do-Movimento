'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { criarSubmission } from '@/lib/docuseal'

type MatriculaDados = {
  alunoId: string
  alunoNome: string
  alunoEmail: string | null
  alunoWhatsapp: string | null
  turmaIds: string[]
  plano: string
  dataInicio: string
  diaVencimento: number
  valorFinal: number
  tipoDesconto: string | null
  percentualDesconto: number
  observacaoDesconto: string | null
}

function gerarMensalidades(
  matriculaId: string,
  inicio: string,
  meses: number,
  valor: number,
  diaVencimento: number,
) {
  const mensalidades = []
  const dataBase = new Date(inicio)
  for (let i = 0; i < meses; i++) {
    const competencia = new Date(dataBase)
    competencia.setMonth(competencia.getMonth() + i)
    const venc = new Date(competencia.getFullYear(), competencia.getMonth(), diaVencimento)
    mensalidades.push({
      matricula_id: matriculaId,
      competencia: `${competencia.getFullYear()}-${String(competencia.getMonth() + 1).padStart(2, '0')}-01`,
      valor,
      vencimento: venc.toISOString().split('T')[0],
      status: 'aberta' as const,
    })
  }
  return mensalidades
}

async function enviarContratoDocuSeal(
  supabase: ReturnType<typeof createServiceClient>,
  matriculaId: string,
  dados: MatriculaDados,
) {
  // Busca dados completos do aluno + responsável principal
  const { data: aluno } = await supabase
    .from('alunos')
    .select(`
      data_nascimento, cpf, endereco, bairro, cep,
      responsavel_principal_id,
      responsaveis!alunos_responsavel_principal_id_fkey (
        nome, cpf, celular, email, parentesco
      )
    `)
    .eq('id', dados.alunoId)
    .single()

  // Busca turmas da matrícula com modalidades
  const { data: turmasData } = await supabase
    .from('matricula_turmas')
    .select('turmas(nome, modalidades(nome), turma_horarios(dia_semana, hora_inicio, hora_fim))')
    .eq('matricula_id', matriculaId)

  const turmasNomes = turmasData?.map((mt: any) => mt.turmas?.nome).filter(Boolean).join(', ') ?? ''
  const modalidadesNomes = [...new Set(turmasData?.map((mt: any) => mt.turmas?.modalidades?.nome).filter(Boolean))].join(', ')

  // Calcula carga horária semanal
  const totalHoras = turmasData?.reduce((acc: number, mt: any) => {
    const horarios = mt.turmas?.turma_horarios ?? []
    return acc + horarios.reduce((h: number, hr: any) => {
      const [ih, im] = (hr.hora_inicio ?? '00:00').split(':').map(Number)
      const [fh, fm] = (hr.hora_fim ?? '00:00').split(':').map(Number)
      return h + ((fh * 60 + fm) - (ih * 60 + im)) / 60
    }, 0)
  }, 0) ?? 0

  const responsavel = (aluno as any)?.responsaveis
  const emailDestino = responsavel?.email || dados.alunoEmail
  if (!emailDestino) return

  const duracaoLabel: Record<string, string> = {
    mensal: '1 mês', trimestral: '3 meses',
    semestral: '6 meses', anual: '12 meses', fidelidade: '12 meses',
  }
  const dataContrato = new Date().toLocaleDateString('pt-BR')

  await criarSubmission('contrato_matricula', [{
    email: emailDestino,
    role: 'Responsável',
    values: {
      nome_responsavel:  responsavel?.nome ?? dados.alunoNome,
      data_nascimento:   aluno?.data_nascimento ?? '',
      cpf:               responsavel?.cpf ?? aluno?.cpf ?? '',
      endereco:          aluno?.endereco ?? '',
      cep:               aluno?.cep ?? '',
      bairro:            aluno?.bairro ?? '',
      cidade:            'Rio de Janeiro',
      celular:           responsavel?.celular ?? '',
      email:             emailDestino,
      nome_aluno:        dados.alunoNome,
      modalidades:       modalidadesNomes,
      turmas:            turmasNomes,
      carga_horaria:     `${totalHoras.toFixed(1)}h/semana`,
      data_inicio:       dados.dataInicio,
      duracao_plano:     duracaoLabel[dados.plano] ?? dados.plano,
      dia_vencimento:    String(dados.diaVencimento),
      valor_mensal:      `R$ ${dados.valorFinal.toFixed(2).replace('.', ',')}`,
      data_contrato:     dataContrato,
    },
  }])
}

export async function criarMatricula(dados: MatriculaDados) {
  const supabase = createServiceClient()
  const meses = dados.plano === 'fidelidade' ? 12 : 1

  const { data: matricula, error: errMat } = await supabase
    .from('matriculas')
    .insert({
      aluno_id: dados.alunoId,
      plano: dados.plano as any,
      data_inicio: dados.dataInicio,
      dia_vencimento: dados.diaVencimento,
      valor_final: dados.valorFinal,
      tipo_desconto: dados.tipoDesconto as any || null,
      percentual_desconto: dados.percentualDesconto,
      observacao_desconto: dados.observacaoDesconto || null,
      status: 'ativa' as const,
    })
    .select('id')
    .single()

  if (errMat) return { error: errMat.message }

  const { error: errTurmas } = await supabase
    .from('matricula_turmas')
    .insert(
      dados.turmaIds.map(turmaId => ({
        matricula_id: matricula.id,
        turma_id: turmaId,
        data_entrada: dados.dataInicio,
      }))
    )

  if (errTurmas) return { error: `Matrícula criada mas turmas falharam: ${errTurmas.message}` }

  const mensalidades = gerarMensalidades(
    matricula.id,
    dados.dataInicio,
    meses,
    dados.valorFinal,
    dados.diaVencimento,
  )

  const { error: errMens } = await supabase.from('mensalidades').insert(mensalidades)

  if (errMens) return { error: `Matrícula criada mas mensalidades falharam: ${errMens.message}` }

  // Dispara contrato DocuSeal — fire-and-forget intencional
  enviarContratoDocuSeal(supabase, matricula.id, dados).catch(() => {})

  return { success: true, matriculaId: matricula.id }
}
