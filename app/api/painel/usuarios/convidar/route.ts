import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { email, perfil } = await req.json()

  if (!email || !perfil) {
    return NextResponse.json({ error: 'email e perfil são obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient()

  // Verifica se já existe como usuário ativo
  const { data: existente } = await sb
    .from('perfis_usuario')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existente) {
    return NextResponse.json({ error: 'Email já cadastrado como usuário' }, { status: 409 })
  }

  // Upsert no convites (sobrescreve se já convidado antes)
  const { error } = await sb
    .from('convites')
    .upsert({ email, perfil }, { onConflict: 'email' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  await requireAdmin()
  const { email } = await req.json()

  const sb = createServiceClient()
  await sb.from('convites').delete().eq('email', email)

  return NextResponse.json({ ok: true })
}
