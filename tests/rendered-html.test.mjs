import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships PartnerOS product metadata and core workflow", async () => {
  const [page, layout, schema] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /PartnerOS — AI Partner CRM/);
  assert.match(page, /Run discovery/);
  assert.match(page, /Partner candidates/);
  assert.match(page, /Create outreach/);
  assert.match(schema, /campaignPartners/);
  assert.match(schema, /partner_performance/);
});
