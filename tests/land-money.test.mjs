import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rateInAllUnits, totalPrice, registrationCost, formatINR, inrWords } from "../assets/js/tools/land-money.js";

const units = JSON.parse(readFileSync(new URL("../data/units.json", import.meta.url))).units;
const close = (a, b) => assert.ok(Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)), `${a} !≈ ${b}`);

test("rate conversion between units", () => {
  const r = rateInAllUnits(units, 43560, "acre");
  close(r.sqft, 1);
  close(r.sqyd, 9);
  close(r.hectare, 107639.10416709722);
  // local unit without a value is null; with a value it converts
  const local = units.find((u) => u.kind === "local");
  assert.equal(r[local.id], null);
  close(rateInAllUnits(units, 900, "sqyd", { [local.id]: 27225 })[local.id], 2722500);
  assert.equal(rateInAllUnits(units, -1, "acre"), null);
});

test("total price", () => {
  const t = totalPrice(units, 1000, "sqyd", 200, "sqyd");
  close(t.total, 200000);
  close(t.sqft, 1800);
  close(totalPrice(units, 5000000, "acre", 21780, "sqft").total, 2500000);
  const local = units.find((u) => u.kind === "local");
  assert.equal(totalPrice(units, 1, local.id, 1, "sqft").reason, "local-value-missing");
  assert.equal(totalPrice(units, NaN, "sqft", 1, "sqft").ok, false);
});

test("registration cost uses only entered percentages", () => {
  const r = registrationCost({ value: 1000000, dutyPct: 5, regPct: 1 });
  close(r.duty, 50000); close(r.reg, 10000); close(r.total, 60000);
  close(registrationCost({ value: 5000000, dutyPct: 6, regPct: 1, regCap: 30000, extra: 500 }).total, 330500);
  assert.equal(registrationCost({ value: 1, dutyPct: 120 }).reason, "percent-range");
  assert.equal(registrationCost({ value: -1, dutyPct: 5 }).ok, false);
});

test("formatting", () => {
  assert.equal(formatINR(1234567.4), "₹12,34,567");
  assert.equal(inrWords(25000000), "2.5 करोड़");
  assert.equal(inrWords(250000, "en"), "2.5 lakh");
  assert.equal(inrWords(5000), "");
});
