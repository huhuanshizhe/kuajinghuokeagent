import { braveSearch, type BraveSearchResult } from "./brave-search";

export interface Campaign {
  id: string;
  product_name: string;
  brand_name: string;
  product_intro: string;
  target_countries: string[];
  target_languages: string[];
  partner_types: string[];
  platforms: string[];
}

export interface RawPartner {
  display_name: string;
  partner_type: string;
  primary_platform: string;
  profile_url: string;
  website: string | null;
  country: string;
  language: string;
  content_categories: string[];
  canonical_key: string;
  description: string;
  audience_profile: Record<string, unknown>;
}

// 生成搜索词：结合产品、伙伴类型、平台和市场
export function generateQueries(campaign: Campaign): string[] {
  const queries: string[] = [];
  const productEn = translateProduct(campaign.product_name);
  const countries = campaign.target_countries.slice(0, 2);
  const countryEn = countries.map(translateCountry);
  const platforms = campaign.platforms.slice(0, 3);

  // 英文搜索词（覆盖更广）
  for (const platform of platforms) {
    const platformLower = platform.toLowerCase();
    queries.push(`${productEn} influencer ${platformLower} ${countryEn.join(" ")}`);
    // 对 YouTube 和 Instagram 加 site: 限定，直接找到频道/账号页
    if (platformLower === "youtube") {
      queries.push(`site:youtube.com "${productEn}" channel ${countryEn[0] ?? ""}`);
    }
    if (platformLower === "instagram") {
      queries.push(`site:instagram.com "${productEn}" ${countryEn[0] ?? ""}`);
    }
  }

  // 中文搜索词（针对华人创作者）
  if (campaign.partner_types.length > 0) {
    const type = campaign.partner_types[0];
    queries.push(`${campaign.product_name} ${type} ${platforms[0] ?? ""} ${countries[0] ?? ""}`.trim());
  }

  // 通用列表型搜索（找 "Top X" 汇总文章）
  queries.push(`top ${campaign.product_name} ${campaign.partner_types[0] ?? "creator"} youtube channel ${countryEn[0] ?? ""}`);

  // 去重
  return [...new Set(queries)].slice(0, 5);
}

// 从 URL 域名判断平台
function detectPlatform(url: string): string {
  const host = url.toLowerCase();
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube";
  if (host.includes("instagram.com")) return "Instagram";
  if (host.includes("tiktok.com")) return "TikTok";
  if (host.includes("twitter.com") || host.includes("x.com")) return "Twitter/X";
  if (host.includes("linkedin.com")) return "LinkedIn";
  if (host.includes("pinterest.com")) return "Pinterest";
  return "独立博客";
}

// 从标题中提取干净的名称
function extractName(title: string, url: string): string {
  const host = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  // YouTube 直链：从 URL 提取频道名
  if (url.includes("youtube.com/@") || url.includes("youtube.com/c/") || url.includes("youtube.com/user/")) {
    const match = url.match(/youtube\.com\/(?:@|c\/|user\/)([^/?]+)/);
    if (match) return decodeURIComponent(match[1]).replace(/\+/g, " ");
  }
  // YouTube 频道页标题
  if (url.includes("youtube.com")) {
    const ytMatch = title.match(/^(.+?)\s*[-–—|]\s*YouTube$/i);
    if (ytMatch) return ytMatch[1].trim();
  }

  // Instagram 直链
  if (url.includes("instagram.com/")) {
    const match = url.match(/instagram\.com\/([^/?]+)/);
    if (match && !["p", "reel", "stories"].includes(match[1])) return match[1];
  }

  // 列表文章（Top 10, Best 50 等）：用网站域名
  if (/^(top|best|\d+)\s+\d+/i.test(title)) {
    return host.replace(/\.(com|net|org|io|co)$/, "");
  }

  // 去掉常见后缀
  let name = title
    .replace(/\s*[-|–—]\s*(YouTube|Instagram|TikTok|LinkedIn|Pinterest).*/i, "")
    .replace(/\s*[-|–—]\s*(top|best|\d+).*/i, "")
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s*\d+\s*(videos?|subscribers?|channels?).*/i, "")
    .trim();

  if (name.length > 50) {
    const sep = name.search(/[,，:：]/);
    if (sep > 5 && sep < 45) name = name.slice(0, sep).trim();
    else name = name.slice(0, 45).trim();
  }

  return name || host.replace(/\.(com|net|org)$/, "");
}

// 生成 canonical_key
async function canonicalKey(name: string, platform: string): Promise<string> {
  const raw = `${name.toLowerCase().trim()}|${platform}`;
  const bytes = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// 解析搜索结果为候选伙伴
export async function parseResults(
  results: BraveSearchResult[],
  campaign: Campaign,
  sourceQuery: string
): Promise<RawPartner[]> {
  const partners: RawPartner[] = [];
  const seenKeys = new Set<string>();

  for (const result of results) {
    const platform = detectPlatform(result.url);
    const name = extractName(result.title, result.url);
    const key = await canonicalKey(name, platform);

    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // 过滤掉明显不是伙伴的结果
    const host = new URL(result.url).hostname.replace("www.", "");
    const blockHosts = [
      "en.wikipedia.org", "facebook.com", "amazon.com", "ebay.com",
      "walmart.com", "aliexpress.com", "temu.com", "tiktok.com",
    ];
    if (blockHosts.includes(host)) continue;
    // 过滤聚合站/SEO 站/排行榜站
    const aggregatorHosts = ["findachannel", "tubics", "socialblade", "statista", "feedspot", "grin", "influencers.feedspot"];
    if (aggregatorHosts.some(a => host.includes(a))) continue;
    // 过滤内容类型不相关的结果
    const titleLower = result.title.toLowerCase();
    if (["onlyfans", "porn", "xxx", "gambling", "casino", "crypto", "bitcoin"].some(bad => titleLower.includes(bad))) continue;

    const cleanDesc = result.description.replace(/<[^>]+>/g, "").slice(0, 500);

    partners.push({
      display_name: name,
      partner_type: campaign.partner_types[0] ?? "创作者",
      primary_platform: platform,
      profile_url: result.url,
      website: platform === "独立博客" ? result.url : null,
      country: campaign.target_countries[0] ?? "",
      language: campaign.target_languages[0] ?? "英语",
      content_categories: [campaign.product_name, ...sourceQuery.split(" ").filter(w => w.length > 3).slice(0, 3)],
      canonical_key: key,
      description: cleanDesc,
      audience_profile: {
        source_query: sourceQuery,
        raw_title: result.title,
        source_host: host,
        description: cleanDesc,
      },
    });
  }

  return partners;
}

// 评分（0-100）
export function scorePartner(partner: RawPartner, campaign: Campaign): number {
  let score = 0;
  // 合并所有可匹配文本
  const matchText = [
    partner.display_name,
    partner.description,
    String(partner.audience_profile?.raw_title ?? ""),
    String(partner.audience_profile?.source_query ?? ""),
    partner.profile_url,
  ].join(" ").toLowerCase();

  // 收集所有关键词（中英文）
  const keywords: string[] = [];

  // 中文产品名拆词
  campaign.product_name.split(/[\s·,，、]+/).forEach(w => { if (w.length >= 2) keywords.push(w.toLowerCase()); });
  // 英文产品翻译
  const productEn = translateProduct(campaign.product_name).toLowerCase().split(/\s+/);
  productEn.forEach(w => { if (w.length >= 3) keywords.push(w); });
  // 品牌名
  campaign.brand_name.split(/\s+/).forEach(w => { if (w.length >= 3) keywords.push(w.toLowerCase()); });
  // 目标市场（中英文）
  campaign.target_countries.forEach(c => {
    keywords.push(c.toLowerCase());
    keywords.push(translateCountry(c).toLowerCase());
  });
  // 伙伴类型
  campaign.partner_types.forEach(t => keywords.push(t.toLowerCase()));

  // 去重
  const uniqueKw = [...new Set(keywords)];

  // 关键词命中计分（0-55 分）
  let hits = 0;
  for (const kw of uniqueKw) {
    if (matchText.includes(kw)) hits++;
  }
  const hitRate = uniqueKw.length > 0 ? hits / uniqueKw.length : 0;
  score += Math.round(hitRate * 55);

  // 平台匹配（0-20 分）
  if (campaign.platforms.includes(partner.primary_platform)) score += 20;
  else if (partner.primary_platform === "独立博客" && campaign.platforms.includes("独立博客")) score += 20;

  // 直链渠道加分（0-15 分）：YouTube/Instagram 直接频道页
  const url = partner.profile_url.toLowerCase();
  if (url.includes("youtube.com/@") || url.includes("youtube.com/c/") || url.includes("youtube.com/user/")) score += 15;
  else if (url.includes("instagram.com/") && !url.includes("/p/") && !url.includes("/reel/")) score += 15;

  // 描述丰富度（0-10 分）
  if (partner.description.length > 100) score += 5;
  if (partner.description.length > 250) score += 5;

  return Math.min(score, 100);
}

export function assignTier(score: number): "A" | "B" | "C" {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  return "C";
}

// 运行完整发现流程
export async function runDiscoveryForCampaign(
  campaign: Campaign,
  insertQuery: (q: string, source: string) => Promise<string>,
  updateQuery: (id: string, status: string, count: number) => Promise<void>,
  upsertPartner: (p: RawPartner) => Promise<string>,
  insertCampaignPartner: (campaignId: string, partnerId: string, score: number, tier: string, queries: string[]) => Promise<void>
): Promise<{ found: number; qualified: number; queriesRun: number }> {
  const queries = generateQueries(campaign);
  let totalFound = 0;
  let totalQualified = 0;

  for (const q of queries) {
    const queryId = await insertQuery(q, "brave");
    try {
      const results = await braveSearch(q, 20);
      const partners = await parseResults(results, campaign, q);

      for (const partner of partners) {
        const s = scorePartner(partner, campaign);
        if (s < 30) continue; // 过滤掉得分太低的
        totalFound++;

        const partnerId = await upsertPartner(partner);
        await insertCampaignPartner(campaign.id, partnerId, s, assignTier(s), [q]);
        if (s >= 60) totalQualified++;
      }

      await updateQuery(queryId, "completed", partners.length);
    } catch (error) {
      await updateQuery(queryId, "failed", 0);
      console.error(`搜索词失败: ${q}`, error);
    }
    // 避免触发 Brave API 频率限制（免费套餐 1 请求/秒）
    if (q !== queries[queries.length - 1]) await new Promise(r => setTimeout(r, 1100));
  }

  return { found: totalFound, qualified: totalQualified, queriesRun: queries.length };
}

// 简单中英翻译映射
function translateCountry(cn: string): string {
  const map: Record<string, string> = {
    "美国": "united states", "英国": "united kingdom", "德国": "germany",
    "法国": "france", "日本": "japan", "韩国": "korea", "全球": "global",
    "加拿大": "canada", "澳大利亚": "australia",
  };
  return map[cn] ?? cn;
}

function translateProduct(cn: string): string {
  // 简单映射，实际项目可接入翻译 API
  const map: Record<string, string> = {
    "手工高跟鞋": "handmade high heels", "藏文化艺术与冥想产品": "tibetan art meditation products",
    "宠物口腔护理产品": "pet oral care products",
  };
  return map[cn] ?? cn;
}
