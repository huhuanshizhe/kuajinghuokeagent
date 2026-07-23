import { NextRequest, NextResponse } from "next/server";
import { requireInternalAccess } from "@/lib/internal-auth";
import { generateICPForCampaign } from "@/lib/icp-generator";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess(request); if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    const icps = await generateICPForCampaign(id);
    return NextResponse.json({ data: icps, count: icps.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "生成画像失败" }, { status: 500 });
  }
}
