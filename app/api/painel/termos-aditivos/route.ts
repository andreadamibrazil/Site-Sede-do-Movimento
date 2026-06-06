import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const body = await req.json()
  const { matricula_id, tipo, motivo, antes, depois } = body

  if (!matricula_id || !tipo || !depois) {
    return NextResponse.json({ error: 'matricula_id, tipo e depois são obrigatórios' }, { status: 400 })
  }

  const sb = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertPayload: any = { matricula_id, tipo, motivo: motivo ?? null, antes: antes ?? {}, depois, contrato_status: 'pendente', criado_por: guard.userId }
  const { data, error } = await sb
    .from('termos_aditivos')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Dispara n8n para gerar contrato de aditivo no DocuSeal (fire-and-forget)
  const n8nUrl = process.env.N8N_WEBHOOK_ADITIVO
  if (n8nUrl) {
    const { data: matricula } = await sb
      .from('matriculas')
      .select('aluno_id, plano, valor_final, alunos(nome, email)')
      .eq('id', matricula_id)
      .single()

    fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termo_aditivo_id: data.id,
        matricula_id,
        tipo,
        motivo,
        antes,
        depois,
        aluno: (matricula as any)?.alunos,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function GET(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const matriculaId = req.nextUrl.searchParams.get('matricula_id')
  if (!matriculaId) return NextResponse.json({ error: 'matricula_id obrigatório' }, { status: 400 })

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('termos_aditivos')
    .select('*')
    .eq('matricula_id', matriculaId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
