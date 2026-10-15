import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const states = JSON.parse(readFileSync(new URL("../data/states.json", import.meta.url), "utf8")).states;
const sources = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));
const allowedConfidence = new Set(["official-doc", "multi-source", "conflicting", "single-source", "unconfirmed"]);

test("state data has unique IDs and a supported portal confidence label", () => {
  const ids = states.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "state IDs must be unique");
  for (const state of states) {
    assert.ok(state.id && state.name_hi && state.name_en, "state identity fields required");
    assert.ok(allowedConfidence.has(state.confidence), `${state.id}: unsupported confidence label`);
  }
});

test("state portal addresses and source references are structurally valid", () => {
  for (const state of states) {
    assert.ok(Array.isArray(state.alt_urls), `${state.id}: alt_urls must be an array`);
    assert.ok(Array.isArray(state.sources) && state.sources.length > 0, `${state.id}: source references required`);
    for (const address of [state.url, ...state.alt_urls].filter(Boolean)) {
      assert.ok(["http:", "https:"].includes(new URL(address).protocol), `${state.id}: invalid portal URL protocol`);
    }
    for (const sourceId of state.sources) assert.ok(sources[sourceId], `${state.id}: unknown source ${sourceId}`);
  }
});


test("state pages have useful bilingual content, FAQs and safe portal guidance", () => {
  for (const state of states) {
    assert.ok(state.url === null || new URL(state.url).protocol === "https:", `${state.id}: primary portal must use HTTPS`);
    assert.ok(state.intro_hi?.length >= 80 && state.intro_en?.length >= 80, `${state.id}: bilingual introduction required`);
    assert.ok(state.steps_hi?.length >= 3 && state.steps_en?.length >= 3, `${state.id}: actionable steps required`);
    assert.ok(state.watch_hi?.length >= 2 && state.watch_en?.length >= 2, `${state.id}: bilingual cautions required`);
    assert.ok(state.faq?.length >= 1 && state.faq_en?.length >= 1, `${state.id}: bilingual FAQs required`);
    assert.ok(state.sources.some((id) => sources[id]?.kind === "official"), `${state.id}: at least one official reference required`);
  }
});

test("all generated state pages include a bilingual portal-safety note", async () => {
  const { generate } = await import("../scripts/generators.mjs");
  const root = new URL("../", import.meta.url);
  const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
  const generated = generate({ readJson, esc: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") });
  const pages = generated.filter((page) => page.rel.startsWith("states/") && page.rel.endsWith("/index.html") && page.rel.split("/").length === 3);
  assert.equal(pages.length, states.length);
  for (const page of pages) {
    assert.ok(page.body.includes("OTP"), `${page.rel}: English safety note`);
    assert.ok(page.body.includes("किसी अनजान एजेंट"), `${page.rel}: Hindi safety note`);
  }
});


test("all generated state pages warn against treating an online extract as conclusive ownership proof", async () => {
  const { generate } = await import("../scripts/generators.mjs");
  const root = new URL("../", import.meta.url);
  const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"));
  const generated = generate({ readJson, esc: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") });
  const pages = generated.filter((page) => page.rel.startsWith("states/") && page.rel.endsWith("/index.html") && page.rel.split("/").length === 3);
  assert.equal(pages.length, states.length);
  for (const page of pages) {
    assert.ok(page.body.includes("अंतिम प्रमाण न मानें"), `${page.rel}: Hindi ownership caution`);
    assert.ok(page.body.includes("conclusive proof of ownership"), `${page.rel}: English ownership caution`);
  }
});
