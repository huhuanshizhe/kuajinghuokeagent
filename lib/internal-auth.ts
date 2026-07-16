import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "partneros_session";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function isInternalAuthConfigured() {
  return Boolean(process.env.INTERNAL_ACCESS_PASSWORD && process.env.INTERNAL_SESSION_SECRET);
}

export async function expectedSessionToken() {
  const password = process.env.INTERNAL_ACCESS_PASSWORD;
  const secret = process.env.INTERNAL_SESSION_SECRET;
  if (!password || !secret) throw new Error("内部访问密码尚未配置");
  return sha256(`${password}:${secret}`);
}

export async function verifyPassword(input: string) {
  const expected = process.env.INTERNAL_ACCESS_PASSWORD;
  if (!expected) return false;
  return (await sha256(input)) === (await sha256(expected));
}

export async function requireInternalAccess(request: NextRequest) {
  if (!isInternalAuthConfigured()) return { ok: false as const, status: 503, error: "内部访问控制尚未配置" };
  const actual = request.cookies.get(SESSION_COOKIE)?.value;
  const expected = await expectedSessionToken();
  if (actual !== expected) return { ok: false as const, status: 401, error: "请先登录内部工作台" };
  return { ok: true as const };
}
