import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /app and /admin routes (Internal Clinic Staff OS)
  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("practiceos_session");
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /login to /app if session cookie already exists
  if (pathname === "/login") {
    const sessionCookie = request.cookies.get("practiceos_session");
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    "/login",
  ],
};
