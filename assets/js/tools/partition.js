// LandRecord — batwara (partition) arithmetic. Pure proportional maths ONLY.
// It never decides who is entitled to what: shares are entered by the user.

/** Parse "1/3", "0.25", "25%", "१/४" into a fraction in (0,1] or NaN. */
export function parseShare(input) {
  let s = String(input ?? "").trim().replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966)).replace(/\s+/g, "");
  if (!s) return NaN;
  if (s.endsWith("%")) { const n = Number(s.slice(0, -1)); return n > 0 && n <= 100 ? n / 100 : NaN; }
  if (s.includes("/")) {
    const [a, b, ...rest] = s.split("/");
    const n = Number(a), d = Number(b);
    if (rest.length || !Number.isFinite(n) || !Number.isFinite(d) || d === 0) return NaN;
    const v = n / d;
    return v > 0 && v <= 1 ? v : NaN;
  }
  const v = Number(s);
  return Number.isFinite(v) && v > 0 && v <= 1 ? v : NaN;
}

export function splitEqual(total, n) {
  if (!Number.isFinite(total) || total <= 0 || !Number.isInteger(n) || n < 1 || n > 100) return { ok: false, reason: "invalid" };
  return { ok: true, parts: Array.from({ length: n }, () => total / n), sum: 1 };
}

/** shares: array of fractions. Requires they sum to 1 (±1e-9); otherwise reports the gap instead of guessing. */
export function splitByShares(total, shares) {
  if (!Number.isFinite(total) || total <= 0 || !shares.length || shares.some((s) => !Number.isFinite(s))) return { ok: false, reason: "invalid" };
  const sum = shares.reduce((a, b) => a + b, 0);
  const diff = 1 - sum;
  if (Math.abs(diff) > 1e-9) return { ok: false, reason: diff > 0 ? "shares-under" : "shares-over", sum, diff };
  return { ok: true, parts: shares.map((s) => total * s), sum };
}
