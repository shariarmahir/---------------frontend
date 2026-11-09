import assert from "node:assert/strict";
import { test } from "node:test";
import { filmRegion, navyShare, nextTone, stepWord, wordTone } from "./motherland-film-tone.ts";

const pixels = (...grey: number[]) => grey.flatMap((g) => [g, g, g, 255]);

test("navy reads on bright film, and never on the mid-tones where it vanished", () => {
  assert.equal(navyShare(pixels(240, 200)), 1);
  assert.equal(navyShare(pixels(10, 60)), 0);
  assert.equal(navyShare(pixels(240, 10)), 0.5);
  // Sunlit leaves, the light of the forest Mahir marked: navy broke up there.
  assert.equal(navyShare(pixels(105)), 0);
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

test("a new colour melts slowly across a word, then the word is whole again", () => {
  const word = wordTone("gold");
  stepWord(word, 2, 1);
  assert.deepEqual([word.from, word.tone, word.sweep], ["gold", "navy", 0]);
  stepWord(word, 1.4);
  assert.ok(word.sweep > 0.4 && word.sweep < 0.6);
  stepWord(word, 2);
  assert.equal(word.sweep, 1);
});

test("a word doesn't change again until it has finished and held its colour", () => {
  const word = wordTone("gold");
  stepWord(word, 0.5, 1);
  assert.equal(word.tone, "gold");
  stepWord(word, 1, 1);
  assert.equal(word.tone, "navy");
  stepWord(word, 0.5, 0);
  assert.equal(word.tone, "navy");
  stepWord(word, 4, 0);
  assert.equal(word.tone, "gold");
});

test("on a dark film a word turns from gold to white and back, slowly", () => {
  const word = wordTone("gold");
  stepWord(word, 5, 0);
  assert.equal(word.tone, "gold");
  stepWord(word, 4, 0);
  assert.equal(word.tone, "white");
  stepWord(word, 4, 0);
  assert.equal(word.tone, "white");
  stepWord(word, 6, 0);
  assert.equal(word.tone, "gold");
});

test("a word on bright film is navy, whatever it was", () => {
  const white = wordTone("white", 2);
  stepWord(white, 0.1, 1);
  assert.equal(white.tone, "navy");
});
