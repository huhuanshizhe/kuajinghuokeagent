import { NextRequest, NextResponse } from "next/server";
import { expectedSessionToken, isInternalAuthConfigured, SESSION_COOKIE } from "@/lib/internal-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/login" || pathname === "/api/auth/login" || pathname === "/api/health" || pathname.startsWith("/_next/") || pathname === "/favicon.svg" || pathname === "/og.png";
  if (isPublic || !isInternalAuthConfigured()) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE)?.value === await expectedSessionToken()) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "请先登录内部工作台" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
