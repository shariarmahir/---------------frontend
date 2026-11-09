# প্রতিবাদ Command Dashboard: design

Date: 2026-10-25. Decided with Mahir in this session.

## Goal

A super-admin style live dashboard for the police and the ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর (Directorate of National Consumer Rights Protection, "ভোক্তা অধিদপ্তর" below). Complaints arrive live, are routed by category to a department, and every complaint is a pending task until it is closed. Crimes go first to the nearest police station or patrol (by estimated arrival time) and escalate to the next nearest if nobody responds. Each police station has a CRM of its area's cases; the ভোক্তা অধিদপ্তর has the same for food and business complaints, keyed by business. The প্রতিবাদ page links to it with a button.

## Decisions (fixed)

| Question | Decision |
|---|---|
| Access | Fully open: no sign-in. Safe only because every case is demo data (next row). |
| Data | Live demo simulation in the browser. Seeded sample world, new cases every few seconds, officers' actions saved in this browser (localStorage). A "Demo data" badge is always visible. No server, no real complaints. |
| Departments | Police and ভোক্তা অধিদপ্তর get full workspaces. Every other routing target (ACC, DoE, labour, land, etc.) lands in one "Other agencies" queue. |
| Map | Leaflet on OpenStreetMap tiles (no key, no bill), darkened with a CSS filter to match the site, OSM attribution shown. |
| Language | English UI (like HQ); category names, places and case text in Bangla. |
| Architecture | Self-contained module, like `/media` and `/hq`: `app/protibad/command`, `components/command`, `data/command`, `lib/command`. Nothing outside imports from it except the প্রতিবাদ button. |

## Safety rules (because it is open)

- Every person, business and case is fictional. No real business names (a fake "adulteration" case against a real shop is defamation); no real people's names; no phone numbers for stations (CLAUDE.md complaints rule: an unverified number is worse than none).
- Police station names and positions are real thanas at approximate coordinates, labelled "approximate".
- The "Demo data" badge and a one-line notice ("Sample cases for demonstration. Real complaints are not shown here.") are on every page.

## Pages

All pages share one dashboard shell (own layout, no site header): a left sidebar (Overview, Police, Stations, ভোক্তা অধিদপ্তর, Businesses, Other agencies), a top bar (title, live clock, Demo data badge, pause/resume simulation, reset demo), pitch-black ground, navy/ink/cobalt panels with `ring-1 ring-white/12`, gold titles, red only for critical/overdue. Below lg the sidebar becomes a top tab strip; the map stacks above lists.

1. `/protibad/command`: Overview across both departments.
   - KPI row: open cases, awaiting first response, en route, on scene, resolved today, median first-response time.
   - Big map: all open incidents (marker colour by department, red ring when critical or overdue), stations, patrols (moving), consumer offices.
   - Live alert feed (right): newest first, critical ones highlighted; click selects the case on the map and opens its drawer.
   - Small breakdowns: open cases by category, by division.
2. `/protibad/command/police`: police workspace.
   - Alerts tab: unacknowledged alerts with countdown to escalation; actions Acknowledge / Dispatch / Escalate now.
   - Map: selected case draws a line to its assigned unit and to the nearest station, with distance (km) and ETA (min).
   - Tasks tab: table of all police cases, filter by status/category/station/severity, sort by age; row opens the case drawer.
3. `/protibad/command/police/stations`: station list with open cases, avg response, patrols available.
   `/protibad/command/police/stations/[id]`: station CRM. Area map (station, its patrols, its cases), patrol roster with status, open and closed cases, response-time stats, per-case contact log (notes, calls made, follow-ups due).
4. `/protibad/command/consumer`: ভোক্তা অধিদপ্তর workspace. Same structure; units are district offices and their inspection teams; categories are food adulteration, overpricing, fake/expired products, unsafe business, false weights.
   `/protibad/command/consumer/businesses` and `/[id]`: business CRM. Each fictional business with its cases, inspections, warnings and fines; repeat offenders flagged.
5. `/protibad/command/other`: Other agencies queue. Table of cases tagged with the receiving body (from the প্রতিবাদ routing table), actions Forward / Close.

Case drawer (shared): header (id, category, severity, status), place, timeline, alert log (who was alerted, when, outcome), assigned unit with distance/ETA, notes, and the status actions allowed from the current status.

Entry point: a gold "Crime & complaint dashboard" button in the প্রতিবাদ masthead, linking to `/protibad/command`.

## Data model (`lib/command/types.ts`)

- `Dept = "police" | "consumer" | "other"`.
- `Category`: the প্রতিবাদ categories (`data/complaints.ts` `ComplaintCategory`) plus consumer sub-categories `adulteration | overpricing | fake-product | unsafe-business | false-weight`.
- `Severity = "critical" | "high" | "normal"`.
- `Status = "new" | "alerted" | "acknowledged" | "en-route" | "on-scene" | "resolved" | "closed"`; consumer uses the same statuses (en-route = inspection team travelling, on-scene = inspecting).
- `Place { division, district, areaBn, lat, lng }`.
- `Unit { id, kind: "station" | "patrol" | "office" | "team", dept, name, nameBn, homeId (station/office the unit belongs to), lat, lng, status: "available" | "busy" | "off-duty" }`.
- `Alert { at, unitId, outcome: "pending" | "acknowledged" | "timed-out" | "declined" }`.
- `TimelineEntry { at, kind: "reported" | "alerted" | "acknowledged" | "dispatched" | "arrived" | "resolved" | "closed" | "escalated" | "note" | "reopened", text, by? }`.
- `Case { id ("PB-" + 6 digits), dept, agency? (for other), category, severity, titleBn, summaryBn, place, reportedAt, status, stationId? (owning station for police / office for consumer, by nearest), assignedUnitId?, distanceKm?, etaMin?, alerts: Alert[], timeline: TimelineEntry[], businessId?, notes: { at, text, followUpAt? }[] }`.
- `Business { id, nameBn, kind, district, lat, lng }` (fictional).
- `World { now, seed, cases, units, businesses, nextId, paused }`.

## Engine (`lib/command`, pure functions, unit-tested)

- `rng.ts`: seeded PRNG (mulberry32) so a seed always produces the same world.
- `geo.ts`: `haversineKm`, `etaMin(distanceKm, kind)` (patrol 22 km/h urban average, inspection team 18 km/h, minimum 3 min), `rankUnits(place, units, dept)`: available units of that department ordered by ETA.
- `routing.ts`: category → dept (and agency for other) using the প্রতিবাদ routing table; severity defaults per category (chadabaji/harassment critical, etc.).
- `generate.ts`: `seedWorld(seed, now)` builds units from `data/command` and ~40 open cases in mixed states with plausible histories; `newCase(world, rng)` creates one realistic case (weighted categories, a real district and area, a point jittered near it).
- `engine.ts`: `tick(world, now, rng)`:
  - arrivals: on average one new case every 8 s (exponential gaps), routed and immediately alerted to the best-ranked unit (first alert = nearest by ETA);
  - acknowledgement windows by severity: critical 45 s, high 90 s, normal 180 s; on expiry the alert times out and the next-ranked unit is alerted ("escalated" in the timeline); after three timeouts the case is flagged overdue;
  - simulated responders: an alerted demo unit acknowledges with a probability per tick, moves toward the scene while en route (patrol positions interpolate), arrives, resolves after a while; human actions always win over simulation for the case they touch.
  - `tick` never mutates; it returns a new world.
- `actions.ts`: `acknowledge`, `dispatch(unitId?)`, `escalate`, `arrive`, `resolve(note)`, `close`, `reopen`, `addNote(text, followUpAt?)`, `forward(agency)`; each validates the current status and returns a new world or an error string.
- `selectors.ts`: KPIs, filtered/sorted case lists, station stats (open, closed, median first response), business history and repeat-offender flag, breakdowns by category and division.

## Client state (`lib/command/store.ts`)

`useSyncExternalStore` store like `lib/media/store.ts`: server render and hydration see an empty world (skeletons), the saved or freshly seeded world arrives right after. Persisted to localStorage (`kandari-command-v1`, versioned; corrupt data reseeds). A `useCommandClock()` hook ticks once a second while the tab is visible and the simulation is not paused. Selectors return stable references.

## Map (`components/command/map-view.tsx`)

Leaflet loaded client-only (`next/dynamic`, `ssr: false`), OSM tiles with attribution, darkened via CSS filter on the tile pane. Markers are `divIcon`s in the site palette (gold station, navy-tint patrol, red critical incident, cobalt consumer office). Selecting a case fits the view to scene + unit + nearest station and draws dashed polylines labelled with km and ETA. Keyboard and screen-reader users get the same information from the lists; the map is supplementary (`aria-hidden` markers, a text summary next to it).

## Data (`data/command`)

- `stations.ts`: ~30 real thanas across the 8 divisions (Dhaka metro dense), approximate coordinates; 1–3 patrol units each.
- `consumer.ts`: ভোক্তা অধিদপ্তর head office plus divisional/district offices at approximate coordinates, 1–2 inspection teams each; ~25 fictional businesses (restaurants, groceries, pharmacies, bakeries, fuel, markets).
- `templates.ts`: Bangla case title/summary templates per category with slots for place and business.

## Quality bar

- Premium UI in the site's dress (`/impeccable` craft floor): no gradients on cards, no orange, no text under 12px, no all-caps eyebrows, 44px targets, visible focus, reduced motion respected (no marker pulse, no slide-in).
- Performance: the map and Leaflet load only on dashboard pages; ticks touch only changed cases; tables virtualise or paginate past 100 rows.
- Tests: `lib/command/*.test.ts` (node:test), added to `npm test`: geo maths, routing table coverage, deterministic seeding, first alert goes to the nearest unit, escalation after timeout, action validation, selectors. Browser smoke test with Playwright at 390 and 1440: no console errors, no overflow, simulation produces alerts, drawer actions work.

## Out of scope

Real complaint intake, any server storage or sign-in, SMS/push alerts, real road routing (straight-line distance with an urban speed factor stands in), other agencies' full workspaces.
