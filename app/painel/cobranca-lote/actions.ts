'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function lancarCobrancasLote(items: {
  aluno_id: string
  categoria: string
  categoria_custom: string | null
  descricao: string
  descricao_detalhada: string | null
  valor: number
  preco_unitario: number
  quantidade: number
  vencimento: string | null
}[]) {
  const supabase = createServiceClient()
  const inserts = items.map(item => ({ ...item, status: 'pendente' }))
  const { error } = await supabase.from('cobrancas_avulsas').insert(inserts as any)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/cobranca-lote')
}
