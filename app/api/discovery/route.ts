import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";
import { runDiscoveryForCampaign, type Campaign, type RawPartner } from "@/lib/discovery-engine";
import { hunterDomainSearch } from "@/lib/contact-extractor";

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

    // 加载项目画像（ICP）
    const { data: icps } = await supabase.from("partner_icps").select("*").eq("campaign_id", body.campaignId);
    const icpData = (icps ?? []) as unknown as import("@/lib/discovery-engine").PartnerICP[];

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
      },

      // insertContacts
      async (partnerId, emails, phones) => {
        // 先查已有的联系方式，避免重复
        const { data: existing } = await supabase
          .from("contacts")
          .select("value")
          .eq("partner_id", partnerId);
        const existingValues = new Set((existing ?? []).map(c => c.value));

        const toInsert: { partner_id: string; type: string; value: string; verified: boolean }[] = [];
        for (const email of emails) {
          if (!existingValues.has(email)) {
            toInsert.push({ partner_id: partnerId, type: "email", value: email, verified: false });
          }
        }
        for (const phone of phones) {
          if (!existingValues.has(phone)) {
            toInsert.push({ partner_id: partnerId, type: "whatsapp", value: phone, verified: false });
          }
        }
        if (toInsert.length > 0) {
          await supabase.from("contacts").insert(toInsert);
        }
      },
      icpData
    );

    // === Hunter 补充：对独立博客类伙伴进行域名邮箱查找 ===
    if (process.env.HUNTER_API_KEY && result.found > 0) {
      try {
        const { data: blogPartners } = await supabase
          .from("partners")
          .select("id, website, display_name")
          .eq("primary_platform", "独立博客")
          .not("website", "is", null)
          .limit(10);

        for (const bp of (blogPartners ?? [])) {
          // 检查是否已有邮箱
          const { data: existingEmails } = await supabase
            .from("contacts")
            .select("id")
            .eq("partner_id", bp.id)
            .eq("type", "email");
          if ((existingEmails ?? []).length > 0) continue;

          try {
            const domain = new URL(bp.website!).hostname.replace("www.", "");
            const hunterResults = await hunterDomainSearch(domain);
            if (hunterResults.length > 0) {
              const emails = hunterResults.flatMap(h => h.emails).filter(Boolean);
              if (emails.length > 0) {
                await supabase.from("contacts").insert(
                  emails.map(e => ({ partner_id: bp.id, type: "email", value: e, verified: true, source_url: bp.website }))
                );
                // 同时更新 partners.email 字段
                await supabase.from("partners").update({ email: emails[0] }).eq("id", bp.id);
                result.emailsFound += emails.length;
              }
            }
          } catch { /* 单个 Hunter 查询失败不影响整体 */ }
          // Hunter API 限速：每秒 1 次
          await new Promise(r => setTimeout(r, 1100));
        }
      } catch { /* Hunter 整体失败不影响结果 */ }
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发现任务失败" },
      { status: 500 }
    );
  }
}
