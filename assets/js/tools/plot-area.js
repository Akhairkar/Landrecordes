// LandRecord — plot/field area from measurements. Pure functions; results in the square of the input length unit.
// Callers convert lengths to feet first (see lengthToFeet) so the area comes out in square feet.

/** Exact length units only. Local units (kadi, jarib, hath…) are supplied by the user as feet-per-unit. */
export const LENGTH_FEET = { ft: 1, m: 1 / 0.3048, yd: 3, in: 1 / 12 };

export function lengthToFeet(value, unit, localFeet = null) {
  if (unit === "custom") return Number.isFinite(localFeet) && localFeet > 0 ? value * localFeet : NaN;
  const f = LENGTH_FEET[unit];
  return f ? value * f : NaN;
}

const positive = (...xs) => xs.every((x) => Number.isFinite(x) && x > 0);

export function rectangle(l, w) {
  if (!positive(l, w)) return { ok: false, reason: "invalid" };
  return { ok: true, area: l * w, steps: [`क्षेत्रफल = लंबाई × चौड़ाई = ${l} × ${w}`] };
}

export function triangleBaseHeight(b, h) {
  if (!positive(b, h)) return { ok: false, reason: "invalid" };
  return { ok: true, area: 0.5 * b * h, steps: [`क्षेत्रफल = ½ × आधार × ऊँचाई = ½ × ${b} × ${h}`] };
}

/** Heron's formula. Rejects impossible triangles. */
export function triangleSides(a, b, c) {
  if (!positive(a, b, c)) return { ok: false, reason: "invalid" };
  if (a + b <= c || a + c <= b || b + c <= a) return { ok: false, reason: "not-a-triangle" };
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return { ok: true, area, steps: [`s = (a+b+c)/2 = ${s}`, `क्षेत्रफल = √(s(s−a)(s−b)(s−c))`] };
}

/** Quadrilateral ABCD: sides AB=a, BC=b, CD=c, DA=d and diagonal AC=e → triangles (a,b,e) + (c,d,e). */
export function quadrilateral(a, b, c, d, e) {
  const t1 = triangleSides(a, b, e);
  const t2 = triangleSides(c, d, e);
  if (!t1.ok || !t2.ok) return { ok: false, reason: t1.ok ? t2.reason : t1.reason };
  return { ok: true, area: t1.area + t2.area, steps: ["विकर्ण AC से चतुर्भुज को दो त्रिभुजों में बाँटा", `त्रिभुज ABC = ${t1.area.toFixed(2)}`, `त्रिभुज ACD = ${t2.area.toFixed(2)}`] };
}

/** Shoelace formula for a simple polygon given [[x,y],…] in the same length unit. Rejects <3 points / zero area / self-crossing. */
export function polygon(points) {
  if (!Array.isArray(points) || points.length < 3 || points.some((p) => !p.every(Number.isFinite))) return { ok: false, reason: "invalid" };
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  const area = Math.abs(sum) / 2;
  if (selfIntersects(points)) return { ok: false, reason: "self-intersecting" };
  if (area === 0) return { ok: false, reason: "zero-area" };
  return { ok: true, area, steps: ["शू-लेस (Shoelace) सूत्र: ½ |Σ(xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)|"] };
}

function ccw(a, b, c) { return (c[1] - a[1]) * (b[0] - a[0]) - (b[1] - a[1]) * (c[0] - a[0]); }
function segmentsCross(p1, p2, p3, p4) {
  const d1 = ccw(p3, p4, p1), d2 = ccw(p3, p4, p2), d3 = ccw(p1, p2, p3), d4 = ccw(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function selfIntersects(pts) {
  const n = pts.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) === 1 || (i === 0 && j === n - 1)) continue;
      if (segmentsCross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return true;
    }
  return false;
}

/** Parse lines like "0,0" / "10 5" / "१०, ५" into [[x,y],…]. Returns null on any bad line. */
export function parsePoints(text, parse) {
  const pts = [];
  for (const line of String(text).split(/\n+/).map((l) => l.trim()).filter(Boolean)) {
    const parts = line.split(/[,\s;]+/).filter(Boolean);
    if (parts.length !== 2) return null;
    const x = parse(parts[0]), y = parse(parts[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    pts.push([x, y]);
  }
  return pts;
}
