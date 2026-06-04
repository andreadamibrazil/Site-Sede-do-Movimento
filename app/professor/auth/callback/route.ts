import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    // Verifica se é professor cadastrado
    if (user?.email) {
      const { data: prof } = await supabase
        .from('professores')
        .select('id')
        .eq('email', user.email)
        .eq('ativo', true)
        .maybeSingle()

      if (prof) return NextResponse.redirect(`${origin}/professor`)
    }

    // Não é professor — volta para login com erro
    return NextResponse.redirect(`${origin}/professor/login?erro=acesso_negado`)
  }

  return NextResponse.redirect(`${origin}/professor/login`)
}
