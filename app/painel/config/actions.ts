'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarConfigItem(data: {
  categoria: string
  valor: string
  label: string
}) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('config_itens').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/config')
}

export async function salvarContextoItem(secao: string, conteudo: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('config_auditoria')
    .update({ conteudo, updated_at: new Date().toISOString() })
    .eq('secao', secao)
  if (error) throw new Error(error.message)
}
