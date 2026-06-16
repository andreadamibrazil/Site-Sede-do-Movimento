import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from './server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/painel/login')

  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil, ativo')
    .eq('id', user.id)
    .maybeSingle()

  if (perfil?.perfil !== 'admin' || !perfil?.ativo) redirect('/painel')

  return { user, isAdmin: true }
}
