import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await req.json()
  const { nome, celular, email, modalidade_interesse, como_conheceu } = body

  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const sb = createServiceClient()

  const celularLimpo = celular ? celular.replace(/\D/g, '') : null

  // Verifica duplicata por celular
  if (celularLimpo) {
    const { data: existente } = await sb
      .from('leads')
      .select('id, nome')
      .eq('celular', celularLimpo)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ error: `Já existe um lead com esse celular: ${existente.nome}` }, { status: 409 })
    }
  }

  const { data: lead, error } = await sb
    .from('leads')
    .insert({
      nome: nome.trim(),
      celular: celularLimpo,
      email: email?.trim() || null,
      modalidade_interesse: modalidade_interesse || null,
      como_conheceu: como_conheceu || null,
      origem: 'manual',
      status: 'novo',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, lead_id: lead.id })
}
