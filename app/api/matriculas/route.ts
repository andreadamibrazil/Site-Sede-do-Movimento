import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

function gerarMensalidades(matriculaId: string, inicio: string, meses: number, valor: number, vencimento: number) {
  const mensalidades = []
  const dataBase = new Date(inicio)
  for (let i = 0; i < meses; i++) {
    const competencia = new Date(dataBase)
    competencia.setMonth(competencia.getMonth() + i)
    const venc = new Date(competencia.getFullYear(), competencia.getMonth(), vencimento)
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

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const {
    alunoId, plano, dataInicio, diaVencimento, valorFinal,
    tipoDesconto, percentualDesconto, observacaoDesconto,
    turmaIds, meses,
  } = await req.json()

  if (!alunoId || !turmaIds?.length) {
    return NextResponse.json({ error: 'alunoId e turmaIds obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient()

  // 1. Cria matrícula
  const { data: matricula, error: errMat } = await sb
    .from('matriculas')
    .insert({
      aluno_id: alunoId,
      plano,
      data_inicio: dataInicio,
      dia_vencimento: Number(diaVencimento),
      valor_final: valorFinal,
      tipo_desconto: tipoDesconto || null,
      percentual_desconto: percentualDesconto ? Number(percentualDesconto) : 0,
      observacao_desconto: observacaoDesconto || null,
      status: 'ativa',
    })
    .select('id')
    .single()

  if (errMat) return NextResponse.json({ error: errMat.message }, { status: 500 })

  // 2. Vincula turmas
  const { error: errTurmas } = await sb.from('matricula_turmas').insert(
    turmaIds.map((turmaId: string) => ({
      matricula_id: matricula.id,
      turma_id: turmaId,
      data_entrada: dataInicio,
    }))
  )
  if (errTurmas) {
    await sb.from('matriculas').delete().eq('id', matricula.id)
    return NextResponse.json({ error: 'Erro ao vincular turmas: ' + errTurmas.message }, { status: 500 })
  }

  // 3. Gera mensalidades
  const mensalidades = gerarMensalidades(matricula.id, dataInicio, meses, valorFinal, Number(diaVencimento))
  const { error: errMens } = await sb.from('mensalidades').insert(mensalidades)
  if (errMens) {
    return NextResponse.json({
      ok: true,
      matricula_id: matricula.id,
      warning: 'Matrícula criada mas mensalidades falharam: ' + errMens.message,
    })
  }

  return NextResponse.json({ ok: true, matricula_id: matricula.id })
}
