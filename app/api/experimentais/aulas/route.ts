import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const turmaId = req.nextUrl.searchParams.get('turma_id')
  if (!turmaId) return NextResponse.json([], { status: 200 })

  const sb = createServiceClient()
  const hoje = new Date().toISOString().slice(0, 10)

  const { data, error } = await sb
    .from('aulas')
    .select('id, data, hora_inicio, hora_fim, professores(nome)')
    .eq('turma_id', turmaId)
    .gte('data', hoje)
    .in('status', ['agendada', 'aberta'])
    .order('data')
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
