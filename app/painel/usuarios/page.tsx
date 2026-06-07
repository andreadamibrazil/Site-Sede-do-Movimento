import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  await requireAdmin()
  const supabase = createServiceClient()

  const [{ data: perfis }, { data: { users: authUsers } }, { data: convites }] = await Promise.all([
    supabase.from('perfis_usuario').select('*').order('created_at', { ascending: false }),
    supabase.auth.admin.listUsers(),
    (supabase as any).from('convites').select('*').order('convidado_em', { ascending: false }),
  ])

  const authMap = Object.fromEntries(
    authUsers.map(u => [u.id, { lastSignIn: u.last_sign_in_at }])
  )

  const usuarios = (perfis ?? []).map(p => ({
    ...p,
    ultimo_login: authMap[p.id]?.lastSignIn ?? null,
  }))

  return <UsuariosClient usuarios={usuarios} convites={convites ?? []} />
}
