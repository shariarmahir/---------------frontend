import { test } from "node:test";
import assert from "node:assert/strict";
import { luminance, parseFocus, pickTone, shadeUnderScrim } from "./backdrop-tone.ts";

const patch = (r: number, g: number, b: number, n = 50) => Array.from({ length: n }, () => luminance(r, g, b));

test("gold on a dark photograph", () => {
  assert.equal(pickTone(patch(20, 40, 30)), "gold");
  assert.equal(pickTone(patch(0, 0, 0)), "gold");
});

test("white where gold is not comfortable but white is", () => {
  // Deep green, L ~0.12: gold is under 4.5:1 here, white is well over.
  assert.equal(pickTone(patch(60, 110, 50)), "white");
});

test("green on a very bright photograph (pale sky, the mustard field)", () => {
  assert.equal(pickTone(patch(255, 255, 255)), "green");
  assert.equal(pickTone(patch(215, 215, 40)), "green");
});

test("navy on a mid-bright photograph", () => {
  // L ~0.36: navy has the contrast, green is under 3:1 here.
  assert.equal(pickTone(patch(150, 170, 60)), "navy");
});

test("black on the mid tone where white and navy both fall short", () => {
  // L ~0.21: white is under 4.5:1 and navy is not yet comfortable.
  assert.equal(pickTone(patch(100, 135, 110)), "black");
});

test("a mixed patch goes to the colour that reads on more of it", () => {
  const mostlyBright = [...patch(250, 250, 200, 70), ...patch(10, 20, 15, 30)];
  const mostlyDark = [...patch(250, 250, 200, 30), ...patch(10, 20, 15, 70)];
  // The light colours read on the dark 70%, the dark ones on the bright 70%.
  assert.ok(["gold", "white"].includes(pickTone(mostlyDark)));
  assert.ok(["black", "navy", "green"].includes(pickTone(mostlyBright)));
});

test("every pick is one of the five UI colours", () => {
  const five = new Set(["gold", "white", "black", "green", "navy"]);
  for (let v = 0; v <= 255; v += 15) {
    assert.ok(five.has(pickTone(patch(v, v, v))));
    assert.ok(five.has(pickTone(patch(v, 255 - v, 40))));
  }
});

test("an empty patch falls back to white", () => {
  assert.equal(pickTone([]), "white");
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
