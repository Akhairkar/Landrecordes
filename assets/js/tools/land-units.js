// LandRecord — land unit conversion core. Pure functions (no DOM) so it is unit-tested in Node.
// Factors come from data/units.json; local units (bigha, biswa, …) need a user-supplied sq ft value.

const DEVANAGARI_ZERO = 0x0966;

/** Parse "1,250.5", "१२,५००", "12,5" (decimal comma) into a finite number or NaN. */
export function parseNumber(input) {
  if (typeof input === "number") return input;
  let s = String(input ?? "").trim();
  if (!s) return NaN;
  s = s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - DEVANAGARI_ZERO));
  s = s.replace(/\s+/g, "");
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  else if (/^\d+,\d+$/.test(s)) s = s.replace(",", ".");
  else s = s.replace(/,/g, "");
  return /^\d*\.?\d+$|^\d+\.$/.test(s) ? Number(s) : NaN;
}

/** Resolve sq-ft-per-unit for a unit, using local overrides for unit.kind === "local". Returns null if unknown. */
export function sqftPerUnit(unit, local = {}) {
  if (unit.sqft != null) return unit.sqft;
  const v = local[unit.id];
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** Convert value from one unit id to another. Returns { ok, value } or { ok:false, reason }. */
export function convert(units, value, fromId, toId, local = {}) {
  const from = units.find((u) => u.id === fromId);
  const to = units.find((u) => u.id === toId);
  if (!from || !to) return { ok: false, reason: "unknown-unit" };
  if (!Number.isFinite(value) || value < 0) return { ok: false, reason: "invalid-value" };
  const f = sqftPerUnit(from, local);
  const t = sqftPerUnit(to, local);
  if (f == null || t == null) return { ok: false, reason: "local-value-missing" };
  return { ok: true, value: (value * f) / t };
}

/** Convert to every unit; local units without a user value are returned as null. */
export function convertAll(units, value, fromId, local = {}) {
  const out = {};
  for (const u of units) {
    const r = convert(units, value, fromId, u.id, local);
    out[u.id] = r.ok ? r.value : null;
  }
  return out;
}

/** Format for display: up to `max` significant decimals, no trailing zeros, grouped thousands. */
export function formatNumber(n, max = 4) {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? max : 6;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(n);
}
