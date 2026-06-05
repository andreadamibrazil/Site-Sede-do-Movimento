import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth/requireStaff'

export interface CheckResult {
  id: string
  nome: string
  descricao: string
  nivel: 'critico' | 'atencao' | 'ok'
  count: number
  itens: { label: string; href?: string }[]
}

export async function GET() {
  const guard = await requireStaff()
  if (guard) return guard

  const sb = createServiceClient() as any
  const resultados: CheckResult[] = []

  // 1. Turmas ativas sem professor
  {
    const { data } = await sb
      .from('turmas')
      .select('id, nome')
      .eq('ativa', true)
      .is('professor_id', null)
    resultados.push({
      id: 'turmas_sem_professor',
      nome: 'Turmas sem professor',
      descricao: 'Turmas ativas que ainda não têm professor atribuído.',
      nivel: data?.length ? 'critico' : 'ok',
      count: data?.length ?? 0,
      itens: (data ?? []).map((t: any) => ({ label: t.nome, href: `/painel/turmas/${t.id}` })),
    })
  }

  // 2. Turmas ativas sem plano de aula
  {
    const { data: turmas } = await sb.from('turmas').select('id, nome').eq('ativa', true)
    const { data: planos } = await sb.from('planos_aula').select('turma_id')
    const comPlano = new Set((planos ?? []).map((p: any) => p.turma_id))
    const semPlano = (turmas ?? []).filter((t: any) => !comPlano.has(t.id))
    resultados.push({
      id: 'turmas_sem_plano',
      nome: 'Turmas sem plano de aula',
      descricao: 'Turmas ativas que ainda não receberam o plano de aula do professor.',
      nivel: semPlano.length > 0 ? 'atencao' : 'ok',
      count: semPlano.length,
      itens: semPlano.map((t: any) => ({ label: t.nome, href: `/painel/turmas/${t.id}` })),
    })
  }

  // 3. Aulas passadas sem chamada (últimos 60 dias)
  {
    const { data: turmas } = await sb.from('turmas').select('id').eq('ativa', true)
    const turmaIds = (turmas ?? []).map((t: any) => t.id)
    const sessenta = new Date()
    sessenta.setDate(sessenta.getDate() - 60)
    const { data: aulas } = await sb
      .from('aulas')
      .select('id, data, turmas(nome)')
      .in('turma_id', turmaIds)
      .lt('data', new Date().toISOString().split('T')[0])
      .gte('data', sessenta.toISOString().split('T')[0])
    const aulaIds = (aulas ?? []).map((a: any) => a.id)
    let semChamada: any[] = []
    if (aulaIds.length > 0) {
      const { data: presencas } = await sb
        .from('presencas')
        .select('aula_id')
        .in('aula_id', aulaIds)
      const comChamada = new Set((presencas ?? []).map((p: any) => p.aula_id))
      semChamada = (aulas ?? []).filter((a: any) => !comChamada.has(a.id))
    }
    resultados.push({
      id: 'aulas_sem_chamada',
      nome: 'Aulas passadas sem chamada',
      descricao: 'Aulas dos últimos 60 dias que não têm registro de chamada.',
      nivel: semChamada.length > 5 ? 'atencao' : 'ok',
      count: semChamada.length,
      itens: semChamada.slice(0, 20).map((a: any) => ({
        label: `${a.turmas?.nome ?? 'Turma'} — ${a.data}`,
        href: `/painel/chamada/${a.id}`,
      })),
    })
  }

  // 4. Alunos com matrícula ativa mas sem mensalidade no mês corrente
  {
    const mes = new Date().toISOString().slice(0, 7) // YYYY-MM
    const { data: matriculas } = await sb
      .from('matriculas')
      .select('id, aluno_id, alunos(nome)')
      .eq('status', 'ativa')
    const { data: mensalidades } = await sb
      .from('mensalidades')
      .select('matricula_id')
      .like('mes_referencia', `${mes}%`)
    const comMensalidade = new Set((mensalidades ?? []).map((m: any) => m.matricula_id))
    const semMensalidade = (matriculas ?? []).filter((m: any) => !comMensalidade.has(m.id))
    resultados.push({
      id: 'matriculas_sem_mensalidade',
      nome: 'Matrículas ativas sem mensalidade este mês',
      descricao: `Alunos com matrícula ativa mas sem cobrança gerada para ${mes}.`,
      nivel: semMensalidade.length > 0 ? 'atencao' : 'ok',
      count: semMensalidade.length,
      itens: semMensalidade.slice(0, 20).map((m: any) => ({
        label: m.alunos?.nome ?? 'Aluno',
        href: `/painel/alunos/${m.aluno_id}`,
      })),
    })
  }

  // 5. Mensalidades vencidas sem pagamento (últimos 90 dias)
  {
    const noventa = new Date()
    noventa.setDate(noventa.getDate() - 90)
    const { data } = await sb
      .from('mensalidades')
      .select('id, aluno_id, vencimento, alunos(nome)')
      .eq('status', 'pendente')
      .lt('vencimento', new Date().toISOString().split('T')[0])
      .gte('vencimento', noventa.toISOString().split('T')[0])
    resultados.push({
      id: 'mensalidades_vencidas',
      nome: 'Mensalidades vencidas',
      descricao: 'Mensalidades com vencimento passado e status pendente (últimos 90 dias).',
      nivel: (data?.length ?? 0) > 0 ? 'critico' : 'ok',
      count: data?.length ?? 0,
      itens: (data ?? []).slice(0, 20).map((m: any) => ({
        label: `${m.alunos?.nome ?? 'Aluno'} — venc. ${m.vencimento}`,
        href: `/painel/financeiro`,
      })),
    })
  }

  // 6. Reposições sem data definida
  {
    const { data } = await sb
      .from('reposicoes')
      .select('id, alunos(nome), turmas(nome)')
      .is('data_reposicao', null)
      .neq('status', 'cancelada')
    resultados.push({
      id: 'reposicoes_sem_data',
      nome: 'Reposições pendentes sem data',
      descricao: 'Reposições aprovadas que ainda não têm data agendada.',
      nivel: (data?.length ?? 0) > 0 ? 'atencao' : 'ok',
      count: data?.length ?? 0,
      itens: (data ?? []).map((r: any) => ({
        label: `${r.alunos?.nome ?? 'Aluno'} → ${r.turmas?.nome ?? 'Turma'}`,
      })),
    })
  }

  // 7. Professores ativos sem turma
  {
    const { data: profs } = await sb
      .from('professores')
      .select('id, nome')
      .eq('ativo', true)
    const { data: turmas } = await sb
      .from('turmas')
      .select('professor_id')
      .eq('ativa', true)
      .not('professor_id', 'is', null)
    const comTurma = new Set((turmas ?? []).map((t: any) => t.professor_id))
    const semTurma = (profs ?? []).filter((p: any) => !comTurma.has(p.id))
    resultados.push({
      id: 'professores_sem_turma',
      nome: 'Professores sem turma ativa',
      descricao: 'Professores cadastrados como ativos mas sem nenhuma turma atribuída.',
      nivel: semTurma.length > 0 ? 'atencao' : 'ok',
      count: semTurma.length,
      itens: semTurma.map((p: any) => ({ label: p.nome, href: `/painel/professores/${p.id}` })),
    })
  }

  // 8. Documentos de alunos sem análise Gemini
  {
    const { data } = await sb
      .from('documentos_aluno')
      .select('id, tipo, alunos(nome)')
      .is('gemini_dados', null)
      .neq('status', 'rejeitado')
    resultados.push({
      id: 'documentos_nao_analisados',
      nome: 'Documentos sem análise de IA',
      descricao: 'Documentos enviados por alunos que ainda não foram processados pelo Gemini.',
      nivel: (data?.length ?? 0) > 0 ? 'atencao' : 'ok',
      count: data?.length ?? 0,
      itens: (data ?? []).slice(0, 10).map((d: any) => ({
        label: `${d.alunos?.nome ?? 'Aluno'} — ${d.tipo}`,
      })),
    })
  }

  const criticos = resultados.filter(r => r.nivel === 'critico').reduce((s, r) => s + r.count, 0)
  const atencoes = resultados.filter(r => r.nivel === 'atencao').reduce((s, r) => s + r.count, 0)

  return NextResponse.json({ resultados, criticos, atencoes, rodadoEm: new Date().toISOString() })
}
