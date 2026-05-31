import { auth } from "@/lib/auth";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware para /pauta (NextAuth)
const pautaMiddleware = auth((req: NextRequest & { auth: { user?: { email?: string | null } } | null }) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoginPage = nextUrl.pathname === "/pauta/login";

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/pauta/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/pauta/sede", nextUrl.origin));
  }
  return NextResponse.next();
});

// Middleware para /painel (Supabase Auth)
async function painelMiddleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Atualiza cookies no request e na response — necessário para renovar o token
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // getUser() valida com o servidor E renova o access token via refresh token se necessário
  const { data: { user } } = await supabase.auth.getUser();

  const isPublic =
    request.nextUrl.pathname.startsWith('/painel/login') ||
    request.nextUrl.pathname.startsWith('/painel/auth');

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/painel/login', request.url));
  }

  return response;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/painel')) {
    return painelMiddleware(request);
  }
  return (pautaMiddleware as any)(request);
}

export const config = {
  matcher: ["/pauta/:path*", "/painel/:path*"],
};
