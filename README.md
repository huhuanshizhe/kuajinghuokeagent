# PartnerOS — AI Partner CRM

跨境电商全球合作伙伴开发 MVP，覆盖 Campaign、Partner ICP、搜索策略、伙伴发现、统一档案、AI 评分、人工审核触达与合作效果 CRM。

系统定位为内部中文工作台。每个项目通过唯一项目编号和 `campaignId` 隔离产品画像、目标市场、搜索词、候选伙伴、评分、触达记录及效果数据；同一伙伴可以出现在多个项目中，但拥有各项目独立的评分与 CRM 状态。

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

正式数据使用 Supabase PostgreSQL。迁移文件位于 `supabase/migrations/`，生产环境必须配置 `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`INTERNAL_ACCESS_PASSWORD` 和 `INTERNAL_SESSION_SECRET`。

所有公开表均启用 RLS；管理员密钥只在服务器 Route Handlers 中使用。项目创建、伙伴读取、CRM 状态更新、活动日志与触达草稿均通过受内部登录保护的服务器 API 完成。

## 部署

- Vercel 使用标准 Next.js 构建：`npm run build`
- OpenAI Sites / Cloudflare 使用：`npm run build:sites`
