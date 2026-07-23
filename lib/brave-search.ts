export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
}

export async function braveSearch(query: string, count = 20): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error("BRAVE_SEARCH_API_KEY 尚未配置");

  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
    {
      headers: {
        "X-Subscription-Token": apiKey,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brave Search API 请求失败 (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (data.web?.results ?? []).map((r: Record<string, unknown>) => ({
    title: String(r.title ?? ""),
    url: String(r.url ?? ""),
    description: String(r.description ?? ""),
    extra_snippets: Array.isArray(r.extra_snippets) ? r.extra_snippets.map(String) : undefined,
  }));
}
