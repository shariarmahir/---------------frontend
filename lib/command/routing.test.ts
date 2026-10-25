import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_META, routeCategory } from "./routing.ts";
import { mulberry32, expGap, pick, weighted } from "./rng.ts";
import { haversineKm, nearestHome } from "./geo.ts";
import type { Category, ConsumerCategory } from "./types.ts";
import { CATEGORY_KINDS, TEMPLATES } from "../../data/command/templates.ts";
import { PLACES } from "../../data/command/places.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";
import { BUSINESSES, OFFICES, TEAMS } from "../../data/command/consumer.ts";

test("every category routes, has Bangla label and at least 3 templates", () => {
  assert.equal(Object.keys(CATEGORY_META).length, 17);
  for (const [c, m] of Object.entries(CATEGORY_META)) {
    assert.ok(m.labelBn && m.label && m.icon, c);
    assert.ok((TEMPLATES as Record<string, readonly unknown[]>)[c]?.length >= 3, c);
  }
});

test("templates use only the {area} and {business} slots; consumer ones name the business", () => {
  for (const [c, list] of Object.entries(TEMPLATES)) {
    const consumer = CATEGORY_META[c as keyof typeof CATEGORY_META].dept === "consumer";
    for (const t of list) {
      const text = `${t.titleBn} ${t.summaryBn}`;
      assert.ok(t.titleBn.length > 3 && t.summaryBn.length > 20, c);
      assert.ok(text.includes("{area}"), c);
      assert.equal(text.includes("{business}"), consumer, c);
      assert.ok(!/\{(?!area\}|business\})/.test(text), c);
    }
  }
});

test("routing: extortion to police (critical), adulteration to consumer, bribery to ACC", () => {
  assert.deepEqual(routeCategory("chadabaji"), { dept: "police", agency: undefined, severity: "critical" });
  assert.equal(routeCategory("adulteration").dept, "consumer");
  const b = routeCategory("bribery");
  assert.equal(b.dept, "other");
  assert.match(b.agency ?? "", /Anti-Corruption/);
});

test("data: enough places, stations, patrols, offices, teams and businesses, all inside Bangladesh, unique ids", () => {
  assert.ok(PLACES.length >= 60 && STATIONS.length >= 30 && OFFICES.length >= 15 && BUSINESSES.length >= 25);
  const all = [...STATIONS, ...PATROLS, ...OFFICES, ...TEAMS, ...BUSINESSES, ...PLACES];
  for (const p of all) assert.ok(p.lat > 20.5 && p.lat < 26.7 && p.lng > 88 && p.lng < 92.7, JSON.stringify(p));
  const ids = [...STATIONS, ...PATROLS, ...OFFICES, ...TEAMS, ...BUSINESSES].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of PATROLS) assert.ok(STATIONS.some((s) => s.id === p.homeId), p.id);
  for (const t of TEAMS) assert.ok(OFFICES.some((o) => o.id === t.homeId), t.id);
  assert.equal(new Set(PLACES.map((p) => p.division)).size, 8);
});

const DHAKA_THANAS = [
  "ramna", "shahbag", "dhanmondi", "mohammadpur", "mirpur-model", "pallabi", "kafrul", "gulshan", "banani", "badda",
  "rampura", "khilgaon", "motijheel", "paltan", "tejgaon", "uttara-east", "uttara-west", "jatrabari", "lalbagh", "kotwali-dhaka",
];

test("data: Dhaka metro coverage, patrol and team counts, positions, no phone numbers", () => {
  assert.ok(PLACES.filter((p) => p.district === "Dhaka").length >= 20);
  for (const slug of DHAKA_THANAS) assert.ok(STATIONS.some((s) => s.id === `st-${slug}`), slug);
  assert.ok(OFFICES.some((o) => o.id === "of-dhaka-hq"));
  for (const s of STATIONS) {
    const n = PATROLS.filter((p) => p.homeId === s.id).length;
    assert.ok(n >= 1 && n <= 3, `${s.id} has ${n} patrols`);
  }
  for (const o of OFFICES) {
    const n = TEAMS.filter((t) => t.homeId === o.id).length;
    assert.ok(n >= 1 && n <= 2, `${o.id} has ${n} teams`);
  }
  for (const p of PATROLS) {
    const s = STATIONS.find((x) => x.id === p.homeId)!;
    assert.ok(haversineKm(p, s) < 1.5, p.id);
  }
  for (const t of TEAMS) {
    const o = OFFICES.find((x) => x.id === t.homeId)!;
    assert.ok(haversineKm(t, o) < 1.5, t.id);
  }
  for (const s of [...STATIONS, ...OFFICES]) assert.equal(s.homeId, s.id);
  assert.ok(!JSON.stringify([...STATIONS, ...OFFICES]).match(/\d{8,}/), "no phone numbers");
});

test("data: every place has a police station within 8 km, and a consumer office within 40 km", () => {
  for (const p of PLACES) {
    const st = nearestHome(p, STATIONS, "police")!;
    assert.ok(haversineKm(p, st) <= 8, `${p.areaBn} is ${haversineKm(p, st).toFixed(1)} km from ${st.id}`);
    const of = nearestHome(p, OFFICES, "consumer")!;
    assert.ok(haversineKm(p, of) <= 40, `${p.areaBn} is ${haversineKm(p, of).toFixed(1)} km from ${of.id}`);
  }
  // every division has at least one station (stations carry no division, so use the places they serve)
  const served = new Set(PLACES.filter((p) => haversineKm(p, nearestHome(p, STATIONS, "police")!) <= 8).map((p) => p.division));
  assert.equal(served.size, 8);
});

test("templates: every business kind has a fitting template in every consumer category it can be filed under", () => {
  const kinds = new Set(BUSINESSES.map((b) => b.kind));
  for (const c of Object.keys(CATEGORY_META) as Category[]) {
    if (CATEGORY_META[c].dept !== "consumer") continue;
    const allowed = CATEGORY_KINDS[c as ConsumerCategory];
    for (const kind of kinds) {
      if (allowed && !allowed.includes(kind)) continue;
      const fits = TEMPLATES[c].some((t) => !t.kinds || t.kinds.includes(kind));
      assert.ok(fits, `${c} has no template for ${kind}`);
    }
  }
  // kinds named in templates and in CATEGORY_KINDS are real business kinds
  for (const list of Object.values(TEMPLATES)) for (const t of list) for (const k of t.kinds ?? []) assert.ok(kinds.has(k), k);
  for (const list of Object.values(CATEGORY_KINDS)) for (const k of list ?? []) assert.ok(kinds.has(k), k);
});

test("rng: seeded, reproducible and resumable from its state", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const xs = [a.next(), a.next(), a.next()];
  assert.deepEqual(xs, [b.next(), b.next(), b.next()]);
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  const resumed = mulberry32(a.state());
  assert.equal(resumed.next(), a.next());
  assert.ok(expGap(a, 20000) >= 1500);
  assert.equal(expGap({ next: () => 0.999999 }, 20000), 1500, "the 1.5 s floor applies");
  assert.ok(["x", "y"].includes(pick(a, ["x", "y"])));
  assert.equal(weighted(a, [{ item: "only", weight: 1 }, { item: "never", weight: 0 }]), "only");
});
