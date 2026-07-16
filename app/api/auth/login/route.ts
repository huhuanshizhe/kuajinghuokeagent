import { NextRequest, NextResponse } from "next/server";
import { expectedSessionToken, isInternalAuthConfigured, SESSION_COOKIE, verifyPassword } from "@/lib/internal-auth";

export async function POST(request: NextRequest) {
  if (!isInternalAuthConfigured()) return NextResponse.json({ error: "内部访问密码尚未配置" }, { status: 503 });
  const { password } = await request.json();
  if (typeof password !== "string" || !(await verifyPassword(password))) return NextResponse.json({ error: "访问密码错误" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await expectedSessionToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
