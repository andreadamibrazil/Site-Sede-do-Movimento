import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  await requireAdmin()
  const supabase = createServiceClient()

  // Busca perfis + dados de auth (último login)
  const { data: perfis } = await supabase
    .from('perfis_usuario')
    .select('*')
    .order('created_at', { ascending: false })

  // Busca dados de auth para ter último login
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()

  const authMap = Object.fromEntries(
    authUsers.map(u => [u.id, { lastSignIn: u.last_sign_in_at, createdAt: u.created_at }])
  )

  const usuarios = (perfis ?? []).map(p => ({
    ...p,
    ultimo_login: authMap[p.id]?.lastSignIn ?? null,
    criado_em_auth: authMap[p.id]?.createdAt ?? null,
  }))

  return <UsuariosClient usuarios={usuarios} />
}
