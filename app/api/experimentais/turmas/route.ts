import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Verifica sessão Supabase (professor ou admin logado)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('turmas')
    .select('id, nome')
    .not('status', 'eq', 'encerrada')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
