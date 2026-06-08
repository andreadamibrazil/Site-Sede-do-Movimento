'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarTurmaAgenda(turmaId: string, data: {
  nome?: string
  sala_id?: string | null
  professor_id?: string | null
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('turmas').update(data).eq('id', turmaId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/agenda')
}
