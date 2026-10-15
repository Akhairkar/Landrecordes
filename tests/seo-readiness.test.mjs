import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/layout.html", import.meta.url), "utf8");
const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
const sources = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));
const nagpur = readFileSync(new URL("../src/pages/districts/nagpur-land-records/index.html", import.meta.url), "utf8");
const nagpurEn = readFileSync(new URL("../src/pages/districts/nagpur-land-records/index.en.html", import.meta.url), "utf8");
const strategy = readFileSync(new URL("../docs/seo/COMPETITOR_AND_GROWTH_PLAN.md", import.meta.url), "utf8");
const pune = readFileSync(new URL("../src/pages/districts/pune-land-records/index.html", import.meta.url), "utf8");
const puneEn = readFileSync(new URL("../src/pages/districts/pune-land-records/index.en.html", import.meta.url), "utf8");

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

test("Pune local page has distinct official services, bilingual content and local FAQs", () => {
  assert.ok(pune.includes('"status": "draft"'));
  assert.ok(pune.includes('"pune-property-card"'));
  assert.ok(pune.includes('"maharashtra-emojni"'));
  assert.ok(pune.includes('"faq"') && pune.includes('"faq_en"'));
  for (const url of ['https://pune.gov.in/en/service/view-property-card/', 'https://bhulekh.mahabhumi.gov.in/', 'https://emojni.mahabhumi.gov.in/citizensite/Contactus.aspx']) assert.ok(pune.includes(url), url);
  for (const path of ['records/property-card/', 'records/satbara-7-12/', 'tools/land-unit-converter/', 'maps/', 'districts/nagpur-land-records/']) assert.ok(pune.includes(path), path);
  assert.ok(puneEn.includes('Pune district land-records office'));
});

test("Pune office contact is backed by official district source", () => {
  assert.equal(sources["pune-property-card"].kind, "official");
  assert.equal(sources["pune-property-card"].url, "https://pune.gov.in/en/service/view-property-card/");
  assert.equal(sources["maharashtra-emojni"].kind, "official");
  assert.ok(sources["pune-property-card"].basis.includes("phone"));
});


test("core record guides include practical FAQs, official next steps and title limits in both languages", () => {
  const recordPages = [
    ["src/pages/records/satbara-7-12/index.html", "src/pages/records/satbara-7-12/index.en.html", "AnyRoR", "8-अ"],
    ["src/pages/records/property-card/index.html", "src/pages/records/property-card/index.en.html", "Mahabhulekh", "CTS"],
    ["src/pages/records/mutation/index.html", "src/pages/records/mutation/index.en.html", "mutation", "म्यूटेशन"]
  ];
  for (const [hiPath, enPath, officialOrTopic, localTerm] of recordPages) {
    const hi = readFileSync(new URL("../" + hiPath, import.meta.url), "utf8");
    const en = readFileSync(new URL("../" + enPath, import.meta.url), "utf8");
    assert.match(hi, /अक्सर पूछे जाने वाले सवाल/);
    assert.match(en, /Frequently asked questions/);
    assert.ok(hi.includes(officialOrTopic) || hi.toLowerCase().includes(officialOrTopic.toLowerCase()), hiPath);
    assert.ok(en.toLowerCase().includes(officialOrTopic.toLowerCase()), enPath);
    assert.ok(hi.includes(localTerm) || hi.toLowerCase().includes(localTerm.toLowerCase()), hiPath);
    assert.ok(en.toLowerCase().includes(localTerm.toLowerCase()), enPath);
    assert.match(hi, /मालिकाना हक|टाइटल/);
    assert.match(en, /ownership|title/i);
  }
});
