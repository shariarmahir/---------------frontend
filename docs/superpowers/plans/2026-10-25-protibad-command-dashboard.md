# প্রতিবাদ Command Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An open, super-admin style live dashboard at `/protibad/command` where demo complaints arrive live, route to the police or the ভোক্তা অধিদপ্তর (or an "other agencies" queue), alert the nearest unit first, escalate on timeout, and are worked as pending tasks with per-station and per-business CRM.

**Architecture:** A pure, tested simulation core in `lib/command` (seeded world, routing, nearest-unit ranking, tick/escalation, validated actions, selectors) drives a `useSyncExternalStore` browser store persisted to localStorage. UI in `components/command` and routes in `app/protibad/command` with its own dashboard shell; Leaflet + OpenStreetMap for the map, loaded client-only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, `node:test` for unit tests, Leaflet 1.9 (new dependency), Playwright (npx cache) for the smoke test.

Spec: `docs/superpowers/specs/2026-10-25-protibad-command-dashboard-design.md` (read it first).

## Global Constraints

- Self-contained: only `app/protibad/command/**`, `components/command/**`, `data/command/**`, `lib/command/**` are created; outside them only `app/protibad/...` masthead button (Task 4), `package.json` (Leaflet + test glob) and `package-lock.json` change. Nothing outside imports from these folders except that button.
- `lib/command/*.ts` and `data/command/*.ts` are run directly by `node --test` (Node strips types): they import each other with **relative paths ending in `.ts`** (e.g. `import { haversineKm } from "./geo.ts"`), never `@/`, and use no JSX, no `enum`, no `namespace`, no parameter properties. Components may use `@/`.
- English UI; categories, places, case text in Bangla (wrap Bangla in `font-bengali` and `lang="bn"`).
- All people, businesses and cases fictional. No real business names. No phone numbers for stations. Station coordinates labelled approximate.
- A "Demo data" badge and the line "Sample cases for demonstration. Real complaints are not shown here." on every dashboard page.
- Look: pitch-black `bg-black` ground; panels only `bg-bdnavy-900` (navy), `bg-text-primary` (ink) or `bg-cobalt` with `ring-1 ring-white/12`; titles gold `text-signal-orange`; red `text-national-crimson`/`bg-national-crimson` only for critical/overdue; no gradients on cards, no orange (`orange-*`, `#FF9100`, `#E65100`), no text below 12px (`text-xs` is the floor), no `uppercase`/all-caps eyebrows, gold text only on navy/ink/black (on cobalt only at ≥20px bold), dark text on gold. Match `components/hq/shell.tsx` and `components/hq/kit.tsx` for density and controls. Icons via `@/components/ui/icon` (`<Icon name="..."/>`, Material Symbols). Buttons via `btn` from `@/components/ui/section-kit` where they fit.
- Accessibility: 44px touch targets below lg, visible focus rings (`focus-visible:ring-2 focus-visible:ring-signal-orange`), reduced motion respected (`motion-reduce:` and `useReducedMotion` from `@/lib/use-reduced-motion`), the map is supplementary (all info also in lists).
- Do NOT commit (the owner commits). Do not start/stop the dev server on :3000; it is already running.
- Verify each task with: `npx tsc --noEmit` (exit 0), `npx eslint <changed paths>` (no errors), `npm test` (all pass).

---

### Task 1: Types, data, and the geo/routing core

**Files:**
- Create: `lib/command/types.ts`, `lib/command/rng.ts`, `lib/command/geo.ts`, `lib/command/routing.ts`
- Create: `data/command/stations.ts`, `data/command/consumer.ts`, `data/command/templates.ts`, `data/command/places.ts`
- Test: `lib/command/geo.test.ts`, `lib/command/routing.test.ts`
- Modify: `package.json` test script: append ` \"lib/command/*.test.ts\"` inside the `node --test` arguments.

**Interfaces (Produces):** `lib/command/types.ts` exactly:

```ts
export type Dept = "police" | "consumer" | "other";
export type PoliceCategory = "chadabaji" | "harassment" | "police-misconduct" | "theft" | "assault" | "protest";
export type ConsumerCategory = "adulteration" | "overpricing" | "fake-product" | "unsafe-business" | "false-weight";
export type OtherCategory = "bribery" | "land-grab" | "service-denial" | "environment" | "labour" | "other";
export type Category = PoliceCategory | ConsumerCategory | OtherCategory;
export type Severity = "critical" | "high" | "normal";
export type Status = "new" | "alerted" | "acknowledged" | "en-route" | "on-scene" | "resolved" | "closed";
export type UnitKind = "station" | "patrol" | "office" | "team";
export type UnitStatus = "available" | "busy" | "off-duty";
export type DivisionId = "dhaka" | "chattogram" | "khulna" | "rajshahi" | "sylhet" | "barishal" | "rangpur" | "mymensingh";

export interface LatLng { lat: number; lng: number }
export interface Place extends LatLng { division: DivisionId; district: string; areaBn: string }

export interface Unit extends LatLng {
  id: string;
  kind: UnitKind;
  dept: "police" | "consumer";
  name: string;
  nameBn: string;
  /** The station/office this unit belongs to (a station/office points at itself). */
  homeId: string;
  status: UnitStatus;
  /** Case the unit is working, when busy. */
  caseId?: string;
}

export type AlertOutcome = "pending" | "acknowledged" | "timed-out" | "declined";
export interface Alert { at: number; unitId: string; outcome: AlertOutcome }

export type TimelineKind = "reported" | "alerted" | "acknowledged" | "dispatched" | "arrived" | "resolved" | "closed" | "escalated" | "note" | "reopened" | "forwarded";
export interface TimelineEntry { at: number; kind: TimelineKind; text: string; by?: string }
export interface CaseNote { at: number; text: string; followUpAt?: number }

export interface Case {
  id: string;            // "PB-" + 6 digits, e.g. "PB-000042"
  dept: Dept;
  agency?: string;       // receiving body for dept "other" (English name)
  category: Category;
  severity: Severity;
  titleBn: string;
  summaryBn: string;
  place: Place;
  reportedAt: number;    // epoch ms
  status: Status;
  /** Owning station (police) or office (consumer): the nearest one to the place. */
  homeId?: string;
  assignedUnitId?: string;
  distanceKm?: number;
  etaMin?: number;
  /** First acknowledgement time, for response-time stats. */
  firstAckAt?: number;
  resolvedAt?: number;
  overdue?: boolean;
  alerts: Alert[];
  timeline: TimelineEntry[];
  notes: CaseNote[];
  businessId?: string;
}

export interface Business extends LatLng { id: string; nameBn: string; name: string; kind: string; district: string; division: DivisionId }

export interface World {
  version: 1;
  seed: number;
  now: number;
  /** RNG state, so a tick continues the same sequence. */
  rngState: number;
  nextId: number;
  /** Epoch ms when the next simulated case arrives. */
  nextArrivalAt: number;
  paused: boolean;
  cases: Case[];
  units: Unit[];
  businesses: Business[];
}

export type ActionResult = { ok: true; world: World } | { ok: false; error: string };
```

Other modules' exports:

- `rng.ts`: `export function mulberry32(state: number): { next(): number; state(): number }` (uniform [0,1); `state()` returns the current 32-bit state for persistence); `export function pick<T>(r: { next(): number }, items: readonly T[]): T`; `export function weighted<T>(r, items: readonly { item: T; weight: number }[]): T`; `export function expGap(r, meanMs: number): number` (exponential, min 1500).
- `geo.ts`: `haversineKm(a: LatLng, b: LatLng): number`; `SPEED_KMH = { patrol: 22, station: 22, team: 18, office: 18 } as const`; `etaMin(km: number, kind: UnitKind): number` (= max(3, round(km / speed * 60))); `rankUnits(place: LatLng, units: readonly Unit[], dept: "police" | "consumer"): { unit: Unit; km: number; eta: number }[]` — available units of that dept, kinds `patrol`/`station` for police and `team`/`office` for consumer, sorted by `eta` then `km`, patrols/teams before stations/offices on ties; `nearestHome(place: LatLng, units, dept): Unit | undefined` (nearest unit of kind station/office regardless of status); `lerp(a: LatLng, b: LatLng, t: number): LatLng`.
- `routing.ts`: `CATEGORY_META: Record<Category, { dept: Dept; agency?: string; labelBn: string; label: string; icon: string; severity: Severity }>` covering every `Category`; `routeCategory(c: Category): { dept: Dept; agency?: string; severity: Severity }`. Police: chadabaji critical, harassment critical, assault critical, theft high, protest high, police-misconduct high (dept police; misconduct goes to police too, the station's oversight). Consumer: adulteration high, unsafe-business high, fake-product normal, overpricing normal, false-weight normal. Other: bribery → "Anti-Corruption Commission (ACC)", land-grab → "Land Office / AC Land", service-denial → "Grievance Redress System (GRS)", environment → "Department of Environment", labour → "DIFE (Labour inspection)", other → "District Commissioner's Office"; all normal except bribery high. Bangla labels: চাঁদাবাজি, হয়রানি, পুলিশি অসদাচরণ, চুরি/ছিনতাই, হামলা, বিক্ষোভ/প্রতিবাদ, খাদ্যে ভেজাল, অতিরিক্ত দাম, নকল পণ্য, অনিরাপদ ব্যবসা, ওজনে কম, ঘুষ দাবি, জমি দখল, সেবা না পাওয়া, পরিবেশ দূষণ, শ্রম অধিকার, অন্যান্য.
- `data/command/places.ts`: `export const PLACES: readonly Place[]` — at least 60 real areas across all 8 divisions (Dhaka metro ≥ 20: মিরপুর ১০, ধানমন্ডি ২৭, মোহাম্মদপুর, শাহবাগ, মতিঝিল, গুলিস্তান, উত্তরা সেক্টর ৭, বনানী, গুলশান ১, তেজগাঁও, যাত্রাবাড়ী, পুরান ঢাকা লালবাগ, বাড্ডা, রামপুরা, খিলগাঁও, মালিবাগ, ফার্মগেট, কারওয়ান বাজার, আজিমপুর, সাভার; plus Chattogram, Khulna, Rajshahi, Sylhet, Barishal, Rangpur, Mymensingh, Cumilla, Narayanganj, Gazipur, Bogura, Jashore, Cox's Bazar areas) with approximate real coordinates (4 decimals).
- `data/command/stations.ts`: `export const STATIONS: readonly Unit[]` — ≥ 30 real thanas (kind `station`, dept police, status available, homeId = own id, id like `st-ramna`), Dhaka metro ≥ 15 (Ramna, Shahbag, Dhanmondi, Mohammadpur, Mirpur Model, Pallabi, Kafrul, Gulshan, Banani, Badda, Rampura, Khilgaon, Motijheel, Paltan, Tejgaon, Uttara East, Uttara West, Jatrabari, Lalbagh, Kotwali Dhaka) and every division represented; `export const PATROLS: readonly Unit[]` — 1–3 per station (kind `patrol`, id `pt-ramna-1`, name `Ramna Patrol 1`, nameBn `রমনা টহল ১`, homeId station id, placed within ~1.5 km of the station). Comment: "Approximate positions; real thana names; no phone numbers (see data/complaints.ts)."
- `data/command/consumer.ts`: `export const OFFICES: readonly Unit[]` (kind `office`, dept consumer: head office Karwan Bazar Dhaka + 8 divisional offices + ≥ 6 district offices, ids `of-dhaka-hq`, `of-ctg` …), `export const TEAMS: readonly Unit[]` (1–2 per office, kind `team`, `Inspection Team A`, `পরিদর্শন দল ক`), `export const BUSINESSES: readonly Business[]` — ≥ 25 clearly fictional businesses (invented names like "নতুন স্বাদ রেস্তোরাঁ", "সবুজ বাজার মুদি", kinds restaurant/grocery/pharmacy/bakery/fuel/market/sweetshop), near PLACES.
- `data/command/templates.ts`: `export const TEMPLATES: Record<Category, readonly { titleBn: string; summaryBn: string }[]>` — ≥ 3 per category; slots `{area}` and (consumer) `{business}` replaced at generation.

- [ ] **Step 1: Write failing tests** `lib/command/geo.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { etaMin, haversineKm, lerp, nearestHome, rankUnits } from "./geo.ts";
import type { Unit } from "./types.ts";

const u = (id: string, kind: Unit["kind"], lat: number, lng: number, status: Unit["status"] = "available", dept: Unit["dept"] = "police"): Unit =>
  ({ id, kind, dept, name: id, nameBn: id, homeId: "st-a", status, lat, lng });

test("haversine: Dhaka (Shahbag) to Chattogram is about 213 km", () => {
  const km = haversineKm({ lat: 23.7381, lng: 90.3958 }, { lat: 22.3569, lng: 91.7832 });
  assert.ok(km > 200 && km < 225, String(km));
  assert.equal(haversineKm({ lat: 23, lng: 90 }, { lat: 23, lng: 90 }), 0);
});

test("eta has a 3-minute floor and scales with speed", () => {
  assert.equal(etaMin(0.1, "patrol"), 3);
  assert.equal(etaMin(11, "patrol"), 30);
  assert.ok(etaMin(9, "team") > etaMin(9, "patrol"));
});

test("rankUnits: nearest available unit of the department first, busy and other-dept units skipped", () => {
  const scene = { lat: 23.75, lng: 90.39 };
  const units = [
    u("far", "patrol", 23.85, 90.40),
    u("near-busy", "patrol", 23.751, 90.391, "busy"),
    u("near", "patrol", 23.752, 90.392),
    u("team", "team", 23.7505, 90.3905, "available", "consumer"),
    u("st", "station", 23.76, 90.39),
  ];
  const ranked = rankUnits(scene, units, "police");
  assert.deepEqual(ranked.map((r) => r.unit.id), ["near", "st", "far"]);
  assert.ok(ranked[0].km < ranked[1].km);
});

test("nearestHome ignores status and picks the closest station", () => {
  const units = [u("s1", "station", 23.8, 90.4, "busy"), u("s2", "station", 24.5, 90.4), u("p", "patrol", 23.75, 90.39)];
  assert.equal(nearestHome({ lat: 23.75, lng: 90.39 }, units, "police")?.id, "s1");
});

test("lerp", () => {
  assert.deepEqual(lerp({ lat: 0, lng: 0 }, { lat: 10, lng: 20 }, 0.5), { lat: 5, lng: 10 });
});
```

and `lib/command/routing.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_META, routeCategory } from "./routing.ts";
import { TEMPLATES } from "../../data/command/templates.ts";
import { PLACES } from "../../data/command/places.ts";
import { PATROLS, STATIONS } from "../../data/command/stations.ts";
import { BUSINESSES, OFFICES, TEAMS } from "../../data/command/consumer.ts";

test("every category routes, has Bangla label and at least 3 templates", () => {
  for (const [c, m] of Object.entries(CATEGORY_META)) {
    assert.ok(m.labelBn && m.label && m.icon, c);
    assert.ok((TEMPLATES as Record<string, readonly unknown[]>)[c]?.length >= 3, c);
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
```

- [ ] **Step 2: Run** `node --test lib/command/*.test.ts` → FAIL (modules missing).
- [ ] **Step 3: Implement** the files above to the interfaces.
- [ ] **Step 4: Run** `node --test lib/command/*.test.ts` → PASS; then add the glob to `package.json` and run `npm test` → all pass; `npx tsc --noEmit` → exit 0.

---

### Task 2: World generation, tick engine, actions, selectors

**Files:**
- Create: `lib/command/generate.ts`, `lib/command/engine.ts`, `lib/command/actions.ts`, `lib/command/selectors.ts`
- Test: `lib/command/engine.test.ts`, `lib/command/actions.test.ts`, `lib/command/selectors.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `generate.ts`: `seedWorld(seed: number, now: number): World` — units = STATIONS+PATROLS+OFFICES+TEAMS (copies), businesses = BUSINESSES, ~40 cases (police ~22, consumer ~12, other ~6) reported within the last 6 hours in mixed statuses with consistent timelines/alerts/assignments (a busy unit has `caseId`), `nextArrivalAt = now + 4000`; deterministic for a given seed and now. `newCase(world: World, r: Rng, now: number): World` — weighted category (police 55%, consumer 30%, other 15%), random place (consumer: a business's place, `businessId` set), jitter ≤ 600 m, template slots filled, `homeId = nearestHome(...)?.id`, status `new`, timeline `[reported]`, id `PB-` + zero-padded `nextId`, then immediately `alertNext(case)` for police/consumer. `export type Rng = ReturnType<typeof mulberry32>`.
  - `engine.ts`: `ACK_WINDOW_MS: Record<Severity, number> = { critical: 45_000, high: 90_000, normal: 180_000 }`; `alertNext(world: World, caseId: string, now: number): World` — alerts the best-ranked available unit not already alerted for this case (status → `alerted`, alert `pending`, timeline `alerted` with unit name, `distanceKm`/`etaMin` set); if none, timeline note "No unit free; queued" and status stays/returns to `new`; `tick(world: World, now: number, opts?: { responders?: boolean }): World` — no-op when `paused`; `opts.responders` (default `true`) turns step 3 off for tests; else: (1) arrivals while `now >= nextArrivalAt` (gap `expGap(r, 8000)`), (2) pending alerts past their window → `timed-out`, timeline `escalated`, `alertNext`; after 3 timeouts `overdue = true`, (3) simulated responders on demo units: pending alert acknowledged with p=0.18 per tick (→ `acknowledged`, `firstAckAt`, unit busy), acknowledged → `en-route` with p=0.3, en-route patrol/team moves toward scene by `lerp` step of 0.25 per tick and arrives when within 0.15 km (→ `on-scene`), on-scene → `resolved` with p=0.04 (unit available again, back at home position), resolved → `closed` after 10 min; (4) cases touched by a human action in the last 60 s (`timeline` entry with `by: "operator"`) are skipped by step 3; (5) `now` and `rngState` updated. Never mutates its input.
  - `actions.ts` (each `(world, caseId, now, ...) => ActionResult`, adds timeline with `by: "operator"`): `acknowledge`, `dispatch(world, caseId, now, unitId?: string)` (assign given or best unit, unit busy, status `en-route`), `escalate` (current pending alert → `declined`, `alertNext`), `arrive`, `resolve(world, caseId, now, note: string)`, `close`, `reopen`, `addNote(world, caseId, now, text: string, followUpAt?: number)`, `forward(world, caseId, now, agency: string)` (other dept only; status `acknowledged`, timeline `forwarded`). Invalid transitions return `{ ok: false, error }` with a readable English message (e.g. "Only an alerted case can be acknowledged."). Allowed: acknowledge from alerted; dispatch from new/alerted/acknowledged; escalate from alerted; arrive from en-route; resolve from acknowledged/en-route/on-scene; close from resolved; reopen from resolved/closed; addNote any; forward from new (other).
  - `selectors.ts`: `kpis(world, now)` → `{ open: number; awaiting: number; enRoute: number; onScene: number; resolvedToday: number; medianFirstResponseMin: number | null; overdue: number }`; `filterCases(world, f: { dept?: Dept; status?: Status | "open"; category?: Category; homeId?: string; severity?: Severity; q?: string })` sorted critical-first then newest; `pendingAlerts(world, dept)` (status `alerted`, with `msLeft`); `stationStats(world, homeId)` → `{ open; closed; medianFirstResponseMin; patrols: Unit[] }`; `businessHistory(world, businessId)` → `{ cases: Case[]; repeat: boolean }` (repeat = ≥ 2 cases); `byCategory(world, dept?)` and `byDivision(world, dept?)` → `{ key; count }[]` sorted desc. "open" = status not resolved/closed.

- [ ] **Step 1: Failing tests.** `lib/command/engine.test.ts` must cover, with concrete asserts:
  - `seedWorld(7, T)` twice deep-equals; ≥ 35 cases; every case id unique; every busy unit's `caseId` exists.
  - First alert goes to the nearest unit: build a world via `seedWorld`, set every police unit available, call `newCase` with a seeded rng until a police case appears, assert `alerts[0].unitId === rankUnits(case.place, world.units, "police")[0].unit.id`.
  - Escalation: take an `alerted` critical case, `tick(world, alertAt + 45_001, { responders: false })` → first alert `timed-out`, second alert `pending` to a different unit, timeline contains `escalated`.
  - Three timeouts (three ticks past successive windows, `responders: false`) → `overdue === true`.
  - `tick` with `paused: true` returns a world deep-equal to the input except nothing.
  - `tick` does not mutate input (`structuredClone` before, deepEqual after).
  - Arrivals: ticking 60 s of 1 s steps from a seeded world adds at least 3 cases.
  `lib/command/actions.test.ts`: each allowed transition succeeds and adds an operator timeline entry; each disallowed one returns `{ ok: false }` with a message; dispatch marks the unit busy with `caseId`; resolve frees it.
  `lib/command/selectors.test.ts`: `kpis` counts on a hand-built 4-case world; `filterCases` order; `businessHistory.repeat`; `medianFirstResponseMin` of [2,4,9] min = 4.
- [ ] **Step 2: Run** `node --test lib/command/*.test.ts` → the new tests FAIL.
- [ ] **Step 3: Implement** to the interfaces.
- [ ] **Step 4: Run** `npm test` → all pass; `npx tsc --noEmit` → 0.

---

### Task 3: Store, clock and map

**Files:**
- Create: `lib/command/store.ts` ("use client"; may use `@/` imports and React), `components/command/map-view.tsx`, `components/command/map-canvas.tsx`
- Modify: `package.json`/`package-lock.json` via `npm install leaflet@1.9.4 && npm install -D @types/leaflet@1.9.20` (exact versions).

**Interfaces:**
- Produces:
  - `store.ts`: `useCommand<T>(select: (w: World) => T): T | null` (null on server and before hydration — callers render skeletons); `useCommandReady(): boolean`; `commandAct(fn: (w: World, now: number) => ActionResult): string | null` (applies, persists, notifies; returns error or null); `setPaused(p: boolean)`; `resetDemo()` (new seed = Date.now() & 0x7fffffff); `useCommandClock()` — mount once in the layout: every 1000 ms while `document.visibilityState === "visible"`, `world = tick(world, Date.now())`, notify, persist at most every 5 s. Persistence key `kandari-command-v1`; on load, parse defensively (wrong `version` or shape → reseed); if the saved `now` is older than 30 min, reseed (a stale demo isn't live). Selectors passed to `useCommand` must return stored references or primitives; for derived arrays/objects memoise per world identity (WeakMap keyed by world).
  - `map-view.tsx`: a named export `MapView` = `dynamic(() => import("./map-canvas"), { ssr: false, loading: () => <div className="…skeleton…"/> })`. Props `MapViewProps { cases: Case[]; units: Unit[]; selectedId?: string; onSelect?(id: string): void; focus?: "country" | "selection" | LatLng & { zoom: number }; className?: string; showUnits?: ("patrol" | "station" | "office" | "team")[] }`.
  - `map-canvas.tsx`: Leaflet map (import "leaflet/dist/leaflet.css" here), OSM tiles `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution `© OpenStreetMap contributors`, tile pane darkened by CSS (`filter: invert(1) hue-rotate(180deg) brightness(.85) contrast(.9)` on `.leaflet-tile-pane` scoped to a wrapper class), bounds Bangladesh `[[20.5,88],[26.7,92.7]]`, `divIcon` markers: incident dot coloured by dept (police gold `#E4B027`, consumer cobalt `#035397` with white ring, other `#8FA1E3`), critical/overdue red `#DA291C` with a ring (pulsing only without reduced motion), station = gold square with shield glyph, patrol = small navy-tint circle, office/team = cobalt. Selected case: dashed polylines scene→assigned unit (gold) and scene→nearest home (white/60), each with a label tooltip "2.4 km · 7 min". Update markers in place on prop changes (keep a Map of id→marker; no full re-create per tick). `onSelect` on incident click. Markers have `keyboard: false` and the container `aria-hidden` plus an adjacent `sr-only` summary ("12 open incidents on the map"); the map itself `role="presentation"`.

- [ ] **Step 1: Failing test** `lib/command/store.test.ts` is not possible under node (React/localStorage); instead add `parseSaved(json: string, now: number): World | null` as a pure export in `lib/command/generate.ts` and test it in `lib/command/engine.test.ts`: valid round-trip, wrong version → null, stale (> 30 min) → null, garbage → null. Run → FAIL.
- [ ] **Step 2: Implement** `parseSaved`, then `store.ts`, then install Leaflet and build the map files.
- [ ] **Step 3: Verify** `npm test`, `npx tsc --noEmit`, `npx eslint lib/command components/command`.

---

### Task 4: Dashboard shell, overview page, shared case UI, প্রতিবাদ button

**Files:**
- Create: `app/protibad/command/layout.tsx` (metadata title "Command Dashboard | প্রতিবাদ — কাণ্ডারী-ল্যাব", renders `<CommandShell>`), `app/protibad/command/page.tsx` (Overview), `components/command/shell.tsx`, `components/command/kit.tsx` (Panel, Kpi, StatusPill, SeverityPill, CategoryChip, DemoBadge, EmptyState, Skeleton, timeAgo helper, formatMin), `components/command/kpi-row.tsx`, `components/command/alert-feed.tsx`, `components/command/case-table.tsx`, `components/command/case-drawer.tsx`, `components/command/breakdowns.tsx`
- Modify: `components/complaints/complaint-masthead.tsx` — add a gold `Link` "Crime & complaint dashboard" (icon `monitoring`) to `/protibad/command` beside the existing primary actions.

**Interfaces:**
- Consumes: store (`useCommand`, `commandAct`, `setPaused`, `resetDemo`, `useCommandClock`), selectors, actions, `MapView`, `CATEGORY_META`.
- Produces (used by Tasks 5–6):
  - `CommandShell({ children })`: sidebar nav (Overview `/protibad/command`, Police `/protibad/command/police`, Stations `/protibad/command/police/stations`, ভোক্তা অধিদপ্তর `/protibad/command/consumer`, Businesses `/protibad/command/consumer/businesses`, Other agencies `/protibad/command/other`, Back to প্রতিবাদ `/protibad`), current link marked with a gold bar + `aria-current="page"`; top bar: page title slot via `CommandPage`, live clock (Asia/Dhaka, `tabular-nums`), `DemoBadge`, pause/resume button (aria-pressed), "Reset demo" (confirm via `window.confirm`), and the demo notice line. Calls `useCommandClock()` once. Below lg: sidebar becomes a horizontally scrollable tab strip.
  - `CommandPage({ title: string; subtitle?: string; actions?: ReactNode; children })`: page header + content wrapper.
  - `CaseTable({ cases: Case[]; onOpen(id: string): void; columns?: ("id" | "category" | "place" | "severity" | "status" | "unit" | "age" | "home")[]; empty?: string })`: accessible `<table>` (caption sr-only), rows are buttons-in-cells or row `onClick` + a real `<button>` in the id cell, paginate 25/page.
  - `CaseDrawer({ caseId: string | null; onClose(): void })`: Radix Dialog (`radix-ui` package, as used in `components/record/record-dialog.tsx`) as a right-side sheet; shows header, place, mini `MapView` focused on selection, assigned unit with km/ETA, alert log, timeline, notes (add note form with optional follow-up time), and the action buttons valid for the status (calling `commandAct` and showing the returned error inline).
  - `AlertFeed({ dept?: Dept; onOpen(id): void; limit?: number })`: newest/pending first, critical red left edge, countdown `mm:ss` to escalation, an `aria-live="polite"` region that announces only new critical cases (at most one announcement per 10 s).
  - `useSelectedCase()` → `[id, setId]` synced to `?case=` search param (so a case link is shareable).
- Overview page content: `KpiRow`, a grid with `MapView` (all open cases, stations, patrols, offices; selecting opens the drawer) and `AlertFeed`; below, `Breakdowns` (open by category and by division, simple bar lists — follow the `dataviz` skill's mark rules: one hue, labels on bars, no legend needed).

- [ ] **Step 1:** Build shell + kit + page with skeletons first; load `/protibad/command` in Playwright (see Task 7 script) → no console errors.
- [ ] **Step 2:** Build drawer + table + feed; confirm actions change status live.
- [ ] **Step 3:** Add the masthead button; check `/protibad` still renders.
- [ ] **Step 4:** `npx tsc --noEmit`, `npx eslint app/protibad components/command components/complaints`, `npm test`.

---

### Task 5: Police workspace and station CRM

**Files:**
- Create: `app/protibad/command/police/page.tsx`, `app/protibad/command/police/stations/page.tsx`, `app/protibad/command/police/stations/[id]/page.tsx`, `components/command/police-workspace.tsx`, `components/command/station-list.tsx`, `components/command/station-crm.tsx`, `components/command/unit-roster.tsx`

**Interfaces:**
- Consumes: Task 4 shared components and store/selectors/actions.
- Produces: pages only.

Police workspace: tabs (Radix Tabs or buttons with `role="tablist"`) Alerts | Map | Tasks; desktop shows Alerts + Map side by side and Tasks below. Alerts = `pendingAlerts(world,"police")` cards with countdown, unit name, km/ETA and buttons Acknowledge / Dispatch / Escalate now. Map = police cases, stations, patrols; selected case line to assigned unit and nearest station. Tasks = `CaseTable` with filters (status incl. "open", category, station `<select>`, severity, search). Station list = table of stations with open, closed, median response, patrols available; link to CRM. Station CRM (`[id]`, `generateStaticParams` from STATIONS, `notFound()` for unknown): header with station name (English + Bangla), approximate-location note, area `MapView` focused on the station (zoom 13), `UnitRoster` (patrols with status and current case), stats, open cases table, closed cases table, and a "Follow-ups due" list from case notes with `followUpAt`.

- [ ] Build, then verify with Playwright at 390 and 1440 (no console errors, no overflow, acknowledging an alert moves it out of Alerts), `npx tsc --noEmit`, eslint on the new paths.

---

### Task 6: ভোক্তা অধিদপ্তর workspace, business CRM, other agencies

**Files:**
- Create: `app/protibad/command/consumer/page.tsx`, `app/protibad/command/consumer/businesses/page.tsx`, `app/protibad/command/consumer/businesses/[id]/page.tsx`, `app/protibad/command/other/page.tsx`, `components/command/consumer-workspace.tsx`, `components/command/business-list.tsx`, `components/command/business-crm.tsx`, `components/command/other-queue.tsx`

Consumer workspace mirrors police (Alerts | Map | Tasks) with offices/teams and consumer categories; Tasks filter by office instead of station. Business list: table of businesses with kind, district, case count, last case age, "Repeat" pill (red only if ≥ 3 open/closed cases, else navy tint); search. Business CRM (`[id]`, `generateStaticParams` from BUSINESSES, `notFound()`): header (fictional-business note), location map, case history table, inspection/warning/fine log derived from timeline entries and notes, add-note action on the latest case. Other agencies: `CaseTable` of dept "other" with agency column and a Forward button (opens a small dialog listing agencies from `CATEGORY_META`) and Close.

- [ ] Build, verify as in Task 5.

---

### Task 7: Full QA and polish

**Files:** fixes anywhere under the module; scratch scripts only in the session scratchpad.

- [ ] Playwright (`import { chromium } from "file:///C:/Users/User/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs"`, `{ channel: "chrome" }`) over every dashboard route at 390, 1024, 1440, 1920: zero console errors/warnings (except React DevTools info), zero 4xx/5xx except OSM tile failures, no horizontal overflow, waits 20 s and asserts new cases appear and an alert escalates (pause/resume works), drawer actions succeed, reduced-motion run has no pulsing.
- [ ] axe-core from `node_modules/axe-core/axe.min.js`: no serious/critical violations.
- [ ] Screenshot every page at 390 and 1440 and review against Global Constraints (impeccable craft floor: hierarchy, spacing rhythm, no orange, no sub-12px, contrast).
- [ ] `npx tsc --noEmit`, `npx eslint app/protibad components/command lib/command data/command`, `npm test`, `npx next build` (dev server may stay up).
