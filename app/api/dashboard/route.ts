import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest) {
  const auth = await requireInternalAccess(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const supabase = getSupabaseAdmin();

    // 获取所有项目
    const { data: campaigns } = await supabase.from("campaigns").select("id,code,name,brand_name,product_name,status,created_at").order("created_at", { ascending: false });

    // 获取汇总数据
    const { data: allPartners } = await supabase.from("campaign_partners").select("id,campaign_id,score,tier,crm_status,created_at");
    const { data: allContacts } = await supabase.from("contacts").select("id,partner_id,type");
    const { data: allOutreach } = await supabase.from("outreach").select("id,campaign_partner_id,review_status");
    const { data: allQueries } = await supabase.from("queries").select("id,campaign_id,status,results_count");

    // 按项目分组统计
    const projectStats = (campaigns ?? []).map(c => {
      const partners = (allPartners ?? []).filter(p => p.campaign_id === c.id);
      const queries = (allQueries ?? []).filter(q => q.campaign_id === c.id);
      const totalResults = queries.reduce((sum, q) => sum + (q.results_count || 0), 0);

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        brand: c.brand_name,
        product: c.product_name,
        status: c.status,
        partnersFound: partners.length,
        qualifiedPartners: partners.filter(p => (p.score ?? 0) >= 60).length,
        avgScore: partners.length > 0 ? Math.round(partners.reduce((s, p) => s + (p.score ?? 0), 0) / partners.length) : 0,
        tierA: partners.filter(p => p.tier === "A").length,
        tierB: partners.filter(p => p.tier === "B").length,
        tierC: partners.filter(p => p.tier === "C").length,
        crmStatuses: {
          "新发现": partners.filter(p => p.crm_status === "新发现").length,
          "已联系": partners.filter(p => ["已联系", "已回复"].includes(p.crm_status)).length,
          "洽谈中": partners.filter(p => ["洽谈中", "已寄样", "内容排期"].includes(p.crm_status)).length,
          "已合作": partners.filter(p => ["已发布", "产生销售", "长期伙伴"].includes(p.crm_status)).length,
        },
        queriesRun: queries.length,
        totalSearchResults: totalResults,
      };
    });

    // 全局汇总
    const globalStats = {
      totalCampaigns: (campaigns ?? []).length,
      totalPartners: new Set((allPartners ?? []).map(p => p.campaign_id + "|" + p.id)).size,
      totalEmails: (allContacts ?? []).filter(c => c.type === "email").length,
      totalOutreach: (allOutreach ?? []).length,
      outreachDraft: (allOutreach ?? []).filter(o => o.review_status === "draft").length,
      outreachSent: (allOutreach ?? []).filter(o => o.review_status === "sent").length,
    };

    return NextResponse.json({ projects: projectStats, global: globalStats });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取 Dashboard 数据失败" }, { status: 500 });
  }
}
