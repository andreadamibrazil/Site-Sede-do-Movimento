import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const sb = createServiceClient()
  // Incremento atômico via RPC para evitar race condition (dois requests simultâneos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: novoValor, error } = await (sb as any).rpc('incrementar_tentativas_contato', { p_id: id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tentativas: novoValor })
}
