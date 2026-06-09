'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarConfigItem(data: {
  categoria: string
  valor: string
  label: string
}) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('config_itens').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/config')
}

export async function salvarContextoItem(secao: string, conteudo: string) {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('config_auditoria')
    .update({ conteudo, updated_at: new Date().toISOString() })
    .eq('secao', secao)
  if (error) throw new Error(error.message)
}
