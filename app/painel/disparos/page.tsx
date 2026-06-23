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

  // Turmas com grupo de WhatsApp vinculado
  // Cast necessário: whatsapp_group_id adicionado via migration, tipos não regenerados
  const { data: turmasRaw } = await service
    .from('turmas')
    .select('id, nome, whatsapp_group_id, modalidades(nome)')
    .eq('status', 'ativa')
    .order('nome')

  type TurmaRow = { id: string; nome: string; whatsapp_group_id: string | null; modalidades: { nome: string } | null }
  const turmas = (turmasRaw ?? []) as unknown as TurmaRow[]

  // Alunos ativos com responsável (nome + celular para envio individual)
  // Cast necessário: join de responsaveis não está nos tipos gerados com esses campos
  const { data: clientesRaw } = await service
    .from('alunos')
    .select('id, nome, celular, status_pedagogico, responsavel_principal:responsaveis!alunos_responsavel_principal_id_fkey(nome, celular)')
    .in('status_pedagogico', ['ativo', 'experimental', 'trancado'])
    .order('nome')

  type ClienteRow = {
    id: string
    nome: string
    celular: string | null
    status_pedagogico: string
    responsavel_principal: { nome: string; celular: string } | null
  }
  const clientes = (clientesRaw ?? []) as unknown as ClienteRow[]

  return <DisparosClient turmas={turmas} clientes={clientes} />
}
