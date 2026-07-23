import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("outreach")
      .select("*,campaign_partner:campaign_partners(score,tier,crm_status,campaign_id,campaigns(code,name)),partner:campaign_partners(partner:partners(display_name,primary_platform,email,profile_url))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取触达记录失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    if (!body.campaignPartnerId || !body.body) return NextResponse.json({ error: "伙伴和话术正文不能为空" }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("outreach").insert({ campaign_partner_id: body.campaignPartnerId, channel: body.channel ?? "email", subject: body.subject ?? null, body: body.body, review_status: "draft" }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存触达草稿失败" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    if (!body.id || !body.reviewStatus) return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    const allowed = ["draft", "approved", "sent", "cancelled"];
    if (!allowed.includes(body.reviewStatus)) return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("outreach").update({ review_status: body.reviewStatus, updated_at: new Date().toISOString() }).eq("id", body.id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新状态失败" }, { status: 500 });
  }
}
