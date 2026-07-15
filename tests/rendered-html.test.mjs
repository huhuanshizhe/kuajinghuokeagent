import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("提供中文内部工作台与项目数据隔离", async () => {
  const [page, layout, schema] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /伙伴智库/);
  assert.match(layout, /zh-CN/);
  assert.match(page, /运行伙伴发现/);
  assert.match(page, /本项目候选伙伴/);
  assert.match(page, /生成触达话术/);
  assert.match(page, /switchProject/);
  assert.match(schema, /campaignPartners/);
  assert.match(schema, /partner_performance/);
});
