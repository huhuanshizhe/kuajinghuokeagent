# PartnerOS — AI Partner CRM

跨境电商全球合作伙伴开发 MVP，覆盖 Campaign、Partner ICP、搜索策略、伙伴发现、统一档案、AI 评分、人工审核触达与合作效果 CRM。

## 当前可用

- 高保真响应式 Partner Discovery 工作台
- 候选人搜索、A/B/C 分层筛选与详情评分解释
- Campaign 创建、发现运行、资格确认和触达草稿交互
- D1 / Drizzle 数据模型：Campaign、ICP、Query、Partner、Contact、Outreach、Activity、Performance
- 为 Brave、Exa、Firecrawl、Hunter 与邮件服务预留清晰的数据边界

## 本地运行

```bash
npm install
npm run dev
```

生成数据库迁移：`npm run db:generate`。部署环境通过 `.openai/hosting.json` 注入 `DB`。

## 部署

- Vercel 使用标准 Next.js 构建：`npm run build`
- OpenAI Sites / Cloudflare 使用：`npm run build:sites`
