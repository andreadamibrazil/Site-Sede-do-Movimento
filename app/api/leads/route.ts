import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

function normalizarCelular(cel: string): string {
  const d = cel.replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('55')) return d.slice(2)        // 55+DDD+9digits → 11
  if (d.length === 12 && d.startsWith('55')) return d.slice(2, 4) + '9' + d.slice(4) // 55+DDD+8digits → add 9
  if (d.length === 10) return d.slice(0, 2) + '9' + d.slice(2)        // DDD+8digits → add 9
  return d // 11 dígitos (correto) ou inválido — retorna como está
}

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const body = await req.json()
  const { nome, celular, email, modalidade_interesse, como_conheceu } = body

  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  if (!celular?.trim()) return NextResponse.json({ error: 'Celular é obrigatório' }, { status: 400 })

  const sb = createServiceClient()

  const celularLimpo = normalizarCelular(celular)

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

export async function PATCH(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { lead_id, status } = await req.json()
  const STATUS_VALIDOS = ['novo', 'em_contato', 'experimental_agendada', 'convertido', 'perdido']
  if (!lead_id || !STATUS_VALIDOS.includes(status)) {
    return NextResponse.json({ error: 'lead_id e status válido obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient()
  const { error } = await sb.from('leads').update({ status }).eq('id', lead_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
