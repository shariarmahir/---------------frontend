import { test } from "node:test";
import assert from "node:assert/strict";
import { divisionShapes, MAP_HEIGHT, MAP_WIDTH } from "../../data/bangladesh-map.ts";
import { PIXEL_MASK } from "../../data/gori/pixel-mask.ts";
import { assignPixels, GRID, isRestored, rasterize } from "./pixel-map.ts";

test("the stored mask matches a fresh raster of the division outlines", () => {
  assert.deepEqual(PIXEL_MASK, rasterize(divisionShapes.map((d) => d.d), MAP_WIDTH, MAP_HEIGHT, GRID));
  assert.equal(PIXEL_MASK.length, GRID);
  for (const r of PIXEL_MASK) assert.equal(r.length, GRID);
});

test("every land pixel belongs to exactly one module, evenly and deterministically", () => {
  const px = assignPixels(PIXEL_MASK);
  const land = PIXEL_MASK.join("").split("#").length - 1;
  assert.equal(px.length, land);
  const counts = new Array(32).fill(0);
  for (const p of px) counts[p.module]++;
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
  assert.deepEqual(assignPixels(PIXEL_MASK), px);
});

test("restoration clears a module's pixels in proportion", () => {
  const px = assignPixels(PIXEL_MASK).filter((p) => p.module === 0);
  assert.equal(px.filter((p) => isRestored(p, 0)).length, 0);
  assert.equal(px.filter((p) => isRestored(p, 1)).length, px.length);
  const half = px.filter((p) => isRestored(p, 0.5)).length;
  assert.ok(Math.abs(half - px.length / 2) <= 1);
});

test("a module's pixels are spread across the country, not one blob", () => {
  const px = assignPixels(PIXEL_MASK).filter((p) => p.module === 6);
  const ys = px.map((p) => p.y);
  assert.ok(Math.max(...ys) - Math.min(...ys) > 30);
});
