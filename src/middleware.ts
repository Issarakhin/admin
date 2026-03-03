import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/utils/adminSession";

const PUBLIC_ROUTES = ["/login", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  const hasAdminSession =
    Boolean(sessionToken) &&
    Boolean(sessionSecret) &&
    (await verifyAdminSessionToken(sessionToken as string, sessionSecret as string));
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (pathname === "/") {
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!isPublicRoute && !hasAdminSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasAdminSession) {
    const dashboardUrl = new URL("/overview", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
