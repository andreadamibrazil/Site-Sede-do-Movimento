import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  if (!['admin', 'secretaria'].includes(perfil?.perfil ?? '')) {
    return NextResponse.json({ error: 'acesso negado' }, { status: 403 })
  }

  const body = await req.json() as { phone?: string; message?: string }
  if (!body.phone || !body.message) {
    return NextResponse.json({ error: 'phone e message obrigatórios' }, { status: 400 })
  }

  const num = body.phone.replace(/\D/g, '')
  const numero = num.startsWith('55') ? num : `55${num}`

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ error: 'WhatsApp não configurado no servidor' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `${evolutionUrl}/message/sendText/${process.env.EVOLUTION_INSTANCE ?? 'sede-movimento'}`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.EVOLUTION_API_KEY ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: numero,
          text: body.message,
          options: {
            delay: Math.min(Math.max(body.message.length * 20, 1500), 5000),
            presence: 'composing',
          },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text().catch(() => String(res.status))
      return NextResponse.json({ error: `Evolution API: ${err}` }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
