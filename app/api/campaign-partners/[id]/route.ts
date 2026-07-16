import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params; const body = await request.json();
    const allowed = ["新发现","已入选","待联系","已联系","已回复","洽谈中","已寄样","内容排期","已发布","产生销售","长期伙伴"];
    if (!allowed.includes(body.crmStatus)) return NextResponse.json({ error: "无效的 CRM 状态" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("campaign_partners").update({ crm_status: body.crmStatus, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    await supabase.from("activities").insert({ campaign_partner_id: id, type: "status_changed", note: `状态更新为：${body.crmStatus}` });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新状态失败" }, { status: 500 });
  }
}
