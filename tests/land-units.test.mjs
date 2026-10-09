import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseNumber, convert, convertAll, formatNumber } from "../assets/js/tools/land-units.js";

const { units } = JSON.parse(readFileSync(new URL("../data/units.json", import.meta.url), "utf8"));
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} !≈ ${b}`);
const val = (v, f, t, l) => { const r = convert(units, v, f, t, l); assert.ok(r.ok, r.reason); return r.value; };

test("definitions: acre/hectare/gaj", () => {
  close(val(1, "acre", "sqft"), 43560);
  close(val(1, "hectare", "acre"), 2.4710538146717, 1e-9);
  close(val(1, "acre", "sqm"), 4046.8564224, 1e-9);
  close(val(1, "sqyd", "sqft"), 9);
  close(val(1, "hectare", "sqm"), 10000, 1e-9);
});

test("customary units: kanal/marla/guntha/cent", () => {
  close(val(1, "kanal", "marla"), 20);
  close(val(8, "kanal", "acre"), 1, 1e-9);
  close(val(40, "guntha", "acre"), 1, 1e-9);
  close(val(100, "cent", "acre"), 1, 1e-9);
});

test("local units need a user value", () => {
  const r = convert(units, 2, "bigha", "acre");
  assert.equal(r.ok, false);
  assert.equal(r.reason, "local-value-missing");
  close(val(2, "bigha", "sqft", { bigha: 27000 }), 54000);
  close(val(1, "bigha", "biswa", { bigha: 27000, biswa: 1350 }), 20);
});

test("invalid inputs", () => {
  assert.equal(convert(units, -1, "acre", "sqft").ok, false);
  assert.equal(convert(units, NaN, "acre", "sqft").ok, false);
  assert.equal(convert(units, 1, "nope", "sqft").ok, false);
  close(val(0, "acre", "sqft"), 0);
});

test("parseNumber: Devanagari, grouping, decimal comma", () => {
  assert.equal(parseNumber("१२,५००"), 12500);
  assert.equal(parseNumber("1,250.5"), 1250.5);
  assert.equal(parseNumber("12,5"), 12.5);
  assert.equal(parseNumber("2.5"), 2.5);
  assert.ok(Number.isNaN(parseNumber("abc")));
  assert.ok(Number.isNaN(parseNumber("")));
});

test("convertAll leaves unset local units null", () => {
  const all = convertAll(units, 1, "acre");
  assert.equal(all.bigha, null);
  close(all.sqft, 43560);
});

test("formatNumber", () => {
  assert.equal(formatNumber(null), "—");
  assert.equal(formatNumber(43560), "43,560");
});

test("data integrity: every non-local unit has a source", () => {
  const sources = JSON.parse(readFileSync(new URL("../data/sources.json", import.meta.url), "utf8"));
  for (const u of units) {
    if (u.kind === "local") assert.equal(u.sqft, null);
    else { assert.ok(u.sqft > 0, u.id); assert.ok(sources[u.source], `${u.id} source`); }
  }
});
