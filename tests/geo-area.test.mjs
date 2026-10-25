import test from "node:test";
import assert from "node:assert/strict";
import { fieldArea, distanceM, encodePoints, decodePoints, EARTH_RADIUS_M } from "../assets/js/tools/geo-area.js";

const near = (a, b, rel) => assert.ok(Math.abs(a - b) <= rel * b, `${a} !≈ ${b}`);
// Degrees for a given number of metres along a meridian.
const dLat = (m) => (m / EARTH_RADIUS_M) * (180 / Math.PI);

test("100 m × 100 m square near Lucknow ≈ 1 hectare", () => {
  const lat = 26.85, lng = 80.95, d = dLat(100), e = d / Math.cos((lat * Math.PI) / 180);
  const r = fieldArea([[lat, lng], [lat, lng + e], [lat + d, lng + e], [lat + d, lng]]);
  assert.ok(r.ok);
  near(r.sqm, 10000, 0.001);
  near(r.sqft, 107639.104, 0.001);
  near(r.perimeterM, 400, 0.001);
});

test("order does not matter, crossing shapes and bad input are rejected", () => {
  const sq = [[20, 77], [20, 77.001], [20.001, 77.001], [20.001, 77]];
  near(fieldArea([...sq].reverse()).sqm, fieldArea(sq).sqm, 1e-9);
  assert.equal(fieldArea([sq[0], sq[2], sq[1], sq[3]]).reason, "self-intersecting");
  assert.equal(fieldArea(sq.slice(0, 2)).ok, false);
  assert.equal(fieldArea([[20, 77], [20, 77], [20, 77]]).ok, false);
  assert.equal(fieldArea([[95, 77], [20, 77.001], [20.001, 77]]).reason, "invalid");
});

test("distance and URL encoding", () => {
  near(distanceM([0, 0], [dLat(1000), 0]), 1000, 1e-6);
  const pts = [[26.123456, 80.654321], [26.2, 80.7], [26.1, 80.8]];
  assert.deepEqual(decodePoints(encodePoints(pts)), pts);
  assert.equal(decodePoints("1,2;abc"), null);
  assert.equal(decodePoints("100,2;1,2;1,3"), null);
  assert.deepEqual(decodePoints(""), []);
});
