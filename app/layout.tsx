import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: "伙伴智库 — 跨境电商全球合作伙伴开发系统",
    description: "面向内部团队的 AI 合作伙伴发现、筛选、触达与效果管理系统。",
    openGraph: { title: "伙伴智库", description: "找到真正能够推动市场的合作伙伴。", images: [{ url: `${origin}/og.png`, width: 1732, height: 909 }] },
    twitter: { card: "summary_large_image", title: "伙伴智库", description: "跨境电商全球合作伙伴开发系统", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
