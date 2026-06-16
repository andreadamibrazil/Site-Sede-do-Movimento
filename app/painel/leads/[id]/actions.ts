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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('leads').update(dados as any).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${id}`)
  revalidatePath('/painel/leads')
}

export async function adicionarNota(leadId: string, texto: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('lead_notas')
    .insert({ lead_id: leadId, texto })
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${leadId}`)
}

export async function removerNota(leadId: string, notaId: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('lead_notas')
    .delete()
    .eq('id', notaId)
    .eq('lead_id', leadId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${leadId}`)
}
