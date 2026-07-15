import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
};

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brandName: text("brand_name").notNull(),
  productName: text("product_name").notNull(),
  productIntro: text("product_intro").notNull().default(""),
  targetCountries: text("target_countries", { mode: "json" }).$type<string[]>().notNull(),
  targetLanguages: text("target_languages", { mode: "json" }).$type<string[]>().notNull(),
  partnerTypes: text("partner_types", { mode: "json" }).$type<string[]>().notNull(),
  platforms: text("platforms", { mode: "json" }).$type<string[]>().notNull(),
  cooperationModels: text("cooperation_models", { mode: "json" }).$type<string[]>().notNull(),
  budgetRange: text("budget_range"),
  minimumFollowers: integer("minimum_followers"),
  maximumFollowers: integer("maximum_followers"),
  status: text("status", { enum: ["draft", "active", "paused", "completed"] }).notNull().default("draft"),
  ...timestamps,
});

export const partnerIcps = sqliteTable("partner_icps", {
  id: text("id").primaryKey(), campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  partnerType: text("partner_type").notNull(), contentCategories: text("content_categories", { mode: "json" }).$type<string[]>().notNull(),
  audienceCountries: text("audience_countries", { mode: "json" }).$type<string[]>().notNull(), audienceGender: text("audience_gender", { mode: "json" }).$type<string[]>().notNull(),
  audienceAge: text("audience_age", { mode: "json" }).$type<string[]>().notNull(), preferredFollowerRange: text("preferred_follower_range"),
  minimumEngagementRate: real("minimum_engagement_rate"), contentStyle: text("content_style", { mode: "json" }).$type<string[]>().notNull(), exclusions: text("exclusions", { mode: "json" }).$type<string[]>().notNull(),
  ...timestamps,
});

export const queries = sqliteTable("queries", {
  id: text("id").primaryKey(), campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  query: text("query").notNull(), source: text("source", { enum: ["brave", "exa", "manual"] }).notNull(), partnerType: text("partner_type"),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).notNull().default("pending"), resultsCount: integer("results_count").notNull().default(0), executedAt: integer("executed_at", { mode: "timestamp_ms" }),
  ...timestamps,
});

export const partners = sqliteTable("partners", {
  id: text("id").primaryKey(), displayName: text("display_name").notNull(), partnerType: text("partner_type").notNull(), primaryPlatform: text("primary_platform").notNull(),
  profileUrl: text("profile_url"), website: text("website"), country: text("country"), language: text("language"), contentCategories: text("content_categories", { mode: "json" }).$type<string[]>().notNull(),
  followers: integer("followers"), averageViews: integer("average_views"), engagementRate: real("engagement_rate"), email: text("email"), otherContact: text("other_contact"),
  recentContent: text("recent_content", { mode: "json" }).$type<Record<string, unknown>[]>().notNull(), brandCollaborations: text("brand_collaborations", { mode: "json" }).$type<string[]>().notNull(),
  audienceProfile: text("audience_profile", { mode: "json" }).$type<Record<string, unknown>>().notNull(), sourcePlatforms: text("source_platforms", { mode: "json" }).$type<string[]>().notNull(),
  canonicalKey: text("canonical_key").notNull().unique(), status: text("status").notNull().default("discovered"), ...timestamps,
});

export const campaignPartners = sqliteTable("campaign_partners", {
  id: text("id").primaryKey(), campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }), partnerId: text("partner_id").notNull().references(() => partners.id, { onDelete: "cascade" }),
  score: real("score"), tier: text("tier", { enum: ["A", "B", "C", "excluded"] }), scoreReason: text("score_reason", { mode: "json" }).$type<Record<string, unknown>>(),
  sourceQueries: text("source_queries", { mode: "json" }).$type<string[]>().notNull(), crmStatus: text("crm_status").notNull().default("Discovered"), ownerId: text("owner_id"), ...timestamps,
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(), partnerId: text("partner_id").notNull().references(() => partners.id, { onDelete: "cascade" }), type: text("type").notNull(), value: text("value").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false), sourceUrl: text("source_url"), ...timestamps,
});

export const outreach = sqliteTable("outreach", {
  id: text("id").primaryKey(), campaignPartnerId: text("campaign_partner_id").notNull().references(() => campaignPartners.id, { onDelete: "cascade" }),
  channel: text("channel", { enum: ["email", "instagram", "linkedin", "other"] }).notNull(), sequenceStep: integer("sequence_step").notNull().default(1), subject: text("subject"), body: text("body").notNull(),
  reviewStatus: text("review_status", { enum: ["draft", "approved", "sent", "cancelled"] }).notNull().default("draft"), scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }), sentAt: integer("sent_at", { mode: "timestamp_ms" }), ...timestamps,
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(), campaignPartnerId: text("campaign_partner_id").notNull().references(() => campaignPartners.id, { onDelete: "cascade" }), type: text("type").notNull(),
  note: text("note"), metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(), occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const performance = sqliteTable("partner_performance", {
  id: text("id").primaryKey(), campaignPartnerId: text("campaign_partner_id").notNull().references(() => campaignPartners.id, { onDelete: "cascade" }), quoteAmount: real("quote_amount"), sampleCost: real("sample_cost"), commissionRate: real("commission_rate"),
  couponCode: text("coupon_code"), affiliateUrl: text("affiliate_url"), contentUrl: text("content_url"), publishAt: integer("publish_at", { mode: "timestamp_ms" }), impressions: integer("impressions").default(0), clicks: integer("clicks").default(0), orders: integer("orders").default(0), revenue: real("revenue").default(0), roas: real("roas"), review: text("review"), ...timestamps,
});
