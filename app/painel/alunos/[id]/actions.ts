'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarAluno(
  id: string,
  dados: Record<string, string | null>
) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('alunos').update(dados).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${id}`)
}

export async function atualizarResponsavel(
  responsavelId: string,
  alunoId: string,
  dados: Record<string, string | null>
) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('responsaveis').update(dados).eq('id', responsavelId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/alunos/${alunoId}`)
}
