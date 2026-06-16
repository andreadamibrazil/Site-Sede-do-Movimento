import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { FERIADOS_RJ } from '@/lib/feriados'

// POST /api/folha-pagamento/gerar — restrito a admins
export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const sb = createServiceClient()
  const { professor_id, mes } = await req.json()
  if (!professor_id || !mes) return NextResponse.json({ error: 'professor_id e mes obrigatórios' }, { status: 400 })

  const [ano, mesNum] = mes.split('-').map(Number)
  const inicioMes = new Date(ano, mesNum - 1, 1)
  const fimMes = new Date(ano, mesNum, 0)
  const inicioStr = inicioMes.toISOString().slice(0, 10)
  const fimStr = fimMes.toISOString().slice(0, 10)

  // Remove folha existente (rascunho) para regenerar
  await sb.from('folhas_pagamento')
    .delete()
    .eq('professor_id', professor_id)
    .eq('mes_referencia', inicioStr)
    .eq('status', 'rascunho')

  // Se ainda existe folha (status != rascunho), não pode regenerar
  const { data: existente } = await sb
    .from('folhas_pagamento')
    .select('id, status')
    .eq('professor_id', professor_id)
    .eq('mes_referencia', inicioStr)
    .maybeSingle()
  if (existente) {
    return NextResponse.json({
      error: `Folha com status "${existente.status}" não pode ser regenerada. Acesse a folha para editar ou marcar como rascunho primeiro.`,
    }, { status: 409 })
  }

  // Busca turmas do professor (para fallback quando aulas.professor_id não está preenchido)
  const { data: turmasDoProf } = await sb
    .from('turmas')
    .select('id')
    .eq('professor_id', professor_id)

  const turmaIds_prof = (turmasDoProf ?? []).map((t: any) => t.id as string)

  // Busca turmas via co-regência (turma_professores)
  const { data: turmaProfs } = await (sb as any)
    .from('turma_professores')
    .select('turma_id')
    .eq('professor_id', professor_id)

  const turmaIds_coregencia = ((turmaProfs ?? []) as any[])
    .map((t: any) => t.turma_id as string)
    .filter((id: string) => !turmaIds_prof.includes(id))

  // Query 1: aulas com professor_id explícito
  const { data: aulas1 } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, turma_id, status, turmas(nome)')
    .eq('professor_id', professor_id)
    .neq('status', 'cancelada')
    .gte('data', inicioStr)
    .lte('data', fimStr)

  // Query 2: aulas via turma (inclui independente do professor_id na aula — cobre casos onde
  // a turma foi reatribuída a outro professor mas as aulas ainda têm o professor antigo)
  const { data: aulas2 } = turmaIds_prof.length > 0
    ? await sb
        .from('aulas')
        .select('id, data, hora_inicio, hora_fim, turma_id, status, turmas(nome)')
        .in('turma_id', turmaIds_prof)
        .neq('status', 'cancelada')
        .gte('data', inicioStr)
        .lte('data', fimStr)
    : { data: [] }

  // Query 3: aulas via co-regência (turma_professores — Maju/Morvan/Douglas style)
  const { data: aulas3 } = turmaIds_coregencia.length > 0
    ? await sb
        .from('aulas')
        .select('id, data, hora_inicio, hora_fim, turma_id, status, turmas(nome)')
        .in('turma_id', turmaIds_coregencia)
        .neq('status', 'cancelada')
        .gte('data', inicioStr)
        .lte('data', fimStr)
    : { data: [] }

  // Deduplica por id
  const aulaMap = new Map<string, any>()
  for (const a of [...(aulas1 ?? []), ...(aulas2 ?? []), ...(aulas3 ?? [])]) aulaMap.set(a.id, a)
  const aulas = [...aulaMap.values()].sort((a, b) => a.data.localeCompare(b.data))

  // Substituições do professor neste mês (atestado, substituto ou falta injustificada)
  const aulaIds = aulas.map((a: any) => a.id)
  const { data: substituicoes } = aulaIds.length > 0
    ? await sb.from('substituicoes')
        .select('aula_id, tem_atestado, professor_substituto_id')
        .in('aula_id', aulaIds)
        .eq('professor_ausente_id', professor_id)
    : { data: [] }

  const substituicoesMap: Record<string, { tem_atestado: boolean; professor_substituto_id: string | null }> = {}
  for (const s of (substituicoes ?? [])) {
    substituicoesMap[(s as any).aula_id] = {
      tem_atestado: (s as any).tem_atestado,
      professor_substituto_id: (s as any).professor_substituto_id,
    }
  }

  // Faixas de hora/aula
  const { data: faixas } = await sb
    .from('faixas_hora_aula')
    .select('*')
    .eq('ativo', true)
    .order('min_alunos')

  function calcularValorHora(numAlunos: number, turmaId: string): { valor: number; bonus: number; piso: number } {
    const faixasTurma = (faixas ?? []).filter((f: any) => f.turma_id === turmaId)
    const faixasGlobais = (faixas ?? []).filter((f: any) => !f.turma_id)
    const pool = faixasTurma.length > 0 ? faixasTurma : faixasGlobais
    const faixa = pool.find((f: any) =>
      numAlunos >= f.min_alunos && (f.max_alunos === null || numAlunos <= f.max_alunos)
    ) ?? pool[0]
    const valorHora = faixa?.valor_hora ?? 31.50
    const piso = [...pool].sort((a: any, b: any) => a.min_alunos - b.min_alunos)[0]?.valor_hora ?? 31.50
    return { valor: valorHora, bonus: Math.max(0, valorHora - piso), piso }
  }

  // Conta alunos matriculados por turma no mês — paralelo para evitar N+1 queries
  const turmaIds = [...new Set(aulas.map((a: any) => a.turma_id as string))]
  const contagensParalelas = await Promise.all(
    turmaIds.map(async (turmaId) => {
      const { count } = await sb
        .from('matricula_turmas')
        .select('id', { count: 'exact', head: true })
        .eq('turma_id', turmaId)
        .lte('data_entrada', fimStr)
        .or(`data_saida.is.null,data_saida.gte.${inicioStr}`)
      return [turmaId, count ?? 0] as const
    })
  )
  const alunosPorTurma: Record<string, number> = Object.fromEntries(contagensParalelas)

  // Valor fixo do professor
  const { data: prof } = await (sb as any)
    .from('professores')
    .select('nome, valor_base, forma_pagamento, valor_transporte')
    .eq('id', professor_id)
    .single()

  // Monta itens — inclui TODAS as aulas (concluídas e sem chamada)
  const itens: any[] = []
  let totalAulas = 0

  for (const aula of aulas) {
    const sub = substituicoesMap[aula.id]
    const isConcluida = aula.status === 'concluida'
    const nomeFeriado = FERIADOS_RJ[aula.data]

    // Determina motivo e se deve pagar
    let pago: boolean
    let motivo: string | null = null

    if (sub) {
      if (sub.tem_atestado) {
        // Professor faltou mas tem atestado — recebe normalmente
        pago = true
        motivo = 'atestado'
      } else if (sub.professor_substituto_id) {
        // Professor mandou substituto — recebe normalmente
        pago = true
        motivo = 'substituicao'
      } else {
        // Falta injustificada — não pago
        pago = false
        motivo = 'falta_injustificada'
      }
    } else if (!isConcluida) {
      // Aula não concluída (chamada não lançada) — admin decide
      pago = false
      motivo = nomeFeriado ? 'feriado' : 'sem_chamada'
    } else {
      // Aula concluída normalmente — pago
      pago = true
      motivo = null
    }

    const numAlunos = alunosPorTurma[aula.turma_id] ?? 0
    const { valor: valorHora, bonus: bonusHora, piso: pisoHora } = calcularValorHora(numAlunos, aula.turma_id)

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
      valor_hora_base: pisoHora,
      bonus_hora: bonusHora,
      valor_hora_efetivo: valorHora,
      descricao: motivo,
      valor,
      pago,
    })

    totalAulas += valor
  }

  // Valor fixo (coordenação etc)
  let totalFixo = 0
  if (prof?.forma_pagamento === 'fixo_mensal') {
    const valorFixo = prof?.valor_base ?? 0
    if (valorFixo > 0) {
      itens.push({ tipo: 'fixo', descricao: 'Valor fixo mensal', valor: valorFixo, pago: true })
      totalFixo = valorFixo
    }
  }

  // Transporte mensal (campo valor_transporte no perfil do professor)
  const valorTransporte = Math.round(Number((prof as any)?.valor_transporte ?? 0) * 100) / 100
  if (valorTransporte > 0) {
    itens.push({ tipo: 'fixo', descricao: 'Transporte / passagem mensal', valor: valorTransporte, pago: true })
    totalFixo += valorTransporte
  }

  const totalGeral = Math.round((totalAulas + totalFixo) * 100) / 100

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
    aulas_encontradas: aulas.length,
  })
}
