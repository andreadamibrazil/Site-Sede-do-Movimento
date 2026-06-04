import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import PainelSidebar from './PainelSidebar'

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // Rotas de professor e públicas não recebem o shell admin
  if (pathname.startsWith('/painel/professor') || pathname.startsWith('/painel/login') || pathname.startsWith('/painel/auth')) {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  const service = createServiceClient()
  const { data: perfil } = await service
    .from('perfis_usuario')
    .select('perfil')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = perfil?.perfil === 'admin'

  return (
    <div className="flex h-screen bg-gray-50">
      <PainelSidebar email={user.email ?? ''} isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
