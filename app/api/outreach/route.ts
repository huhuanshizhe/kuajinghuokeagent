import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

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
