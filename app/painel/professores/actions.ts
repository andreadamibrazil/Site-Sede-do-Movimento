'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertProfessor(data: {
  id?: string
  nome: string
  email?: string | null
  celular?: string | null
  forma_pagamento: string
  valor_base?: number | null
  observacoes?: string | null
}) {
  const supabase = createServiceClient()

  if (data.id) {
    const { error } = await supabase
      .from('professores')
      .update({
        nome: data.nome,
        email: data.email || null,
        celular: data.celular || null,
        forma_pagamento: data.forma_pagamento as any,
        valor_base: data.valor_base || null,
        observacoes: data.observacoes || null,
      })
      .eq('id', data.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('professores')
      .insert({
        nome: data.nome,
        email: data.email || null,
        celular: data.celular || null,
        forma_pagamento: data.forma_pagamento as any,
        valor_base: data.valor_base || null,
        observacoes: data.observacoes || null,
        ativo: true,
      })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/painel/professores')
}

export async function excluirProfessor(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('professores').update({ ativo: false }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/professores')
}

export async function toggleAtivoProfessor(id: string, ativo: boolean) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('professores')
    .update({ ativo: !ativo })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/professores')
}
