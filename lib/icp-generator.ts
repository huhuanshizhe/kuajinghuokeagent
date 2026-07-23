import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface CampaignData {
  id: string;
  product_name: string;
  brand_name: string;
  product_intro: string;
  target_countries: string[];
  target_languages: string[];
  partner_types: string[];
  platforms: string[];
  minimum_followers?: number;
  maximum_followers?: number;
}

// 基于 Campaign 数据自动生成 Partner ICP
export async function generateICPForCampaign(campaignId: string): Promise<Record<string, unknown>[]> {
  const supabase = getSupabaseAdmin();

  // 读取 campaign
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();
  if (error || !campaign) throw new Error("项目不存在");

  const campaignData: CampaignData = {
    id: campaign.id,
    product_name: campaign.product_name,
    brand_name: campaign.brand_name,
    product_intro: campaign.product_intro ?? "",
    target_countries: campaign.target_countries ?? [],
    target_languages: campaign.target_languages ?? [],
    partner_types: campaign.partner_types ?? [],
    platforms: campaign.platforms ?? [],
  };

  // 删除旧的 ICP
  await supabase.from("partner_icps").delete().eq("campaign_id", campaignId);

  const generatedICPs: Record<string, unknown>[] = [];

  // 为每种伙伴类型生成一个 ICP
  const partnerTypes = campaignData.partner_types.length > 0
    ? campaignData.partner_types
    : ["创作者"];

  for (const partnerType of partnerTypes) {
    const icp = generateSingleICP({ ...campaignData, minimum_followers: campaign.minimum_followers, maximum_followers: campaign.maximum_followers }, partnerType);
    const { data } = await supabase.from("partner_icps").insert(icp).select().single();
    if (data) generatedICPs.push(data);
  }

  return generatedICPs;
}

function generateSingleICP(campaign: CampaignData, partnerType: string): Record<string, unknown> {
  const product = campaign.product_name.toLowerCase();

  // 根据产品关键词推断内容分类
  const contentCategories = inferContentCategories(product, campaign.product_intro);

  // 受众国家 = 目标市场
  const audienceCountries = campaign.target_countries;

  // 受众年龄和性别 — 根据产品类型推断
  const { gender, age } = inferAudienceDemographics(product);

  // 粉丝量偏好 — 根据伙伴类型
  const followerRange = inferFollowerRange(partnerType, campaign.minimum_followers, campaign.maximum_followers);

  // 最低互动率 — 根据伙伴类型
  const minEngagement = inferMinEngagement(partnerType);

  // 内容风格
  const contentStyle = inferContentStyle(product, partnerType);

  // 排除条件
  const exclusions = inferExclusions(product, partnerType);

  return {
    campaign_id: campaign.id,
    partner_type: partnerType,
    content_categories: contentCategories,
    audience_countries: audienceCountries,
    audience_gender: gender,
    audience_age: age,
    preferred_follower_range: followerRange,
    minimum_engagement_rate: minEngagement,
    content_style: contentStyle,
    exclusions: exclusions,
  };
}

function inferContentCategories(product: string, intro: string): string[] {
  const text = `${product} ${intro}`.toLowerCase();
  const categories: string[] = [];

  // 关键词映射
  const categoryKeywords: Record<string, string[]> = {
    "时尚穿搭": ["鞋", "服", " fashion", "穿搭", "outfit", "wear", "style"],
    "美妆护肤": ["美妆", "护肤", "makeup", "beauty", "skincare", "cosmetic"],
    "健康养生": ["健康", "养生", "保健", "health", "wellness", "supplement"],
    "宠物用品": ["宠物", "猫", "狗", "pet", "dog", "cat", "animal"],
    "家居生活": ["家居", "家装", "home", "decor", "furniture", "kitchen"],
    "母婴育儿": ["母婴", "婴儿", "宝宝", "baby", "kid", "parenting", "maternity"],
    "文化艺术": ["文化", "艺术", "冥想", "佛教", "art", "culture", "meditation", "buddhist"],
    "科技数码": ["科技", "数码", "电子", "tech", "gadget", "electronic"],
    "运动户外": ["运动", "户外", "健身", "sport", "outdoor", "fitness", "yoga"],
    "食品饮料": ["食品", "饮料", "茶", "咖啡", "food", "drink", "tea", "coffee"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      categories.push(category);
    }
  }

  // 如果没有匹配到任何分类，用通用分类
  if (categories.length === 0) {
    categories.push("生活方式", "产品测评");
  }

  return categories;
}

function inferAudienceDemographics(product: string): { gender: string[]; age: string[] } {
  const text = product.toLowerCase();

  // 性别推断
  let gender: string[] = ["不限"];
  if (["高跟鞋", "裙", "裙装", "女装", "口红", "护肤"].some(k => text.includes(k))) {
    gender = ["女性"];
  } else if (["男装", "剃须", "男士"].some(k => text.includes(k))) {
    gender = ["男性"];
  }

  // 年龄推断
  let age: string[] = ["25-34"];
  if (["婴儿", "母婴", "baby", "kid"].some(k => text.includes(k))) {
    age = ["25-34", "35-44"];
  } else if (["青年", "学生", "teen", "college"].some(k => text.includes(k))) {
    age = ["18-24"];
  } else if (["中老年", "退休", "senior"].some(k => text.includes(k))) {
    age = ["45-54", "55+"];
  } else if (["手工", "高端", "奢侈", "luxury", "handmade"].some(k => text.includes(k))) {
    age = ["25-34", "35-44"];
  }

  return { gender, age };
}

function inferFollowerRange(partnerType: string, min?: number, max?: number): string {
  if (min && max) return `${(min / 1000).toFixed(0)}k-${(max / 1000).toFixed(0)}k`;
  if (min) return `${(min / 1000).toFixed(0)}k+`;

  // 根据伙伴类型默认
  const defaults: Record<string, string> = {
    "KOC": "3k-50k",
    "创作者": "5k-100k",
    "KOL": "50k-500k",
    "联盟站": "10k-200k",
    "媒体": "20k-1M",
    "社群": "1k-50k",
    "兽医 KOL": "10k-200k",
  };
  return defaults[partnerType] ?? "5k-100k";
}

function inferMinEngagement(partnerType: string): number {
  const defaults: Record<string, number> = {
    "KOC": 0.03,    // 3%
    "创作者": 0.025, // 2.5%
    "KOL": 0.02,     // 2%
    "联盟站": 0.01,   // 1%
    "媒体": 0.015,    // 1.5%
    "社群": 0.04,     // 4%
    "兽医 KOL": 0.025,
  };
  return defaults[partnerType] ?? 0.02;
}

function inferContentStyle(product: string, partnerType: string): string[] {
  const styles: string[] = [];
  const text = product.toLowerCase();

  // 基于产品推断
  if (["手工", "handmade", "artisan"].some(k => text.includes(k))) {
    styles.push("匠心工艺", "细节展示", "品质感");
  }
  if (["文化", "冥想", "佛教", "art", "culture"].some(k => text.includes(k))) {
    styles.push("文化内涵", "故事性", "尊重传统");
  }
  if (["护理", "健康", "care", "health"].some(k => text.includes(k))) {
    styles.push("专业可信", "科普教育", "实测验证");
  }
  if (["时尚", "鞋", "服", "fashion", "style"].some(k => text.includes(k))) {
    styles.push("视觉美感", "穿搭灵感", "生活场景");
  }

  // 基于伙伴类型
  if (partnerType === "联盟站" || partnerType === "媒体") {
    styles.push("专业测评", "对比分析");
  }
  if (partnerType === "KOC" || partnerType === "创作者") {
    styles.push("真实体验", "个人故事");
  }

  if (styles.length === 0) styles.push("真实体验", "产品测评");
  return styles;
}

function inferExclusions(product: string, partnerType: string): string[] {
  const exclusions: string[] = [
    "近期有竞品合作",
    "内容质量不稳定",
    "互动数据异常（疑似买粉）",
  ];

  const text = product.toLowerCase();

  // 基于产品的特定排除
  if (["文化", "冥想", "佛教", "tibetan"].some(k => text.includes(k))) {
    exclusions.push("文化不尊重或刻板印象", "过度商业化");
  }
  if (["宠物", "pet", "animal"].some(k => text.includes(k))) {
    exclusions.push("非专业宠物内容", "动物虐待争议");
  }

  return exclusions;
}
