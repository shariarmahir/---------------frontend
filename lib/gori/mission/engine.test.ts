import { test } from "node:test";
import assert from "node:assert/strict";
import { modulesIn, PILLARS, pillarOf, RULES } from "../../../data/gori/mission.ts";
import { autoplay, botStep, suggest } from "./bot.ts";
import {
  apply,
  cascadePreview,
  clone,
  downstreamOf,
  legalActions,
  missionKey,
  NODES,
  replay,
  roadDistance,
  ROOTS,
  scoreMission,
  setup,
  whyNot,
  type MissionAction,
  type MissionConfig,
  type MissionState,
} from "./engine.ts";

const cfg = (seed = "m-1", difficulty: MissionConfig["difficulty"] = "intro"): MissionConfig => ({
  seed,
  difficulty,
  seats: [
    { name: "রিয়া", role: "organizer", bot: false },
    { name: "বট", role: "engineer", bot: true },
  ],
});

test("pillars split the 32 modules into four decks of eight", () => {
  for (const p of PILLARS) assert.equal(modulesIn(p.id).length, 8, p.id);
  assert.equal(new Set(NODES.map(pillarOf)).size, 4);
});

test("every module can be reached by road from the start hub", () => {
  for (const n of NODES) assert.ok(Number.isFinite(roadDistance(RULES.startHub, n)), `BD-${n}`);
});

test("root causes exist and are never downstream of anything", () => {
  assert.ok(ROOTS.length >= 5);
  for (const r of ROOTS) for (const n of NODES) assert.ok(!downstreamOf(n).includes(r));
});

test("setup: nine opening crises, hands dealt, one escalation per pile", () => {
  const s = setup(cfg());
  const total = NODES.reduce((a, n) => a + s.pressure[n], 0);
  assert.equal(total, 3 * 3 + 3 * 2 + 3);
  assert.equal(s.players[0].hand.length, 4);
  assert.equal(s.playerDeck.filter((c) => c.kind === "escalation").length, 4);
  assert.equal(s.playerDeck.length + 8, 32 + 6 + 4);
  assert.equal(s.crisisDeck.length + s.crisisDiscard.length, 32);
});

test("the same seed and actions replay to the same state", () => {
  const a = autoplay(setup(cfg("same")), 60);
  const b = autoplay(setup(cfg("same")), 60);
  assert.deepEqual(a.pressure, b.pressure);
  assert.deepEqual(a.players.map((p) => p.at), b.players.map((p) => p.at));
  assert.notDeepEqual(setup(cfg("other")).pressure, setup(cfg("same")).pressure);
});

test("illegal actions are refused with a reason", () => {
  const s = setup(cfg());
  const far = NODES.find((n) => n !== 1 && roadDistance(1, n) > 1)!;
  assert.match(whyNot(s, { type: "drive", to: far }) ?? "", /সংযোগ/);
  assert.throws(() => apply(s, { type: "drive", to: far }));
});

test("four actions end the turn: two cards drawn, crises placed, next player up", () => {
  let s = setup(cfg("turn"));
  const before = s.players[0].hand.length;
  for (let k = 0; k < 4; k++) s = apply(s, legalActions(s).find((a) => a.type === "drive")!);
  assert.equal(s.current, 1);
  assert.equal(s.turn, 1);
  const drew = s.events.find((e) => e.type === "draw")!;
  assert.ok(drew.type === "draw");
  assert.equal(s.players[0].hand.length, before + drew.cards.length);
  assert.ok(s.events.some((e) => e.type === "crisis"));
});

test("an overflowing module collapses once and pushes pressure downstream", () => {
  const s = clone(setup(cfg("cascade")));
  s.pressure = s.pressure.map(() => 0);
  s.players.forEach((p) => (p.role = "researcher"));
  s.pressure[8] = 3;
  const prev = cascadePreview(s, 8);
  assert.deepEqual(prev.collapsed, [8]);
  assert.deepEqual([...prev.hit].sort((a, b) => a - b), [...downstreamOf(8)].sort((a, b) => a - b));
  // A loop (5 → 32 → 5) collapses each member once, not forever.
  s.pressure[5] = 3;
  s.pressure[32] = 3;
  const loop = cascadePreview(s, 5);
  assert.equal(new Set(loop.collapsed).size, loop.collapsed.length);
  assert.ok(loop.collapsed.includes(32));
});

test("the community guardian shields their module and its neighbours", () => {
  const s = clone(setup(cfg("guard")));
  s.pressure = s.pressure.map(() => 0);
  s.players[0].role = "guardian";
  s.players[0].at = 8;
  s.pressure[8] = 3;
  const prev = cascadePreview(s, 1);
  assert.ok(!prev.hit.includes(8));
});

test("a reform needs a hub and three cards of one pillar; the researcher needs two", () => {
  let s = clone(setup(cfg("reform")));
  const pillar = "people" as const;
  const three = modulesIn(pillar).slice(0, 3);
  s.players[0].hand = three.map((n) => ({ kind: "node" as const, n }));
  s.players[0].at = 1;
  assert.match(whyNot(s, { type: "reform", pillar, cards: three.slice(0, 2) }) ?? "", /৩টি/);
  s = apply(s, { type: "reform", pillar, cards: three });
  assert.equal(s.reforms.people === "open", false);
  const r = clone(setup(cfg("reform")));
  r.players[0].role = "researcher";
  r.players[0].hand = three.slice(0, 2).map((n) => ({ kind: "node" as const, n }));
  assert.equal(whyNot(r, { type: "reform", pillar, cards: three.slice(0, 2) }), null);
  r.players[0].at = NODES.find((n) => !r.hubs.includes(n))!;
  assert.match(whyNot(r, { type: "reform", pillar, cards: three.slice(0, 2) }) ?? "", /কেন্দ্রে/);
});

test("all four reforms win at once", () => {
  let s = clone(setup(cfg("win")));
  s.reforms = { people: "reformed", economy: "reformed", state: "reformed", nature: "open" };
  const cards = modulesIn("nature").slice(0, 3);
  s.players[0].hand = cards.map((n) => ({ kind: "node" as const, n }));
  s = apply(s, { type: "reform", pillar: "nature", cards });
  assert.equal(s.outcome?.result, "win");
  assert.ok(scoreMission(s).total >= 70);
});

test("the hand limit pauses the game for a discard, then carries on", () => {
  let s = clone(setup(cfg("limit")));
  s.players[0].hand = NODES.slice(0, 7).map((n) => ({ kind: "node" as const, n }));
  s.actionsLeft = 1;
  s.playerDeck = s.playerDeck.filter((c) => c.kind !== "escalation");
  s = apply(s, { type: "end" });
  assert.equal(s.phase, "discard");
  assert.throws(() => apply(s, { type: "treat" }));
  while (s.phase === "discard") s = apply(s, botStep(s));
  assert.equal(s.current, 1);
  assert.ok(s.players[0].hand.length <= RULES.handLimit);
});

test("bots finish whole games; results replay to the same key and score", () => {
  let wins = 0;
  for (let i = 0; i < 12; i++) {
    const c = cfg(`bal-${i}`);
    c.seats = c.seats.map((x) => ({ ...x, bot: true }));
    c.seats[0].bot = false; // validation needs a human seat; autoplay drives it anyway
    const actions: MissionAction[] = [];
    let s: MissionState = setup(c);
    for (let k = 0; k < 5000 && !s.outcome; k++) {
      const a = botStep(s);
      actions.push(a);
      s = apply(s, a);
    }
    assert.ok(s.outcome, `game ${i} ended`);
    if (s.outcome.result === "win") wins++;
    const again = replay(c, actions);
    assert.equal(scoreMission(again).total, scoreMission(s).total);
    assert.equal(missionKey(c, actions), missionKey(c, actions.slice()));
  }
  assert.ok(wins >= 1, `bots won ${wins}/12 intro games`);
});

test("hints come with a reason a player can check", () => {
  const h = suggest(setup(cfg("hint")));
  assert.ok(h);
  assert.ok(h.reason.length > 10);
  assert.equal(whyNot(setup(cfg("hint")), h.action), null);
});
