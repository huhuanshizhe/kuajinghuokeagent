import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const { data, error } = await getSupabaseAdmin().from("campaign_partners").select("id,score,tier,score_reason,crm_status,partner:partners(*)").eq("campaign_id", id).order("score", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取伙伴失败" }, { status: 503 });
  }
}
