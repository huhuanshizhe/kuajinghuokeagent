create index if not exists campaign_partners_partner_idx on public.campaign_partners(partner_id);
create index if not exists contacts_partner_idx on public.contacts(partner_id);
create index if not exists outreach_campaign_partner_idx on public.outreach(campaign_partner_id);
create index if not exists partner_icps_campaign_idx on public.partner_icps(campaign_id);
