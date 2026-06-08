import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PainelSidebar from './PainelSidebar'

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/painel/login')

  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = perfil?.perfil === 'admin'
  const perfilAtual = perfil?.perfil ?? 'secretaria'

  return (
    <div className="flex h-screen bg-gray-50">
      <PainelSidebar email={user.email ?? ''} isAdmin={isAdmin} perfil={perfilAtual} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
