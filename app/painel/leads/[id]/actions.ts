'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarLead(
  id: string,
  dados: {
    nome?: string
    celular?: string
    email?: string
    modalidade_interesse?: string
    como_conheceu?: string
    status?: string
  }
) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('leads').update(dados).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${id}`)
}
