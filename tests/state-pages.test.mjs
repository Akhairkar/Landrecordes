import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { generate } from "../scripts/generators.mjs";

const root = new URL("../", import.meta.url);
const readJson = (p) => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pages = generate({ readJson, esc });
const states = readJson("data/states.json").states;

test("state pages list search methods when the state has a portal and methods", () => {
  for (const s of states) {
    const page = pages.find((p) => p.rel === `states/${s.id}/index.html`);
    assert.ok(page, `${s.id}: page generated`);
    const has = page.body.includes('class="lr-card lr-methods"');
    if (s.url && s.search_methods.length) assert.ok(has, `${s.id}: search-methods block missing`);
    if (!s.url && !s.registration_url) assert.ok(!has, `${s.id}: no portal, so no search-methods block`);
  }
});

test("states hub rows carry filter data for every state", () => {
  const hub = pages.find((p) => p.rel === "states/index.html");
  assert.equal((hub.body.match(/<tr data-name=/g) || []).length, states.length);
  assert.ok(hub.body.includes('id="st-filter"') && hub.body.includes(" hidden>"), "filter form starts hidden (no-JS shows all rows)");
  assert.deepEqual(hub.meta.scripts, ["assets/js/states-filter.js"]);
});

test("every browser script parses", () => {
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(new URL(dir, root), { withFileTypes: true })) {
      if (e.isDirectory() && e.name !== "vendor") walk(`${dir}${e.name}/`);
      else if (e.name.endsWith(".js")) files.push(`${dir}${e.name}`);
    }
  };
  walk("assets/js/");
  for (const f of files) execFileSync(process.execPath, ["--check", new URL(f, root).pathname]);
  assert.ok(files.length > 5);
});
