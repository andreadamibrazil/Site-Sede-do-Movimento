import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DisparosClient from './DisparosClient'

export const metadata = { title: 'Disparos — Sede do Movimento' }

export default async function DisparosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  // Busca turmas com grupo de WhatsApp vinculado
  // Cast necessário: whatsapp_group_id foi adicionado via migration e os tipos
  // gerados do Supabase ainda não foram regenerados
  const { data: turmasRaw } = await service
    .from('turmas')
    .select('id, nome, whatsapp_group_id, modalidades(nome)')
    .eq('status', 'ativa')
    .order('nome')

  type TurmaRow = { id: string; nome: string; whatsapp_group_id: string | null; modalidades: { nome: string } | null }
  const turmas = (turmasRaw ?? []) as unknown as TurmaRow[]

  return <DisparosClient turmas={turmas} />
}
