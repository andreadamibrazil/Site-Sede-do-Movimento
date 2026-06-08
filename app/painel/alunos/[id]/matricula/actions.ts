'use server'

import { createServiceClient } from '@/lib/supabase/server'

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

  // Dispara DocuSeal via n8n — fire-and-forget intencional
  fetch('https://n8n.sededomovimento.art/webhook/matricula-criada', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aluno_id: dados.alunoId,
      matricula_id: matricula.id,
      aluno_nome: dados.alunoNome,
      aluno_email: dados.alunoEmail,
      aluno_whatsapp: dados.alunoWhatsapp,
      plano: dados.plano,
      valor_mensal: dados.valorFinal,
    }),
  }).catch(() => {})

  return { success: true, matriculaId: matricula.id }
}
