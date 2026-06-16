import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const service = createServiceClient()
      const { data: perfil } = await service
        .from('perfis_usuario')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!perfil) {
        // Sem perfil admin — verifica se é professor
        const { data: prof } = await service
          .from('professores')
          .select('id')
          .eq('email', user.email ?? '')
          .eq('ativo', true)
          .maybeSingle()

        if (prof) return NextResponse.redirect(`${origin}/professor`)

        // Nenhum acesso — encerra sessão para não deixar cookie órfão
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/painel/login?erro=acesso_negado`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/painel`)
}
