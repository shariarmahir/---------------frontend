import { test } from "node:test";
import assert from "node:assert/strict";
import { HAZARDS, MAX_SEIZURE_UNITS, RECALLS, REGULATORS, advanceRecall, logSeizure, recallRows, recallsOf, seedRecalls } from "./recalls.ts";
import { parseSaved, seedWorld } from "./generate.ts";
import { resume } from "./engine.ts";
import type { ActionResult, Hazard, RegulatorId, World } from "./types.ts";

const T = Date.UTC(2026, 9, 25, 6, 0, 0);
const NOW = T + 5000;
const W = seedWorld(7, T);

const ok = (r: ActionResult): World => {
  assert.ok(r.ok, r.ok ? "" : r.error);
  return r.world;
};
const fails = (r: ActionResult, pattern?: RegExp) => {
  assert.equal(r.ok, false);
  if (!r.ok && pattern) assert.match(r.error, pattern);
};
/** The world with one recall set to a given state. */
const withRecall = (w: World, id: string, patch: Partial<NonNullable<World["recalls"]>[string]>): World => {
  const all = recallsOf(w);
  return { ...w, recalls: { ...all, [id]: { ...all[id], ...patch } } };
};

/** The 64 districts of Bangladesh (English spellings used across this module). */
const DISTRICTS = new Set([
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur", "Chapai Nawabganj", "Chattogram",
  "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
  "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia",
  "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
  "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
  "Sylhet", "Tangail", "Thakurgaon",
]);

/** Well-known brands sold in Bangladesh (and global ones) that must never appear on a "remove from sale" list. */
const REAL_BRANDS = [
  "pran", "square", "aci", "radhuni", "teer", "fresh", "rupchanda", "bashundhara", "nestle", "unilever", "marico", "parachute",
  "aarong", "igloo", "milk vita", "aftab", "kazi", "danish", "olympic", "ifad", "meghna", "city", "beximco", "incepta", "renata",
  "glow", "lovely", "lux", "cerelac", "lactogen", "nido", "dano", "arku", "banoful", "ruchi", "pusti", "sun", "golden", "bombay",
  "haque", "well food", "akij", "partex", "keya", "kohinoor", "sajeeb", "napa", "seclo", "ace", "fair",
];

test("recalls: about 14 fictional products, unique ids, real districts, positive units", () => {
  assert.ok(RECALLS.length >= 12 && RECALLS.length <= 16, String(RECALLS.length));
  assert.equal(new Set(RECALLS.map((r) => r.id)).size, RECALLS.length);
  for (const r of RECALLS) {
    assert.match(r.id, /^rc-\d{2}$/);
    assert.ok(r.brandBn && r.brand && r.productBn && r.product, r.id);
    assert.ok(r.districts.length > 0 && r.districts.every((d) => DISTRICTS.has(d)), `${r.id} ${r.districts.join(",")}`);
    assert.ok(Number.isInteger(r.seededUnits) && r.seededUnits > 0, r.id);
    assert.ok(r.kinds.length > 0, r.id);
    const words = r.brand.toLowerCase().split(/[\s-]+/);
    for (const b of REAL_BRANDS) assert.ok(!words.includes(b) && r.brand.toLowerCase() !== b, `${r.brand} looks like the real brand ${b}`);
  }
  assert.equal(new Set(RECALLS.map((r) => r.brand)).size, RECALLS.length, "one product per invented brand");
});

test("recalls: every hazard type is covered and goes to the real regulator for it", () => {
  const expected: Record<Hazard, RegulatorId> = {
    formalin: "bfsa",
    "carbide-ripening": "bfsa",
    "textile-dye": "bfsa",
    "adulterated-honey-ghee": "bfsa",
    "reused-oil": "bfsa",
    "unsafe-baby-food": "bfsa",
    "counterfeit-medicine": "dgda",
    "mercury-cream": "dgda",
    "fake-bsti-mark": "bsti",
    "expired-relabelled": "dncrp",
  };
  for (const r of RECALLS) assert.equal(r.regulator, expected[r.hazard], r.id);
  assert.deepEqual(new Set(RECALLS.map((r) => r.hazard)), new Set(Object.keys(expected)));
  assert.equal(REGULATORS.dgda.short, "DGDA");
  assert.equal(REGULATORS.bfsa.name, "Bangladesh Food Safety Authority");
  for (const [h, info] of Object.entries(HAZARDS)) {
    assert.ok(info.textBn.length > 20 && info.text.length > 20, h);
    // Real hazards, described in general terms: no invented figures.
    assert.ok(!/[0-9০-৯]/.test(info.textBn + info.text), h);
  }
});

test("seedRecalls: deterministic, in the past, states consistent with their units", () => {
  const a = seedRecalls(7, T);
  assert.deepEqual(a, seedRecalls(7, T));
  assert.notDeepEqual(a, seedRecalls(8, T));
  assert.deepEqual(W.recalls, a, "seedWorld carries them");
  const statuses = new Set<string>();
  for (const r of RECALLS) {
    const s = a[r.id];
    assert.ok(s, r.id);
    statuses.add(s.status);
    assert.ok(s.log.length >= 1 && s.log.every((e) => e.at < T && e.text.length > 3), r.id);
    for (let i = 1; i < s.log.length; i++) assert.ok(s.log[i].at >= s.log[i - 1].at, r.id);
    assert.equal(s.updatedAt, s.log[s.log.length - 1].at);
    if (s.status === "ordered") assert.equal(s.seizedUnits, 0, r.id);
    else assert.ok(s.seizedUnits >= 1 && s.seizedUnits <= r.seededUnits, r.id);
  }
  assert.ok(statuses.size >= 3, [...statuses].join());
});

test("advanceRecall: one step at a time; seized needs units; destroyed is final; nothing else changes", () => {
  const id = RECALLS[0].id;
  const start = withRecall(W, id, { status: "ordered", seizedUnits: 0, log: [] });
  const before = structuredClone(start);
  const w1 = ok(advanceRecall(start, id, NOW));
  assert.deepEqual(start, before, "input untouched");
  assert.equal(w1.recalls?.[id].status, "seizing");
  assert.equal(w1.recalls?.[id].updatedAt, NOW);
  assert.equal(w1.recalls?.[id].log.at(-1)?.text, "Seizure started");
  // Other recalls keep their objects.
  assert.equal(w1.recalls?.[RECALLS[1].id], start.recalls?.[RECALLS[1].id]);
  assert.equal(w1.cases, start.cases);
  fails(advanceRecall(w1, id, NOW), /Log the units seized/);
  const w2 = ok(logSeizure(w1, id, 120, NOW));
  const w3 = ok(advanceRecall(w2, id, NOW));
  assert.equal(w3.recalls?.[id].status, "seized");
  assert.match(w3.recalls?.[id].log.at(-1)?.text ?? "", /120 units held/);
  const w4 = ok(advanceRecall(w3, id, NOW));
  assert.equal(w4.recalls?.[id].status, "destroyed");
  assert.match(w4.recalls?.[id].log.at(-1)?.text ?? "", /^Destroyed 120 units under BFSA supervision$/);
  fails(advanceRecall(w4, id, NOW), /finished/);
  fails(advanceRecall(W, "rc-99", NOW), /not found/);
});

test("logSeizure: whole positive bounded units only; ordered moves to seizing; closed seizures refuse", () => {
  const id = RECALLS[2].id;
  const ordered = withRecall(W, id, { status: "ordered", seizedUnits: 0, log: [] });
  for (const bad of [0, -5, 1.5, Number.NaN, Infinity, MAX_SEIZURE_UNITS + 1]) fails(logSeizure(ordered, id, bad, NOW), /whole number/);
  const w = ok(logSeizure(ordered, id, 40, NOW));
  const s = w.recalls?.[id];
  assert.equal(s?.status, "seizing");
  assert.equal(s?.seizedUnits, 40);
  assert.deepEqual(s?.log.map((e) => e.text), ["Seizure started", "Seized 40 units"]);
  const more = ok(logSeizure(w, id, 1, NOW)).recalls?.[id];
  assert.equal(more?.seizedUnits, 41);
  assert.equal(more?.log.at(-1)?.text, "Seized 1 unit");
  fails(logSeizure(withRecall(W, id, { status: "seized", seizedUnits: 10 }), id, 5, NOW), /already complete/);
  fails(logSeizure(withRecall(W, id, { status: "destroyed", seizedUnits: 10 }), id, 5, NOW), /already complete/);
  fails(logSeizure(W, "rc-99", 5, NOW), /not found/);
});

test("recalls on a world saved without them: actions start from the seeded states", () => {
  const { recalls: _drop, ...rest } = W;
  void _drop;
  const old = rest as World;
  assert.deepEqual(recallsOf(old), seedRecalls(old.seed, old.now));
  const id = RECALLS.find((r) => recallsOf(old)[r.id].status !== "destroyed")?.id;
  assert.ok(id);
  const r = advanceRecall(old, id, NOW);
  assert.ok(r.ok || /Log the units/.test(r.error));
});

test("recallRows: joined and ordered (unfinished first, most dangerous first); stable while recalls are untouched", () => {
  const rows = recallRows(W);
  assert.equal(rows.length, RECALLS.length);
  assert.equal(recallRows(W), rows, "memoised");
  assert.equal(recallRows({ ...W, now: W.now + 1000 }), rows, "a tick that leaves the recalls alone keeps the array");
  const rank = { critical: 0, high: 1, medium: 2 } as const;
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1];
    const b = rows[i];
    const da = Number(a.state.status === "destroyed");
    const db = Number(b.state.status === "destroyed");
    assert.ok(da < db || (da === db && rank[a.item.danger] <= rank[b.item.danger]));
  }
  for (const r of rows) {
    assert.equal(r.hazard, HAZARDS[r.item.hazard]);
    assert.ok(r.progress >= 0 && r.progress <= 1);
  }
});

test("resume shifts recall times with the pause; parseSaved keeps good recalls and rejects broken ones", () => {
  const paused: World = { ...W, paused: true };
  const later = T + 10 * 60_000;
  const back = resume(paused, later);
  const id = RECALLS[0].id;
  assert.equal(back.recalls?.[id].updatedAt, (W.recalls?.[id].updatedAt ?? 0) + 10 * 60_000);
  assert.equal(back.recalls?.[id].log[0].at, (W.recalls?.[id].log[0].at ?? 0) + 10 * 60_000);
  assert.deepEqual(parseSaved(JSON.stringify(W), T), W);
  const broken: unknown[] = [
    { ...W, recalls: "x" },
    { ...W, recalls: { [id]: { ...W.recalls?.[id], status: "lost" } } },
    { ...W, recalls: { [id]: { ...W.recalls?.[id], seizedUnits: -1 } } },
    { ...W, recalls: { [id]: { ...W.recalls?.[id], seizedUnits: 2.5 } } },
    { ...W, recalls: { [id]: { ...W.recalls?.[id], log: [{ at: "soon", text: "x" }] } } },
    { ...W, recalls: { [id]: { ...W.recalls?.[id], log: [{ at: 1 }] } } },
  ];
  for (const b of broken) assert.equal(parseSaved(JSON.stringify(b), T), null, JSON.stringify(b).slice(0, 80));
});
