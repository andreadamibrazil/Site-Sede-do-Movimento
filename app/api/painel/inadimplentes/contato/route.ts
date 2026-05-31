import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const sb = createServiceClient()
  // Incrementa tentativas_contato diretamente (sem RPC)
  const { data: aluno } = await sb.from('alunos').select('tentativas_contato').eq('id', id).single()
  const novoValor = ((aluno as any)?.tentativas_contato ?? 0) + 1
  await (sb as any).from('alunos').update({ tentativas_contato: novoValor }).eq('id', id)
  return NextResponse.json({ tentativas: novoValor })
}
