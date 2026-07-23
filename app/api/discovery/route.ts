import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";
import { runDiscoveryForCampaign, type Campaign, type RawPartner } from "@/lib/discovery-engine";

export async function POST(request: NextRequest) {
  const auth = await requireInternalAccess(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    if (!body.campaignId) return NextResponse.json({ error: "缺少 campaignId" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // 读取 campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", body.campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    const campaignData: Campaign = {
      id: campaign.id,
      product_name: campaign.product_name,
      brand_name: campaign.brand_name,
      product_intro: campaign.product_intro ?? "",
      target_countries: campaign.target_countries ?? [],
      target_languages: campaign.target_languages ?? [],
      partner_types: campaign.partner_types ?? [],
      platforms: campaign.platforms ?? [],
    };

    // 运行发现
    const result = await runDiscoveryForCampaign(
      campaignData,

      // insertQuery
      async (q, source) => {
        const { data } = await supabase.from("queries").insert({
          campaign_id: campaignData.id,
          query: q,
          source,
          status: "running",
        }).select().single();
        return data?.id ?? "";
      },

      // updateQuery
      async (id, status, count) => {
        await supabase.from("queries").update({
          status,
          results_count: count,
          executed_at: new Date().toISOString(),
        }).eq("id", id);
      },

      // upsertPartner
      async (partner: RawPartner) => {
        // 先查询是否已存在
        const { data: existing } = await supabase
          .from("partners")
          .select("id")
          .eq("canonical_key", partner.canonical_key)
          .maybeSingle();

        if (existing) return existing.id;

        const { data } = await supabase.from("partners").insert({
          display_name: partner.display_name,
          partner_type: partner.partner_type,
          primary_platform: partner.primary_platform,
          profile_url: partner.profile_url,
          website: partner.website,
          country: partner.country,
          language: partner.language,
          content_categories: partner.content_categories,
          canonical_key: partner.canonical_key,
          status: "discovered",
          recent_content: [],
          brand_collaborations: [],
          audience_profile: partner.audience_profile,
          source_platforms: [partner.primary_platform],
        }).select().single();

        return data?.id ?? "";
      },

      // insertCampaignPartner
      async (campaignId, partnerId, score, tier, queries) => {
        // 检查是否已存在
        const { data: existing } = await supabase
          .from("campaign_partners")
          .select("id")
          .eq("campaign_id", campaignId)
          .eq("partner_id", partnerId)
          .maybeSingle();

        if (existing) {
          // 更新得分（取更高值）
          await supabase.from("campaign_partners").update({
            score: Math.max(score, Number(score)),
            tier,
            source_queries: queries,
          }).eq("id", existing.id);
          return;
        }

        await supabase.from("campaign_partners").insert({
          campaign_id: campaignId,
          partner_id: partnerId,
          score,
          tier,
          source_queries: queries,
          crm_status: "新发现",
        });
      }
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发现任务失败" },
      { status: 500 }
    );
  }
}
