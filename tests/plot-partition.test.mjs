import test from "node:test";
import assert from "node:assert/strict";
import { rectangle, triangleBaseHeight, triangleSides, quadrilateral, polygon, parsePoints, lengthToFeet } from "../assets/js/tools/plot-area.js";
import { parseShare, splitEqual, splitByShares } from "../assets/js/tools/partition.js";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} !≈ ${b}`);

test("rectangle and triangles", () => {
  close(rectangle(40, 30).area, 1200);
  close(triangleBaseHeight(10, 6).area, 30);
  close(triangleSides(3, 4, 5).area, 6);
  assert.equal(triangleSides(1, 2, 3).reason, "not-a-triangle");
  assert.equal(triangleSides(0, 2, 3).ok, false);
  assert.equal(rectangle(-1, 5).ok, false);
});

test("quadrilateral via diagonal", () => {
  // 3-4-5 triangles sharing hypotenuse 5 → 12
  close(quadrilateral(3, 4, 3, 4, 5).area, 12);
  assert.equal(quadrilateral(1, 1, 3, 4, 5).ok, false);
});

test("polygon shoelace", () => {
  close(polygon([[0, 0], [10, 0], [10, 5], [0, 5]]).area, 50);
  close(polygon([[0, 0], [4, 0], [0, 3]]).area, 6);
  assert.equal(polygon([[0, 0], [1, 1]]).ok, false);
  assert.equal(polygon([[0, 0], [1, 1], [2, 2]]).reason, "zero-area");
  assert.equal(polygon([[0, 0], [2, 2], [2, 0], [0, 2]]).reason, "self-intersecting"); // bow-tie
});

test("parsePoints", () => {
  const num = (s) => Number(s);
  assert.deepEqual(parsePoints("0,0\n10 5\n 3;4 ", num), [[0, 0], [10, 5], [3, 4]]);
  assert.equal(parsePoints("1,2,3", num), null);
  assert.equal(parsePoints("a,b", num), null);
});

test("length units", () => {
  close(lengthToFeet(1, "m"), 3.280839895013123, 1e-12);
  close(lengthToFeet(2, "yd"), 6);
  close(lengthToFeet(10, "custom", 3), 30);
  assert.ok(Number.isNaN(lengthToFeet(10, "custom", null)));
  // 10 m x 10 m = 100 m² = 1076.391 sq ft
  close(rectangle(lengthToFeet(10, "m"), lengthToFeet(10, "m")).area, 1076.3910416709722, 1e-9);
});

test("parseShare", () => {
  close(parseShare("1/3"), 1 / 3);
  close(parseShare("25%"), 0.25);
  close(parseShare("०.५"), 0.5);
  assert.ok(Number.isNaN(parseShare("2")));
  assert.ok(Number.isNaN(parseShare("1/0")));
  assert.ok(Number.isNaN(parseShare("abc")));
});

test("partition splits", () => {
  const e = splitEqual(900, 3);
  assert.deepEqual(e.parts, [300, 300, 300]);
  const s = splitByShares(1000, [0.5, 0.25, 0.25]);
  assert.deepEqual(s.parts, [500, 250, 250]);
  assert.equal(splitByShares(1000, [0.5, 0.25]).reason, "shares-under");
  assert.equal(splitByShares(1000, [0.6, 0.6]).reason, "shares-over");
  const thirds = splitByShares(300, [1 / 3, 1 / 3, 1 / 3]);
  assert.equal(thirds.ok, true); // float-safe sum
  assert.equal(splitEqual(10, 0).ok, false);
});
