'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function atualizarAtivoUsuario(userId: string, ativo: boolean) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('perfis_usuario')
    .update({ ativo })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/usuarios')
}

export async function atualizarPerfilUsuario(userId: string, perfil: string) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('perfis_usuario')
    .update({ perfil: perfil as 'admin' | 'secretaria' | 'professor' })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/usuarios')
}
