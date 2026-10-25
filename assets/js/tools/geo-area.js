// Area of a field from GPS / map points (latitude, longitude in degrees). Pure functions, no DOM.
// Points are projected to a local flat plane (metres) around their centre; for field-sized shapes
// (a few km at most) the error of this projection is far below GPS error.
import { polygon, MAX_POLYGON_POINTS } from "./plot-area.js";

export const EARTH_RADIUS_M = 6371008.8; // IUGG mean Earth radius
const FT_PER_M = 1 / 0.3048;
const rad = (d) => (d * Math.PI) / 180;

export function validPoint(p) {
  return Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 85 && Math.abs(p[1]) <= 180;
}

/** [[lat,lng],…] → [[x,y],…] in metres (equirectangular around the mean point). */
export function toLocalMetres(points) {
  const lat0 = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng0 = points.reduce((s, p) => s + p[1], 0) / points.length;
  const k = Math.cos(rad(lat0));
  return points.map(([lat, lng]) => [rad(lng - lng0) * k * EARTH_RADIUS_M, rad(lat - lat0) * EARTH_RADIUS_M]);
}

/** Great-circle distance between two [lat,lng] points, in metres (haversine). */
export function distanceM(a, b) {
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Area of the closed shape through the points. Returns { ok, sqft, sqm, perimeterM } or { ok:false, reason }. */
export function fieldArea(points) {
  if (!Array.isArray(points) || points.length < 3 || points.length > MAX_POLYGON_POINTS || !points.every(validPoint)) return { ok: false, reason: "invalid" };
  const metres = toLocalMetres(points);
  const r = polygon(metres.map(([x, y]) => [x * FT_PER_M, y * FT_PER_M]));
  if (!r.ok) return r;
  let perimeterM = 0;
  for (let i = 0; i < points.length; i++) perimeterM += distanceM(points[i], points[(i + 1) % points.length]);
  return { ok: true, sqft: r.area, sqm: r.area / (FT_PER_M * FT_PER_M), perimeterM };
}

/** Points ↔ compact URL text "lat,lng;lat,lng" (6 decimals ≈ 11 cm). */
export function encodePoints(points) {
  return points.map(([a, b]) => `${a.toFixed(6)},${b.toFixed(6)}`).join(";");
}
export function decodePoints(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const pts = text.split(";").map((s) => s.split(",").map(Number));
  return pts.length <= MAX_POLYGON_POINTS && pts.every(validPoint) ? pts : null;
}
