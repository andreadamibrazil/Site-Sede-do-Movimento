import { createServiceClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireStaff()
  if (!guard.ok) return guard.response

  const { lead_id } = await req.json()
  if (!lead_id) return NextResponse.json({ error: 'lead_id obrigatório' }, { status: 400 })

  const sb = createServiceClient()

  const { data: lead } = await sb
    .from('leads')
    .select('nome, celular, email, como_conheceu, origem')
    .eq('id', lead_id)
    .single()

  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

  // Cria aluno com dados básicos do lead
  const { data: aluno, error } = await sb
    .from('alunos')
    .insert({
      nome: lead.nome,
      celular: lead.celular,
      email: lead.email,
      como_conheceu: lead.como_conheceu,
      origem: lead.origem ?? 'lead',
      status_pedagogico: 'ativo',
      status_financeiro: 'em_dia',
    })
    .select('id')
    .single()

  if (error || !aluno) return NextResponse.json({ error: error?.message ?? 'Erro ao criar aluno' }, { status: 500 })

  // Atualiza status do lead
  await sb.from('leads').update({ status: 'convertido' }).eq('id', lead_id)

  return NextResponse.json({ aluno_id: aluno.id })
}
