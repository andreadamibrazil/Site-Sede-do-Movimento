import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { email?: string | null } } | null }) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isLoginPage = nextUrl.pathname === "/pauta/login";

  // Redirect to login if accessing protected routes without session
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/pauta/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/pauta/sede", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/pauta/:path*"],
};
