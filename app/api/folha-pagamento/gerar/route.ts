import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/folha-pagamento/gerar — restrito a admins
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const sb = createServiceClient() as any
  const { professor_id, mes } = await req.json()
  if (!professor_id || !mes) return NextResponse.json({ error: 'professor_id e mes obrigatórios' }, { status: 400 })

  const [ano, mesNum] = mes.split('-').map(Number)
  const inicioMes = new Date(ano, mesNum - 1, 1)
  const fimMes = new Date(ano, mesNum, 0) // último dia
  const inicioStr = inicioMes.toISOString().slice(0, 10)
  const fimStr = fimMes.toISOString().slice(0, 10)

  // Remove folha existente (rascunho) para regenerar
  await sb.from('folhas_pagamento')
    .delete()
    .eq('professor_id', professor_id)
    .eq('mes_referencia', inicioStr)
    .eq('status', 'rascunho')

  // Busca aulas do professor no mês
  const { data: aulas } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, turma_id, status, turmas(nome)')
    .eq('professor_id', professor_id)
    .eq('status', 'concluida')
    .gte('data', inicioStr)
    .lte('data', fimStr)

  // Busca substituições (faltas sem atestado = não pago)
  const aulaIds = (aulas ?? []).map((a: any) => a.id)
  const { data: substituicoes } = aulaIds.length > 0
    ? await sb.from('substituicoes')
        .select('aula_id, tem_atestado, professor_substituto_id')
        .in('aula_id', aulaIds)
        .eq('professor_ausente_id', professor_id)
    : { data: [] }

  const faltasInjustificadas = new Set(
    (substituicoes ?? [])
      .filter((s: any) => !s.tem_atestado && !s.professor_substituto_id)
      .map((s: any) => s.aula_id)
  )

  // Faixas de hora/aula (globais + específicas por turma)
  const { data: faixas } = await sb
    .from('faixas_hora_aula')
    .select('*')
    .eq('ativo', true)
    .order('min_alunos')

  function calcularValorHora(numAlunos: number, turmaId: string): { valor: number; bonus: number } {
    const faixasTurma = (faixas ?? []).filter((f: any) => f.turma_id === turmaId)
    const faixasGlobais = (faixas ?? []).filter((f: any) => !f.turma_id)
    const pool = faixasTurma.length > 0 ? faixasTurma : faixasGlobais
    const faixa = pool.find((f: any) =>
      numAlunos >= f.min_alunos && (f.max_alunos === null || numAlunos <= f.max_alunos)
    ) ?? pool[0]
    const valorHora = faixa?.valor_hora ?? 31.50
    const piso = pool.sort((a: any, b: any) => a.min_alunos - b.min_alunos)[0]?.valor_hora ?? 31.50
    return { valor: valorHora, bonus: Math.max(0, valorHora - piso) }
  }

  // Para cada turma, conta alunos com mês completo
  const turmaIds = [...new Set((aulas ?? []).map((a: any) => a.turma_id))]
  const alunosPorTurma: Record<string, number> = {}

  for (const turmaId of turmaIds) {
    const { count } = await sb
      .from('matricula_turmas')
      .select('id', { count: 'exact', head: true })
      .eq('turma_id', turmaId)
      .lte('data_entrada', inicioStr)      // entrou antes ou no início do mês
      .or(`data_saida.is.null,data_saida.gte.${fimStr}`) // ainda ativo no fim do mês
    alunosPorTurma[turmaId] = count ?? 0
  }

  // Busca valor fixo do professor (coordenação etc)
  const { data: prof } = await sb
    .from('professores')
    .select('nome, valor_base, forma_pagamento')
    .eq('id', professor_id)
    .single()

  // Monta itens
  const itens: any[] = []
  let totalAulas = 0

  for (const aula of (aulas ?? [])) {
    const pago = !faltasInjustificadas.has(aula.id)
    const numAlunos = alunosPorTurma[aula.turma_id] ?? 0
    const { valor: valorHora, bonus: bonusHora } = calcularValorHora(numAlunos, aula.turma_id)

    // Calcula horas (diferença entre hora_fim e hora_inicio)
    const [hi, mi] = (aula.hora_inicio ?? '00:00').split(':').map(Number)
    const [hf, mf] = (aula.hora_fim ?? '00:00').split(':').map(Number)
    const horasAula = ((hf * 60 + mf) - (hi * 60 + mi)) / 60

    const valor = pago ? Math.round(horasAula * valorHora * 100) / 100 : 0

    itens.push({
      tipo: 'aula',
      turma_id: aula.turma_id,
      aula_id: aula.id,
      data_aula: aula.data,
      hora_inicio: aula.hora_inicio,
      hora_fim: aula.hora_fim,
      horas_aula: horasAula,
      num_alunos_mes: numAlunos,
      valor_hora_base: 31.50,
      bonus_hora: bonusHora,
      valor_hora_efetivo: valorHora,
      descricao: (aula.turmas as any)?.nome,
      valor,
      pago,
    })

    totalAulas += valor
  }

  // Valor fixo (coordenação, etc)
  let totalFixo = 0
  if (prof?.forma_pagamento === 'fixo_mais_hora' || prof?.forma_pagamento === 'fixo') {
    const valorFixo = prof?.valor_base ?? 0
    if (valorFixo > 0) {
      itens.push({ tipo: 'fixo', descricao: 'Coordenação / valor fixo mensal', valor: valorFixo, pago: true })
      totalFixo = valorFixo
    }
  }

  const totalGeral = Math.round((totalAulas + totalFixo) * 100) / 100

  // Cria folha
  const { data: folha, error } = await sb
    .from('folhas_pagamento')
    .insert({
      professor_id,
      mes_referencia: inicioStr,
      status: 'rascunho',
      valor_aulas: totalAulas,
      valor_fixo: totalFixo,
      valor_total: totalGeral,
    })
    .select('id')
    .single()

  if (error || !folha) return NextResponse.json({ error: error?.message ?? 'Erro ao criar folha' }, { status: 500 })

  // Insere itens
  if (itens.length > 0) {
    await sb.from('itens_folha').insert(itens.map((i: any) => ({ ...i, folha_id: folha.id })))
  }

  return NextResponse.json({
    ok: true,
    folha_id: folha.id,
    professor: prof?.nome,
    mes,
    total_aulas: totalAulas,
    total_fixo: totalFixo,
    total: totalGeral,
    num_itens: itens.length,
  })
}
