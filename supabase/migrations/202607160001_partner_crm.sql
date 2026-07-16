create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  brand_name text not null,
  product_name text not null,
  product_intro text not null default '',
  target_countries jsonb not null default '[]'::jsonb,
  target_languages jsonb not null default '[]'::jsonb,
  partner_types jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  cooperation_models jsonb not null default '[]'::jsonb,
  budget_range text,
  minimum_followers integer,
  maximum_followers integer,
  status text not null default 'active' check (status in ('draft','active','paused','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_icps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  partner_type text not null,
  content_categories jsonb not null default '[]'::jsonb,
  audience_countries jsonb not null default '[]'::jsonb,
  audience_gender jsonb not null default '[]'::jsonb,
  audience_age jsonb not null default '[]'::jsonb,
  preferred_follower_range text,
  minimum_engagement_rate numeric(8,5),
  content_style jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  query text not null,
  source text not null check (source in ('brave','exa','manual')),
  partner_type text,
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  results_count integer not null default 0,
  executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  partner_type text not null,
  primary_platform text not null,
  profile_url text,
  website text,
  country text,
  language text,
  content_categories jsonb not null default '[]'::jsonb,
  followers integer,
  average_views integer,
  engagement_rate numeric(8,5),
  email text,
  other_contact text,
  recent_content jsonb not null default '[]'::jsonb,
  brand_collaborations jsonb not null default '[]'::jsonb,
  audience_profile jsonb not null default '{}'::jsonb,
  source_platforms jsonb not null default '[]'::jsonb,
  canonical_key text not null unique,
  status text not null default 'discovered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_partners (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  score numeric(5,2),
  tier text check (tier in ('A','B','C','excluded')),
  score_reason jsonb,
  source_queries jsonb not null default '[]'::jsonb,
  crm_status text not null default '新发现',
  owner_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, partner_id)
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  type text not null,
  value text not null,
  verified boolean not null default false,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  campaign_partner_id uuid not null references public.campaign_partners(id) on delete cascade,
  channel text not null check (channel in ('email','instagram','linkedin','other')),
  sequence_step integer not null default 1,
  subject text,
  body text not null,
  review_status text not null default 'draft' check (review_status in ('draft','approved','sent','cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  campaign_partner_id uuid not null references public.campaign_partners(id) on delete cascade,
  type text not null,
  note text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.partner_performance (
  id uuid primary key default gen_random_uuid(),
  campaign_partner_id uuid not null references public.campaign_partners(id) on delete cascade unique,
  quote_amount numeric(14,2), sample_cost numeric(14,2), commission_rate numeric(8,5),
  coupon_code text, affiliate_url text, content_url text, publish_at timestamptz,
  impressions bigint not null default 0, clicks bigint not null default 0, orders bigint not null default 0,
  revenue numeric(14,2) not null default 0, roas numeric(12,4), review text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists campaign_partners_campaign_idx on public.campaign_partners(campaign_id);
create index if not exists campaign_partners_status_idx on public.campaign_partners(campaign_id, crm_status);
create index if not exists queries_campaign_idx on public.queries(campaign_id);
create index if not exists activities_campaign_partner_idx on public.activities(campaign_partner_id, occurred_at desc);

do $$ declare t text; begin
  foreach t in array array['campaigns','partner_icps','queries','partners','campaign_partners','contacts','outreach','activities','partner_performance']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;

insert into public.campaigns (code,name,brand_name,product_name,product_intro,target_countries,target_languages,partner_types,platforms,cooperation_models,minimum_followers,maximum_followers)
values
('HH-US-01','美国手工高跟鞋合作伙伴开发','AORARA','手工高跟鞋','优先寻找拥有美国女性受众的中小型创作者与婚礼时尚联盟站。','["美国"]','["英语"]','["KOC","创作者","联盟站","媒体"]','["YouTube","Instagram","独立博客"]','["产品寄样","联盟佣金","付费测评"]',3000,200000),
('TC-GL-02','藏文化产品全球内容合作','TIBETAN TREASURES','藏文化艺术与冥想产品','寻找关注佛教文化、冥想、瑜伽与艺术收藏的创作者和媒体。','["美国","英国"]','["英语"]','["创作者","KOL","媒体","社群"]','["YouTube","Instagram","独立博客","论坛"]','["内容共创","专家访谈","寄样"]',3000,250000),
('PC-US-03','美国宠物口腔护理达人计划','PETSMILE LAB','宠物口腔护理产品','重点开发兽医、宠物护理博主和专业宠物媒体。','["美国"]','["英语"]','["兽医 KOL","KOC","联盟站","社群"]','["YouTube","Instagram","独立博客","论坛"]','["专业测评","付费内容","联盟佣金"]',3000,300000)
on conflict (code) do nothing;
