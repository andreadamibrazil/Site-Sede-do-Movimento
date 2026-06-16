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

export async function adicionarNota(id: string, texto: string) {
  const supabase = createServiceClient()
  const { data: lead } = await supabase.from('leads').select('observacoes').eq('id', id).single()

  let obs: Record<string, unknown> = {}
  try {
    if (lead?.observacoes) obs = JSON.parse(lead.observacoes as string)
  } catch { /* observacoes não é JSON */ }

  const notas = (obs.notas as Array<{ id: string; texto: string; data: string }>) ?? []
  notas.unshift({ id: crypto.randomUUID(), texto, data: new Date().toISOString() })
  obs.notas = notas

  const { error } = await supabase.from('leads').update({ observacoes: JSON.stringify(obs) }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${id}`)
  revalidatePath('/painel/leads')
}

export async function removerNota(id: string, notaId: string) {
  const supabase = createServiceClient()
  const { data: lead } = await supabase.from('leads').select('observacoes').eq('id', id).single()

  let obs: Record<string, unknown> = {}
  try {
    if (lead?.observacoes) obs = JSON.parse(lead.observacoes as string)
  } catch { /* observacoes não é JSON */ }

  const notas = (obs.notas as Array<{ id: string }>) ?? []
  obs.notas = notas.filter(n => n.id !== notaId)

  const { error } = await supabase.from('leads').update({ observacoes: JSON.stringify(obs) }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/leads/${id}`)
  revalidatePath('/painel/leads')
}
