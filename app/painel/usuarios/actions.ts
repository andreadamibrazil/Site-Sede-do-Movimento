'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { revalidatePath } from 'next/cache'

export async function atualizarAtivoUsuario(userId: string, ativo: boolean) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('perfis_usuario')
    .update({ ativo })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/usuarios')
}

export async function atualizarPerfilUsuario(userId: string, perfil: string) {
  await requireAdmin()
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('perfis_usuario')
    .update({ perfil: perfil as 'admin' | 'secretaria' | 'professor' })
    .eq('id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/painel/usuarios')
}
