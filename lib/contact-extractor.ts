import { braveSearch, type BraveSearchResult } from "./brave-search";

// 从文本中提取邮箱
export function extractEmails(text: string): string[] {
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(regex) ?? [];
  // 过滤常见无用邮箱（平台方、示例、注册商等）
  const blockedDomains = [
    "example.com", "sentry.io", "wixpress.com", "domain.com",
    "email.com", "yourname.com", "sentry-next.wixpress.com",
    // 影响者营销平台（不是伙伴邮箱）
    "modash.io", "collabstr.com", "influencermarketinghub.com",
    "heepsy.com", "socialblade.com", "tubics.com",
    // 电商平台
    "etsy.com", "amazon.com", "ebay.com", "aliexpress.com",
    // 常见邮箱提供商（这些不是品牌/创作者邮箱）
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    // 域名注册商/WHOIS
    "whoisprivacyservice.org", "domaindiscover.com",
  ];
  return [...new Set(matches.filter(e => {
    const domain = e.split("@")[1]?.toLowerCase() ?? "";
    return !blockedDomains.some(b => domain === b || domain.endsWith("." + b));
  }))];
}

// 从文本中提取 WhatsApp / 电话号码
export function extractPhones(text: string): string[] {
  // 匹配常见格式: +86..., +1..., WhatsApp: xxx, wa.me/xxx
  const patterns = [
    /(?:whatsapp|wa\.me|whats\s*app)[\s:：]*([+\d\s()-]{8,})/gi,
    /(\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9})/g,
  ];
  const phones: string[] = [];
  for (const p of patterns) {
    let match;
    while ((match = p.exec(text)) !== null) {
      const phone = match[1].replace(/[\s()-]/g, "");
      if (phone.length >= 8 && phone.length <= 20) phones.push(phone);
    }
  }
  return [...new Set(phones)];
}

// 从单条搜索结果提取联系方式
export function extractContactInfo(result: BraveSearchResult): { emails: string[]; phones: string[] } {
  const allText = [
    result.title,
    result.description,
    ...(result.extra_snippets ?? []),
  ].join(" ");
  return {
    emails: extractEmails(allText),
    phones: extractPhones(allText),
  };
}

// Hunter API 域名邮箱查找
export async function hunterDomainSearch(domain: string): Promise<{ emails: string[]; position?: string }[]> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=10`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data?.emails ?? []).map((e: Record<string, unknown>) => ({
      emails: [String(e.value ?? "")],
      position: String(e.position ?? ""),
    }));
  } catch {
    return [];
  }
}

// Hunter API 根据姓名+域名查找
export async function hunterEmailFinder(name: string, domain: string): Promise<string | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(name.split(/\s+/)[0])}&last_name=${encodeURIComponent(name.split(/\s+/).slice(1).join(" "))}&api_key=${apiKey}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.email ?? null;
  } catch {
    return null;
  }
}
