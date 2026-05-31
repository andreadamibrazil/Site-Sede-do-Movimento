import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type AdminGuardOk = { ok: true; userId: string }
type AdminGuardFail = { ok: false; response: NextResponse }

export async function requireAdmin(): Promise<AdminGuardOk | AdminGuardFail> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'não autenticado' }, { status: 401 }) }
  }

  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  if (perfil?.perfil !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'acesso negado' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}
