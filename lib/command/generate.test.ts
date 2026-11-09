import { test } from "node:test";
import assert from "node:assert/strict";
import { GROUP_PREFIX, POLICE_SHARE, newCase, parseSaved, seedWorld } from "./generate.ts";
import { tick } from "./engine.ts";
import { SOS_ACK_WINDOW_MS, ackWindowMs } from "./alerting.ts";
import { AREA_KIND, areaIndex } from "./history.ts";
import { mulberry32 } from "./rng.ts";
import { WOMEN_CATEGORIES } from "./routing.ts";
import type { Case, World } from "./types.ts";
import { PRICE_ITEMS } from "../../data/command/prices.ts";
import { HAZARDS, RECALLS } from "../../data/command/recalls.ts";

/** 19:00 and 03:00 in Bangladesh on 25 Oct 2026. */
const EVENING = Date.UTC(2026, 9, 25, 13, 0, 0);
const NIGHT = Date.UTC(2026, 9, 24, 21, 0, 0);

/** `count` live arrivals drawn against one world (each from the same world, so units never run out). */
function arrivals(world: World, count: number, at: number, seed = 1): Case[] {
  const r = mulberry32(seed);
  const out: Case[] = [];
  for (let i = 0; i < count; i++) {
    const w = newCase(world, r, at);
    out.push(w.cases[w.cases.length - 1]);
  }
  return out;
}

const W_EVENING = seedWorld(7, EVENING);
const EVENING_CASES = arrivals(W_EVENING, 6000, EVENING);
const police = EVENING_CASES.filter((c) => c.dept === "police");
const share = (cs: Case[], f: (c: Case) => boolean) => cs.filter(f).length / cs.length;

test("arrivals: every new category appears; SOS a few percent of all arrivals; women cases 15–20% of police", () => {
  for (const c of ["sexual-harassment", "domestic-violence", "kidnapping", "drugs", "sos"]) {
    assert.ok(police.some((x) => x.category === c), c);
  }
  assert.ok(Math.abs(police.length / EVENING_CASES.length - POLICE_SHARE) < 0.03);
  const sos = share(EVENING_CASES, (c) => c.category === "sos");
  assert.ok(sos > 0.015 && sos < 0.07, `SOS ${sos}`);
  // Over a whole day the women categories are 18% of police reports; in the evening peak a little more.
  const women = share(police, (c) => (WOMEN_CATEGORIES as readonly string[]).includes(c.category));
  assert.ok(women > 0.15 && women < 0.3, `women ${women}`);
  const night = arrivals(seedWorld(7, NIGHT), 4000, NIGHT).filter((c) => c.dept === "police");
  const nightWomen = share(night, (c) => c.category === "sexual-harassment");
  assert.ok(share(police, (c) => c.category === "sexual-harassment") > 2 * nightWomen, "harassment is an evening problem");
  assert.ok(share(night, (c) => c.category === "drugs") > 1.5 * share(police, (c) => c.category === "drugs"), "drugs a late-night one");
});

test("arrivals: harassment skews to transport hubs and markets", () => {
  const hubShare = (cs: Case[]) => share(cs, (c) => ["transport", "market"].includes(AREA_KIND[areaIndex(c.place)]));
  const harassment = police.filter((c) => c.category === "sexual-harassment");
  const domestic = police.filter((c) => c.category === "domestic-violence");
  assert.ok(hubShare(harassment) > 0.6, String(hubShare(harassment)));
  assert.ok(hubShare(harassment) > hubShare(domestic) + 0.25);
  for (const c of police) assert.ok(areaIndex(c.place) >= 0, "police cases land in a listed area");
});

test("arrivals: deterministic for a seed; SOS uses the shortest window", () => {
  assert.deepEqual(arrivals(W_EVENING, 50, EVENING, 9), arrivals(W_EVENING, 50, EVENING, 9));
  const sos = police.find((c) => c.category === "sos");
  assert.ok(sos);
  assert.equal(sos.severity, "critical");
  assert.equal(ackWindowMs(sos), SOS_ACK_WINDOW_MS);
  assert.ok(SOS_ACK_WINDOW_MS < 45_000);
  assert.equal(ackWindowMs({ category: "theft", severity: "high" }), 90_000);
  // An ignored SOS escalates after 30 s, before any other critical case would.
  const p = sos.alerts.find((a) => a.outcome === "pending");
  assert.ok(p);
  const w: World = { ...W_EVENING, cases: [...W_EVENING.cases, sos], nextArrivalAt: EVENING + 3600_000 };
  const after = tick(w, p.at + SOS_ACK_WINDOW_MS + 1, { responders: false }).cases.find((c) => c.id === sos.id);
  assert.equal(after?.alerts[0].outcome, "timed-out");
});

test("victims and involvement: plausible, and never anything about who a person is", () => {
  const ALLOWED_CASE_KEYS = new Set([
    "id", "dept", "agency", "category", "severity", "titleBn", "summaryBn", "place", "reportedAt", "status", "homeId", "assignedUnitId",
    "distanceKm", "etaMin", "firstAckAt", "resolvedAt", "overdue", "alerts", "timeline", "notes", "businessId",
    "victim", "anonymous", "involved", "productId",
  ]);
  const FORBIDDEN = /religio|ethnic|party|caste|appearance|skin|tribe|race/i;
  for (const c of [...EVENING_CASES, ...seedWorld(11, EVENING).cases]) {
    for (const k of Object.keys(c)) assert.ok(ALLOWED_CASE_KEYS.has(k), `${c.id} has ${k}`);
    assert.ok(!FORBIDDEN.test(JSON.stringify({ victim: c.victim, involved: c.involved })), c.id);
    if (c.involved) {
      for (const k of Object.keys(c.involved)) assert.ok(["kind", "groupId", "people"].includes(k), k);
      assert.ok(["ring", "gang", "repeat", "individual", "unknown"].includes(c.involved.kind));
      if (c.involved.kind === "ring" || c.involved.kind === "gang") {
        assert.match(c.involved.groupId ?? "", new RegExp(`^${GROUP_PREFIX[c.involved.kind]}-[০-৯]{2}$`));
        assert.ok((c.involved.people ?? 0) >= 2 && (c.involved.people ?? 0) <= 8);
      } else {
        assert.equal(c.involved.groupId, undefined);
      }
    }
    if (c.category === "sexual-harassment" || c.category === "domestic-violence") {
      assert.ok(c.victim === "woman" || c.victim === "child" || (c.category === "domestic-violence" && c.victim === "elderly"), c.id);
    }
    if (c.dept !== "police") {
      assert.equal(c.victim, undefined);
      assert.equal(c.involved, undefined);
    }
  }
  // Rings and gangs come from a small pool per division: one code never spans two divisions.
  const divisionsOf = new Map<string, Set<string>>();
  for (const c of police) {
    const g = c.involved?.groupId;
    if (!g) continue;
    divisionsOf.set(g, (divisionsOf.get(g) ?? new Set()).add(c.place.division));
  }
  assert.ok(divisionsOf.size >= 8);
  for (const [g, ds] of divisionsOf) assert.equal(ds.size, 1, g);
  // ...and a busy code links cases at several stations.
  const stationsOf = new Map<string, Set<string>>();
  for (const c of police) if (c.involved?.groupId && c.homeId) stationsOf.set(c.involved.groupId, (stationsOf.get(c.involved.groupId) ?? new Set()).add(c.homeId));
  assert.ok([...stationsOf.values()].some((s) => s.size >= 3));
  // Fear of retaliation and stigma: harassment is reported anonymously far more often than theft.
  const anon = (cat: string) => share(police.filter((c) => c.category === cat), (c) => c.anonymous === true);
  assert.ok(anon("sexual-harassment") > 2 * anon("theft"));
});

test("products: overpricing cases name an essential, fake and adulterated goods sometimes a recall the shop would stock", () => {
  const consumer = EVENING_CASES.filter((c) => c.dept === "consumer");
  const priced = consumer.filter((c) => c.category === "overpricing" && c.productId);
  const recalled = consumer.filter((c) => (c.category === "fake-product" || c.category === "adulteration") && c.productId);
  assert.ok(priced.length > 10 && recalled.length > 10);
  for (const c of priced) {
    const item = PRICE_ITEMS.find((p) => p.id === c.productId);
    assert.ok(item, c.productId);
    assert.ok(c.titleBn.includes(item.nameBn) || c.summaryBn.includes(item.nameBn), c.id);
    const b = W_EVENING.businesses.find((x) => x.id === c.businessId);
    assert.ok(b && ["grocery", "market"].includes(b.kind));
    if (item.fixed) assert.match(c.summaryBn, /সরকার নির্ধারিত/);
  }
  for (const c of recalled) {
    const rc = RECALLS.find((r) => r.id === c.productId);
    assert.ok(rc, c.productId);
    assert.equal(HAZARDS[rc.hazard].category, c.category);
    const b = W_EVENING.businesses.find((x) => x.id === c.businessId);
    assert.ok(b && rc.kinds.includes(b.kind), `${rc.id} at ${b?.kind}`);
    assert.ok(c.summaryBn.includes(rc.brandBn), c.id);
  }
  for (const c of EVENING_CASES) assert.ok(!c.titleBn.includes("{product}") && !c.summaryBn.includes("{product}"));
  for (const c of consumer.filter((x) => !x.productId)) assert.ok(!c.summaryBn.includes("তুলে নেওয়ার নির্দেশ"), c.id);
});

test("saved worlds: v2 fields round-trip; malformed ones and unknown categories reseed", () => {
  const w = seedWorld(11, EVENING);
  assert.equal(w.version, 2);
  assert.deepEqual(parseSaved(JSON.stringify(w), EVENING), w);
  const bad: unknown[] = [
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, victim: "man" } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, anonymous: "yes" } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, involved: { kind: "mafia" } } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, involved: { kind: "ring", groupId: 7 } } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, productId: 3 } : c)) },
    { ...w, cases: w.cases.map((c, i) => (i === 0 ? { ...c, category: "piracy" } : c)) },
  ];
  for (const b of bad) assert.equal(parseSaved(JSON.stringify(b), EVENING), null);
});
