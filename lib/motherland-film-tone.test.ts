import assert from "node:assert/strict";
import { test } from "node:test";
import { LIGHT_COLS, LIGHT_ROWS, filmRegion, lightMap, navyShare, nextTone, settleLight } from "./motherland-film-tone.ts";

const pixels = (...grey: number[]) => grey.flatMap((g) => [g, g, g, 255]);

test("navy reads on the bright parts of a film, gold on the dark parts", () => {
  assert.equal(navyShare(pixels(240, 200)), 1);
  assert.equal(navyShare(pixels(10, 60)), 0);
  assert.equal(navyShare(pixels(240, 10)), 0.5);
});

test("a scrim that dims the film can turn navy back to gold", () => {
  assert.equal(navyShare(pixels(110), 1), 1);
  assert.equal(navyShare(pixels(110), 0.7), 0);
});

test("the light map has no hard edge between a dark half and a bright half", () => {
  const rgba = Array.from({ length: LIGHT_COLS * LIGHT_ROWS }, (_, i) => (i % LIGHT_COLS < LIGHT_COLS / 2 ? 0 : 255)).flatMap((g) => [g, g, g, 255]);
  const map = lightMap(rgba);
  const edge = map[LIGHT_COLS / 2 - 1];
  assert.equal(map[0], 0);
  assert.ok(edge > 0 && edge < 1);
});

test("the settled light moves towards the film's slowly, never in one jump", () => {
  const settled = new Float32Array([0]);
  const bytes = new Uint8Array(1);
  settleLight(settled, new Float32Array([1]), 0.1, bytes);
  assert.ok(settled[0] > 0 && settled[0] < 0.1);
  for (let i = 0; i < 300; i++) settleLight(settled, new Float32Array([1]), 0.1, bytes);
  assert.ok(settled[0] > 0.99);
  assert.ok(bytes[0] >= 253);
});

test("a word near the threshold keeps its colour instead of flickering", () => {
  assert.equal(nextTone("gold", 0.5), "gold");
  assert.equal(nextTone("navy", 0.5), "navy");
  assert.equal(nextTone("gold", 0.6), "navy");
  assert.equal(nextTone("navy", 0.4), "gold");
});

test("a word on screen maps onto the film as object-fit: cover draws it", () => {
  const film = { left: 0, top: 0, width: 1000, height: 1000 };
  // A 2:1 film in a square screen is cut at the sides: 1000px of screen shows its middle half.
  const region = filmRegion({ left: 0, top: 500, width: 1000, height: 100 }, film, { width: 2000, height: 1000 }, { width: 100, height: 50 });
  assert.deepEqual(region, { left: 25, top: 25, width: 50, height: 5 });
});

test("a word past the film's edge still reads at least one pixel inside the copy", () => {
  const region = filmRegion({ left: 990, top: 990, width: 500, height: 500 }, { left: 0, top: 0, width: 1000, height: 500 }, { width: 1000, height: 500 }, { width: 100, height: 50 });
  assert.deepEqual(region, { left: 99, top: 49, width: 1, height: 1 });
});
