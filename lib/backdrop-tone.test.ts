import { test } from "node:test";
import assert from "node:assert/strict";
import { contrast, luminance, parseFocus, pickLook, shadeUnderScrim, TONE_LUMINANCE } from "./backdrop-tone.ts";

/** `n` pixels of one colour, as flat r,g,b triples. */
const patch = (r: number, g: number, b: number, n = 50) => Array.from({ length: n }, () => [r, g, b]).flat();

/** Luminance of a colour under an ink scrim of opacity `a`. */
const under = (r: number, g: number, b: number, a: number) =>
  luminance(r * (1 - a) + 3 * a, g * (1 - a) + 32 * a, b * (1 - a) + 23 * a);

test("gold on a dark photograph, on the lightest scrim", () => {
  const look = pickLook(patch(20, 40, 30));
  assert.equal(look.tone, "gold");
  assert.equal(look.scrim, 0.12);
});

test("a deep green keeps gold on a light scrim", () => {
  const look = pickLook(patch(60, 110, 50));
  assert.equal(look.tone, "gold");
  assert.ok(look.scrim <= 0.3);
});

test("white on a bright, busy green, with just the scrim that brings it to 4.5:1", () => {
  // Sunlit leaves with shadow between them: too mixed for dark text.
  const look = pickLook([...patch(120, 160, 90, 80), ...patch(20, 35, 25, 20)]);
  assert.equal(look.tone, "white");
  assert.ok(contrast(1, under(120, 160, 90, look.scrim)) >= 4.5);
  assert.ok(contrast(1, under(120, 160, 90, look.scrim - 0.02)) < 4.5, "and no more scrim than that");
});

test("the mustard field with dark figures in it gets light text and a real scrim", () => {
  // 85% bright field, 15% dark clothing: dark text would vanish on the figures.
  const field = [...patch(215, 215, 40, 85), ...patch(25, 30, 35, 15)];
  const look = pickLook(field);
  assert.equal(look.tone, "white");
  assert.ok(look.scrim > 0.4);
  assert.ok(contrast(1, under(215, 215, 40, look.scrim)) >= 4.5);
});

test("dark text only on an evenly bright patch", () => {
  assert.equal(pickLook(patch(255, 255, 255)).tone, "green");
  assert.equal(pickLook(patch(150, 170, 60)).tone, "navy");
  for (const tone of ["green", "navy", "black"]) {
    const look = pickLook(patch(255, 255, 255));
    if (look.tone === tone) assert.equal(look.scrim, 0);
  }
});

test("a few dark specks do not rule dark text out", () => {
  const sky = [...patch(240, 245, 250, 98), ...patch(10, 10, 10, 2)];
  assert.notEqual(pickLook(sky).tone, "white");
});

test("every pick reads at its bar on all but the outliers", () => {
  for (let v = 0; v <= 255; v += 15) {
    for (const [r, g, b] of [[v, v, v], [v, 255 - v, 40]]) {
      const look = pickLook(patch(r, g, b));
      const bg = under(r, g, b, look.scrim);
      const bar = look.tone === "gold" ? 3 : 4.5;
      assert.ok(contrast(TONE_LUMINANCE[look.tone], bg) >= bar, `${look.tone} on ${r},${g},${b}`);
    }
  }
});

test("an empty patch gets the safe default", () => {
  assert.deepEqual(pickLook([]), { tone: "white", scrim: 0.45 });
});

test("the scrims darken the left and bottom, and leave the top right alone", () => {
  const topRight = shadeUnderScrim(200, 200, 200, 1, 0);
  assert.deepEqual(topRight.map(Math.round), [200, 200, 200]);
  const leftEdge = shadeUnderScrim(200, 200, 200, 0, 0);
  assert.ok(leftEdge[0] < 130, "40% ink at the left edge");
  const bottom = shadeUnderScrim(200, 200, 200, 1, 1);
  assert.ok(bottom[0] < 150, "30% ink at the bottom");
});

test("focus strings parse to fractions, with a safe default", () => {
  assert.deepEqual(parseFocus("50% 38%"), [0.5, 0.38]);
  assert.deepEqual(parseFocus("60% 42%"), [0.6, 0.42]);
  assert.deepEqual(parseFocus(undefined), [0.5, 0.5]);
  assert.deepEqual(parseFocus("center top"), [0.5, 0.5]);
});
