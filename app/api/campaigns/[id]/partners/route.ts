import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("campaign_partners")
      .select("id,score,tier,score_reason,crm_status,partner:partners(*)")
      .eq("campaign_id", id)
      .order("score", { ascending: false });
    if (error) throw error;

    // 批量查询所有伙伴的联系方式
    const partnerIds = (data ?? []).map(cp => cp.partner?.id).filter(Boolean);
    let contactsMap: Record<string, { type: string; value: string }[]> = {};
    if (partnerIds.length > 0) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("partner_id, type, value")
        .in("partner_id", partnerIds);
      for (const c of (contacts ?? [])) {
        if (!contactsMap[c.partner_id]) contactsMap[c.partner_id] = [];
        contactsMap[c.partner_id].push({ type: c.type, value: c.value });
      }
    }

    // 附加联系方式到每个 partner
    const enriched = (data ?? []).map(cp => ({
      ...cp,
      contacts: contactsMap[cp.partner?.id] ?? [],
    }));

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取伙伴失败" }, { status: 503 });
  }
}
