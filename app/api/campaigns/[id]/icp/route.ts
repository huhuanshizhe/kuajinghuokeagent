import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const { data, error } = await getSupabaseAdmin()
      .from("partner_icps")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取画像失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Upsert: if ICP exists for this partner_type, update; otherwise insert
    if (body.partnerType) {
      const { data: existing } = await getSupabaseAdmin()
        .from("partner_icps")
        .select("id")
        .eq("campaign_id", id)
        .eq("partner_type", body.partnerType)
        .maybeSingle();

      if (existing) {
        const { data, error } = await getSupabaseAdmin()
          .from("partner_icps")
          .update({
            content_categories: body.contentCategories ?? [],
            audience_countries: body.audienceCountries ?? [],
            audience_gender: body.audienceGender ?? [],
            audience_age: body.audienceAge ?? [],
            preferred_follower_range: body.preferredFollowerRange ?? null,
            minimum_engagement_rate: body.minimumEngagementRate ?? null,
            content_style: body.contentStyle ?? [],
            exclusions: body.exclusions ?? [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ data });
      }
    }

    const { data, error } = await getSupabaseAdmin()
      .from("partner_icps")
      .insert({
        campaign_id: id,
        partner_type: body.partnerType ?? "创作者",
        content_categories: body.contentCategories ?? [],
        audience_countries: body.audienceCountries ?? [],
        audience_gender: body.audienceGender ?? [],
        audience_age: body.audienceAge ?? [],
        preferred_follower_range: body.preferredFollowerRange ?? null,
        minimum_engagement_rate: body.minimumEngagementRate ?? null,
        content_style: body.contentStyle ?? [],
        exclusions: body.exclusions ?? [],
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "保存画像失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id: icpId } = await (async () => { const u = new URL(request.url); return { id: u.searchParams.get("icpId") }; })();
    if (!icpId) return NextResponse.json({ error: "缺少 icpId" }, { status: 400 });
    const { error } = await getSupabaseAdmin().from("partner_icps").delete().eq("id", icpId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "删除画像失败" }, { status: 500 });
  }
}
