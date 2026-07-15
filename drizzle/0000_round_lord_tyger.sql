CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_partner_id` text NOT NULL,
	`type` text NOT NULL,
	`note` text,
	`metadata` text,
	`occurred_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_partner_id`) REFERENCES `campaign_partners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaign_partners` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`score` real,
	`tier` text,
	`score_reason` text,
	`source_queries` text NOT NULL,
	`crm_status` text DEFAULT 'Discovered' NOT NULL,
	`owner_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand_name` text NOT NULL,
	`product_name` text NOT NULL,
	`product_intro` text DEFAULT '' NOT NULL,
	`target_countries` text NOT NULL,
	`target_languages` text NOT NULL,
	`partner_types` text NOT NULL,
	`platforms` text NOT NULL,
	`cooperation_models` text NOT NULL,
	`budget_range` text,
	`minimum_followers` integer,
	`maximum_followers` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`partner_id` text NOT NULL,
	`type` text NOT NULL,
	`value` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`source_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `outreach` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_partner_id` text NOT NULL,
	`channel` text NOT NULL,
	`sequence_step` integer DEFAULT 1 NOT NULL,
	`subject` text,
	`body` text NOT NULL,
	`review_status` text DEFAULT 'draft' NOT NULL,
	`scheduled_at` integer,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_partner_id`) REFERENCES `campaign_partners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `partner_icps` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`partner_type` text NOT NULL,
	`content_categories` text NOT NULL,
	`audience_countries` text NOT NULL,
	`audience_gender` text NOT NULL,
	`audience_age` text NOT NULL,
	`preferred_follower_range` text,
	`minimum_engagement_rate` real,
	`content_style` text NOT NULL,
	`exclusions` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`partner_type` text NOT NULL,
	`primary_platform` text NOT NULL,
	`profile_url` text,
	`website` text,
	`country` text,
	`language` text,
	`content_categories` text NOT NULL,
	`followers` integer,
	`average_views` integer,
	`engagement_rate` real,
	`email` text,
	`other_contact` text,
	`recent_content` text NOT NULL,
	`brand_collaborations` text NOT NULL,
	`audience_profile` text NOT NULL,
	`source_platforms` text NOT NULL,
	`canonical_key` text NOT NULL,
	`status` text DEFAULT 'discovered' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `partners_canonical_key_unique` ON `partners` (`canonical_key`);--> statement-breakpoint
CREATE TABLE `partner_performance` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_partner_id` text NOT NULL,
	`quote_amount` real,
	`sample_cost` real,
	`commission_rate` real,
	`coupon_code` text,
	`affiliate_url` text,
	`content_url` text,
	`publish_at` integer,
	`impressions` integer DEFAULT 0,
	`clicks` integer DEFAULT 0,
	`orders` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`roas` real,
	`review` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_partner_id`) REFERENCES `campaign_partners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `queries` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`query` text NOT NULL,
	`source` text NOT NULL,
	`partner_type` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`results_count` integer DEFAULT 0 NOT NULL,
	`executed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
