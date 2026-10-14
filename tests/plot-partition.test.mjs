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
  assert.equal(rectangle(Number.MAX_VALUE, Number.MAX_VALUE).reason, "invalid");
  assert.equal(triangleBaseHeight(Number.MAX_VALUE, Number.MAX_VALUE).reason, "invalid");
  assert.equal(triangleSides(1e308, 1e308, 1e308).reason, "invalid");
});

test("quadrilateral via diagonal", () => {
  close(quadrilateral(3, 4, 3, 4, 5).area, 12);
  assert.equal(quadrilateral(1, 1, 3, 4, 5).ok, false);
});

test("polygon shoelace", () => {
  close(polygon([[0, 0], [10, 0], [10, 5], [0, 5]]).area, 50);
  close(polygon([[0, 0], [4, 0], [0, 3]]).area, 6);
  assert.equal(polygon([[0, 0], [1, 1]]).ok, false);
  assert.equal(polygon([[0, 0], [1], [0, 1]]).reason, "invalid");
  assert.equal(polygon([[0, 0], null, [0, 1]]).reason, "invalid");
  assert.equal(polygon([[0, 0], [1, Infinity], [0, 1]]).reason, "invalid");
  assert.equal(polygon([[0, 0], [1, 1], [2, 2]]).reason, "zero-area");
  assert.equal(polygon([[0, 0], [2, 2], [2, 0], [0, 2]]).reason, "self-intersecting");
  assert.equal(polygon([[0, 0], [1e308, 0], [0, 1e308]]).reason, "invalid");
});

test("parsePoints rejects bad parsers, incomplete and malformed coordinate sets", () => {
  const num = (s) => Number(s);
  assert.deepEqual(parsePoints("0,0\n10 5\n3;4", num), [[0, 0], [10, 5], [3, 4]]);
  assert.equal(parsePoints("1,2,3", num), null);
  assert.equal(parsePoints("a,b", num), null);
  assert.equal(parsePoints("0,0\n1,1", num), null);
  assert.equal(parsePoints("0,0\n1,1\n2,2", null), null);
});

test("length units reject invalid and overflowing measurements", () => {
  close(lengthToFeet(1, "m"), 3.280839895013123, 1e-12);
  close(lengthToFeet(2, "yd"), 6);
  close(lengthToFeet(10, "custom", 3), 30);
  assert.ok(Number.isNaN(lengthToFeet(10, "custom", null)));
  assert.ok(Number.isNaN(lengthToFeet(0, "m")));
  assert.ok(Number.isNaN(lengthToFeet(-1, "ft")));
  assert.ok(Number.isNaN(lengthToFeet(Infinity, "m")));
  assert.ok(Number.isNaN(lengthToFeet(10, "unknown")));
  assert.ok(Number.isNaN(lengthToFeet(Number.MAX_VALUE, "m")));
  close(rectangle(lengthToFeet(10, "m"), lengthToFeet(10, "m")).area, 1076.3910416709722, 1e-9);
});

test("parseShare rejects malformed and non-positive fractions", () => {
  close(parseShare("1/3"), 1 / 3);
  close(parseShare("25%"), 0.25);
  close(parseShare("०.५"), 0.5);
  assert.ok(Number.isNaN(parseShare("2")));
  assert.ok(Number.isNaN(parseShare("1/0")));
  assert.ok(Number.isNaN(parseShare("1/-2")));
  assert.ok(Number.isNaN(parseShare("abc")));
});

test("partition splits validate total, share count and numeric overflow", () => {
  const e = splitEqual(900, 3);
  assert.deepEqual(e.parts, [300, 300, 300]);
  const s = splitByShares(1000, [0.5, 0.25, 0.25]);
  assert.deepEqual(s.parts, [500, 250, 250]);
  assert.equal(splitByShares(1000, [0.5, 0.25]).reason, "shares-under");
  assert.equal(splitByShares(1000, null).reason, "invalid");
  assert.equal(splitByShares(1000, []).reason, "invalid");
  assert.equal(splitByShares(1000, [-0.1, 1.1]).reason, "invalid");
  assert.equal(splitByShares(1000, [0, 1]).reason, "invalid");
  assert.equal(splitByShares(1000, [0.6, 0.6]).reason, "shares-over");
  assert.equal(splitByShares(300, [1 / 3, 1 / 3, 1 / 3]).ok, true);
  assert.equal(splitEqual(10, 0).ok, false);
  assert.equal(splitEqual(Number.MAX_VALUE, 1).ok, true);
  assert.equal(splitByShares(Number.MAX_VALUE, [1, 1]).reason, "shares-over");
  assert.equal(splitByShares(Number.MAX_VALUE, [0.5, 0.5]).ok, true);
});
