import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? ''
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/professor'

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

    // Verifica se é professor cadastrado — usa service client para contornar RLS
    if (user?.email) {
      const service = createServiceClient()
      const { data: prof } = await service
        .from('professores')
        .select('id')
        .eq('email', user.email)
        .eq('ativo', true)
        .maybeSingle()

      if (prof) return NextResponse.redirect(`${origin}${next}`)
    }

    // Não é professor — encerra sessão para não deixar cookie órfão
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/professor/login?erro=acesso_negado`)
  }

  return NextResponse.redirect(`${origin}/professor/login`)
}
