'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarAcessoProfessor(
  professorId: string,
  data: { email?: string | null; celular?: string | null; mei?: string | null; valor_transporte?: number | null }
) {
  const supabase = createServiceClient()
  const { error } = await (supabase as any)
    .from('professores')
    .update({
      email: data.email || null,
      celular: data.celular || null,
      mei: data.mei || null,
      valor_transporte: data.valor_transporte ?? null,
    })
    .eq('id', professorId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/professores/${professorId}`)
}
