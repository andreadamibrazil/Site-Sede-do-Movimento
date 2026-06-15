import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folhaId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { folhaId } = await params
  const { comprovante_url } = await req.json()
  const sb = createServiceClient()

  const updates: Record<string, any> = {
    comprovante_url: comprovante_url || null,
  }
  if (comprovante_url) updates.comprovante_adicionado_em = new Date().toISOString()

  await sb.from('folhas_pagamento').update(updates).eq('id', folhaId)

  return NextResponse.json({ ok: true })
}
