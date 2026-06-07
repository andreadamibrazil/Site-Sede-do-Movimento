'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarAcessoProfessor(
  professorId: string,
  data: { email?: string | null; celular?: string | null }
) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('professores')
    .update({ email: data.email || null, celular: data.celular || null })
    .eq('id', professorId)
  if (error) throw new Error(error.message)
  revalidatePath(`/painel/professores/${professorId}`)
}
