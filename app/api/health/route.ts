import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isInternalAuthConfigured } from "@/lib/internal-auth";

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, database: "unconfigured", internalAuth: isInternalAuthConfigured() }, { status: 503 });
  try {
    const { error } = await getSupabaseAdmin().from("campaigns").select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, database: "connected", internalAuth: isInternalAuthConfigured(), integrations: { brave: Boolean(process.env.BRAVE_SEARCH_API_KEY), exa: Boolean(process.env.EXA_API_KEY), firecrawl: Boolean(process.env.FIRECRAWL_API_KEY), hunter: Boolean(process.env.HUNTER_API_KEY), ai: Boolean(process.env.OPENAI_API_KEY), email: Boolean(process.env.RESEND_API_KEY) } });
  } catch (error) {
    return NextResponse.json({ ok: false, database: "error", message: error instanceof Error ? error.message : "数据库连接失败" }, { status: 503 });
  }
}
