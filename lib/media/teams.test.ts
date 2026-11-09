import { test } from "node:test";
import assert from "node:assert/strict";
import { ESPORTS_GAMES, isFull, rosterSize, seatsLeft, winRate } from "./teams.ts";

test("an esports roster is the game's starters plus its substitutes", () => {
  assert.equal(rosterSize("pubgm"), 5);
  assert.equal(rosterSize("freefire"), 6);
  assert.equal(rosterSize("valorant"), 6);
  for (const g of Object.values(ESPORTS_GAMES)) assert.ok(g.roles.length >= g.starters - 1, g.name);
});

test("seats count down to zero; a team without a limit never fills", () => {
  assert.equal(seatsLeft(12, 9), 3);
  assert.equal(seatsLeft(5, 7), 0);
  assert.equal(seatsLeft(undefined, 400), Infinity);
  assert.equal(isFull(6, 6), true);
  assert.equal(isFull(6, 5), false);
  assert.equal(isFull(undefined, 99), false);
});

test("win rate counts draws as games played", () => {
  assert.equal(winRate({ w: 7, d: 1, l: 2 }), 70);
  assert.equal(winRate({ w: 0, d: 0, l: 0 }), 0);
});
