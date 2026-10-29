// LandRecord — land price and registration-cost arithmetic. Pure functions (no DOM), unit-tested in Node.
// No rates, duties or fees are built in: every percentage or amount comes from the user.
import { sqftPerUnit } from "./land-units.js";

/** Rate per one unit of every unit, given `rate` money per one `fromId`. Local units without a value → null. */
export function rateInAllUnits(units, rate, fromId, local = {}) {
  const out = {};
  const from = units.find((u) => u.id === fromId);
  const f = sqftPerUnit(from, local);
  if (!Number.isFinite(rate) || rate < 0 || f == null) return null;
  const perSqft = rate / f;
  for (const u of units) {
    const s = sqftPerUnit(u, local);
    out[u.id] = s == null ? null : perSqft * s;
  }
  return out;
}

/** Total price of `area` in `areaUnit` at `rate` per `rateUnit`. Returns { ok, total, sqft } or { ok:false, reason }. */
export function totalPrice(units, rate, rateUnit, area, areaUnit, local = {}) {
  const ru = sqftPerUnit(units.find((u) => u.id === rateUnit), local);
  const au = sqftPerUnit(units.find((u) => u.id === areaUnit), local);
  if (ru == null || au == null) return { ok: false, reason: "local-value-missing" };
  if (![rate, area].every((n) => Number.isFinite(n) && n >= 0)) return { ok: false, reason: "invalid" };
  const sqft = area * au;
  const total = (sqft / ru) * rate;
  return Number.isFinite(total) ? { ok: true, total, sqft } : { ok: false, reason: "invalid" };
}

/**
 * Registration cost from user-entered percentages.
 * value: the amount duty is charged on; dutyPct / regPct: percentages; regCap: optional maximum registration fee;
 * extra: optional fixed other charges. Returns { ok, duty, reg, extra, total } or { ok:false, reason }.
 */
export function registrationCost({ value, dutyPct, regPct = 0, regCap = null, extra = 0 }) {
  const nums = [value, dutyPct, regPct, extra];
  if (!nums.every((n) => Number.isFinite(n) && n >= 0)) return { ok: false, reason: "invalid" };
  if (dutyPct > 100 || regPct > 100) return { ok: false, reason: "percent-range" };
  if (regCap != null && !(Number.isFinite(regCap) && regCap >= 0)) return { ok: false, reason: "invalid" };
  const duty = (value * dutyPct) / 100;
  let reg = (value * regPct) / 100;
  if (regCap != null && reg > regCap) reg = regCap;
  const total = duty + reg + extra;
  return Number.isFinite(total) ? { ok: true, duty, reg, extra, total } : { ok: false, reason: "invalid" };
}

/** ₹ with Indian grouping, whole rupees. */
export function formatINR(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

/** "1.5 करोड़ / 12 लाख" style words for large rupee amounts (Hindi or English). */
export function inrWords(n, lang = "hi") {
  if (!Number.isFinite(n) || n < 1e5) return "";
  const [cr, lk] = lang === "en" ? ["crore", "lakh"] : ["करोड़", "लाख"];
  const f = (x) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(x);
  return n >= 1e7 ? `${f(n / 1e7)} ${cr}` : `${f(n / 1e5)} ${lk}`;
}
