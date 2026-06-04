import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from('turmas')
    .select('id, nome')
    .not('status', 'eq', 'encerrada')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
