import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/layout.html", import.meta.url), "utf8");
const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
const sources = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));
const nagpur = readFileSync(new URL("../src/pages/districts/nagpur-land-records/index.html", import.meta.url), "utf8");
const nagpurEn = readFileSync(new URL("../src/pages/districts/nagpur-land-records/index.en.html", import.meta.url), "utf8");
const strategy = readFileSync(new URL("../docs/seo/COMPETITOR_AND_GROWTH_PLAN.md", import.meta.url), "utf8");

test("global layout exposes social preview metadata without ad placeholders", () => {
  for (const token of ['property="og:title"', 'property="og:description"', 'property="og:url"', 'name="twitter:card"']) assert.ok(layout.includes(token), token);
  assert.ok(!/adsbygoogle|pagead2\.googlesyndication\.com|ad-box|adbox/i.test(layout));
});

test("build adds WebPage, Article, WebSite and sitewide related-link gates", () => {
  for (const token of ['"@type": "WebPage"', '"@type": "Article"', '"@type": "WebSite"', 'at least 3 internal related links', 'invalid JSON-LD block']) assert.ok(build.includes(token), token);
});

test("Nagpur local page has bilingual content, official sources, FAQs and useful internal links", () => {
  assert.ok(nagpur.includes('"status": "draft"'));
  assert.ok(nagpur.includes('"nagpur-dslr"'));
  assert.ok(nagpur.includes('"mahabhumi-gateway"'));
  assert.ok(nagpur.includes('"faq"') && nagpur.includes('"faq_en"'));
  for (const url of ['https://nagpur.gov.in/district-superintendent-land-records/', 'https://bhulekh.mahabhumi.gov.in/', 'https://digitalsatbara.mahabhumi.gov.in/']) assert.ok(nagpur.includes(url), url);
  for (const path of ['states/maharashtra/', 'records/satbara-7-12/', 'records/property-card/', 'tools/land-unit-converter/', 'maps/']) assert.ok(nagpur.includes(path), path);
  assert.ok(nagpurEn.includes('Nagpur district land-records office'));
});

test("Nagpur facts point to official source metadata", () => {
  assert.equal(sources["nagpur-dslr"].kind, "official");
  assert.equal(sources["nagpur-dslr"].url, "https://nagpur.gov.in/district-superintendent-land-records/");
  assert.equal(sources["mahabhumi-gateway"].kind, "official");
  assert.ok(sources["nagpur-dslr"].basis.length > 30);
});

test("growth plan avoids fabricated traffic estimates and ad-code placeholders", () => {
  assert.ok(strategy.includes("not a forecast or guarantee"));
  assert.ok(strategy.includes("Do **not** mass-create"));
  assert.ok(strategy.includes("No ad boxes, ad code"));
});
