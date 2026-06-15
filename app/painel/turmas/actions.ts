'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarStatusTurma(turmaId: string, status: 'ativa' | 'suspensa' | 'encerrada') {
  const supabase = createServiceClient()
  const { error } = await supabase.from('turmas').update({ status }).eq('id', turmaId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/turmas')
  revalidatePath(`/painel/turmas/${turmaId}`)
}

export async function removerAlunoDaTurma(matriculaTurmaId: string, turmaId: string) {
  const supabase = createServiceClient()
  const hoje = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('matricula_turmas')
    .update({ data_saida: hoje })
    .eq('id', matriculaTurmaId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/turmas/${turmaId}`)
}

export async function atualizarPrecoPadrao(turmaId: string, preco: number) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('turmas')
    .update({ preco_padrao: preco })
    .eq('id', turmaId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/turmas')
}

export async function criarTurma(data: {
  nome: string
  modalidade_id: string
  professor_id?: string | null
  sala_id?: string | null
  capacidade?: number
  nivel?: string | null
  preco_padrao: number
  status?: string
  descricao?: string | null
  data_inicio?: string | null
  data_fim?: string | null
  horarios?: { dia_semana: string; hora_inicio: string; hora_fim: string }[]
}) {
  const supabase = createServiceClient()
  const { horarios, ...turmaData } = data
  const { data: nova, error } = await supabase
    .from('turmas')
    .insert(turmaData as any)
    .select('id')
    .single()
  if (error) throw new Error(error.message)

  if (horarios?.length) {
    const { error: hError } = await supabase
      .from('turma_horarios')
      .insert(horarios.map(h => ({ ...h, turma_id: nova.id })) as any)
    if (hError) throw new Error(hError.message)
  }

  revalidatePath('/painel/turmas')
  return nova.id
}

export async function editarTurma(
  turmaId: string,
  data: {
    nome?: string
    modalidade_id?: string
    professor_id?: string | null
    sala_id?: string | null
    capacidade?: number
    nivel?: string | null
    preco_padrao?: number
    status?: string
    descricao?: string | null
    data_inicio?: string | null
    data_fim?: string | null
  },
  horarios?: { dia_semana: string; hora_inicio: string; hora_fim: string }[]
) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('turmas').update(data as any).eq('id', turmaId)
  if (error) throw new Error(error.message)

  // Propaga mudança de professor para TODAS as aulas desta turma (passadas e futuras).
  // A folha do mês anterior é gerada no dia 15 — quando o admin corrige o professor
  // na turma, precisa que as aulas históricas também reflitam a mudança.
  if ('professor_id' in data) {
    await (supabase as any)
      .from('aulas')
      .update({ professor_id: data.professor_id ?? null })
      .eq('turma_id', turmaId)
      .neq('status', 'cancelada')
  }

  if (horarios !== undefined) {
    await supabase.from('turma_horarios').delete().eq('turma_id', turmaId)
    if (horarios.length) {
      const { error: hError } = await supabase
        .from('turma_horarios')
        .insert(horarios.map(h => ({ ...h, turma_id: turmaId })) as any)
      if (hError) throw new Error(hError.message)
    }
  }

  revalidatePath('/painel/turmas')
  revalidatePath(`/painel/turmas/${turmaId}`)
}
