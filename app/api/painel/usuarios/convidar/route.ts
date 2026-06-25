import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

const PERFIS_VALIDOS = ['admin', 'secretaria'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { email, perfil } = await req.json()

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 })
  }
  if (!PERFIS_VALIDOS.includes(perfil)) {
    return NextResponse.json({ error: `perfil inválido. Valores: ${PERFIS_VALIDOS.join(', ')}` }, { status: 400 })
  }

  const sb = createServiceClient()

  const { data: existente } = await sb
    .from('perfis_usuario')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existente) {
    return NextResponse.json({ error: 'Email já cadastrado como usuário' }, { status: 409 })
  }

  const { error } = await sb
    .from('convites')
    .upsert({ email, perfil }, { onConflict: 'email' })

  if (error) {
    console.error('[convidar] upsert error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { email } = await req.json()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'email inválido' }, { status: 400 })
  }

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('convites')
    .delete()
    .eq('email', email)
    .select('id')

  if (error) {
    console.error('[convidar] delete error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
  if (!data?.length) {
    return NextResponse.json({ error: 'convite não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
