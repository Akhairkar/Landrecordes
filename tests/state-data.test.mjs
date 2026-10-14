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
