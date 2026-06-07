import { auth } from "@/lib/auth";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── /pauta — NextAuth ────────────────────────────────────────────────────────
const pautaMiddleware = auth((req: NextRequest & { auth: { user?: { email?: string | null } } | null }) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoginPage = nextUrl.pathname === "/pauta/login";
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/pauta/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isLoginPage && session) return NextResponse.redirect(new URL("/pauta/sede", nextUrl.origin));
  return NextResponse.next();
});

// ── /painel — Supabase Auth (admin/secretaria) ───────────────────────────────
async function painelMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isPublic = request.nextUrl.pathname.startsWith('/painel/login') ||
                   request.nextUrl.pathname.startsWith('/painel/auth');

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/painel/login', request.url));
  }

  // Bloqueia professor tentando acessar o admin
  if (user && !isPublic) {
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: perfil } = await sb
      .from('perfis_usuario').select('perfil, ativo').eq('id', user.id).maybeSingle()

    if (!perfil) {
      // Sem perfil admin — se for professor manda pro portal deles
      const { data: prof } = await sb
        .from('professores').select('id').eq('email', user.email ?? '').eq('ativo', true).maybeSingle()
      if (prof) return NextResponse.redirect(new URL('/professor', request.url))
      return NextResponse.redirect(new URL('/painel/login', request.url))
    }

    // Usuário inativo — tela de espera
    if (!perfil.ativo) {
      const isWaiting = request.nextUrl.pathname === '/painel/aguardando'
      if (!isWaiting) return NextResponse.redirect(new URL('/painel/aguardando', request.url))
      return response
    }

    // Secretaria: bloqueia só seção admin/ferramentas
    const ADMIN_PATHS = [
      '/painel/professores', '/painel/folha-pagamento', '/painel/usuarios',
      '/painel/historico', '/painel/auditoria',
    ]
    if (perfil.perfil === 'secretaria') {
      const bloqueado = ADMIN_PATHS.some(p => request.nextUrl.pathname.startsWith(p))
      if (bloqueado) return NextResponse.redirect(new URL('/painel', request.url))
    }
  }

  return response;
}

// ── /professor — Supabase Auth (professores) ─────────────────────────────────
async function professorMiddleware(request: NextRequest) {
  const isPublic = request.nextUrl.pathname.startsWith('/professor/login') ||
                   request.nextUrl.pathname.startsWith('/professor/auth');
  if (isPublic) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/professor/login', request.url));

  return response;
}

// ── Router ───────────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/professor')) return professorMiddleware(request);
  if (request.nextUrl.pathname.startsWith('/painel')) return painelMiddleware(request);
  return (pautaMiddleware as any)(request);
}

export const config = {
  matcher: ["/pauta/:path*", "/painel/:path*", "/professor/:path*"],
};
