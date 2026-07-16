import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireInternalAccess } from "@/lib/internal-auth";

export async function GET(request: NextRequest) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { data, error } = await getSupabaseAdmin().from("campaigns").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "读取项目失败" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    if (!body.name || !body.brandName || !body.productName || !body.targetCountry) return NextResponse.json({ error: "项目名称、品牌、产品和目标市场不能为空" }, { status: 400 });
    const code = `${String(body.productName).slice(0,2).toUpperCase()}-${String(body.targetCountry).slice(0,2).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const { data, error } = await getSupabaseAdmin().from("campaigns").insert({
      code, name: body.name, brand_name: body.brandName, product_name: body.productName,
      target_countries: [body.targetCountry], target_languages: body.targetLanguages ?? ["英语"],
      partner_types: body.partnerTypes ?? [], platforms: body.platforms ?? [], cooperation_models: body.cooperationModels ?? [], status: "active",
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "创建项目失败" }, { status: 500 });
  }
}
