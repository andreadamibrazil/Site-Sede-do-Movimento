'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarPrecoReferencia(
  data: { categoria: string; descricao: string; valor: number | null },
  id?: string
) {
  const supabase = createServiceClient()
  if (id) {
    const { error } = await supabase.from('precos_referencia').update(data as any).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('precos_referencia').insert({ ...data, ativo: true } as any)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/painel/produtos')
}

export async function toggleAtivoPrecoReferencia(id: string, ativo: boolean) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('precos_referencia')
    .update({ ativo: !ativo } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
}
