# MOTHERLAND Category Deepen Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen and brighten the ten `/bangladesh/<slug>` category pages — richer sourced content, light (white/navy/gold) dress, a working trip planner and events calendar — without touching the landing or Facts pages.

**Architecture:** Content lives in `data/motherland-categories.ts` + `data/motherland-deep.ts` + three new data files. Rendering stays in `category.tsx` / `figures.tsx` / `photo-card.tsx`, re-skinned to light. Two new client components (`trip-planner.tsx`, `events.tsx`) with pure compute in `lib/`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, framer-motion. Node `--test` for lib tests.

## Global Constraints

- No pure-black (`bg-black`/`bg-ml-ink`/`bg-ml-deep`) backgrounds on category pages; use paper (`bg-ml-ground`), navy, white, gold. Landing + Facts pages unchanged.
- No orange anywhere; gold is `signal-orange` token. Red only for urgency.
- Remove the "MOTHERLAND" eyebrow from the category hero; keep a small quiet back-link.
- No "AI" wording; the planner/events are plain data tools. No chatbot, no fake checkout/payment, no backend calls.
- Every figure names a source. Illustrative numbers (taka rate, trip cost) are visibly labelled approximate.
- People page: documented non-political cultural figures only; no politicians.
- Photos: licensed Unsplash/Commons only, never Pinterest. Don't claim video we don't have.
- Do not edit `eslint.config.mjs` (hook-protected). Commit only; user pushes.
- Verify each batch: `npm test`, `npx eslint app components lib data`, `npx tsc --noEmit`, browser at 1440 + 390.

---

### Task 1: Light theme for category rendering

**Files:**
- Modify: `components/motherland/category.tsx`
- Modify: `components/motherland/figures.tsx`
- Modify: `components/motherland/photo-card.tsx`

**Interfaces:**
- Produces: category pages render on light bands; `Figures`/`Timeline` on navy not black; `PhotoCard` gains a `light` tone for ink-on-paper cards.

- [ ] **Step 1:** In `category.tsx` `Opening`: remove the `<Link href="/bangladesh">MOTHERLAND</Link>` eyebrow; add a small back-chip top-left (`absolute top-[calc(var(--ml-header)+1rem)] left-6`, paper pill, "← MOTHERLAND"). Keep hero image/film + gradient.
- [ ] **Step 2:** In `category.tsx`: change `StackBand` wrapper from `bg-ml-ink` to `bg-ml-ground`; `BAND_TONES` to `["bg-ml-ground text-ml-ink","bg-ml-navy text-white","bg-signal-orange/10 text-ml-ink"]`; `MoreCategories` grid bg to `bg-ml-navy`.
- [ ] **Step 3:** In `figures.tsx`: `Figures` section `bg-ml-deep`→`bg-ml-navy`; `Timeline` `bg-black`→`bg-ml-ground text-ml-ink`, gold line kept, text dark.
- [ ] **Step 4:** Add `--color-ml-navy` usage: confirm token exists (reuse site navy `#0B1849`); if missing add `ml-navy` alias in `app/bangladesh/motherland.css`.
- [ ] **Step 5:** Run `npx tsc --noEmit` → PASS. Browser-check History page at 1440 + 390: light bands, no black, back-chip visible, contrast OK.
- [ ] **Step 6:** Commit: `theme: brighten MOTHERLAND category pages to light dress`.

---

### Task 2: Taka — foreigner money guide

**Files:**
- Modify: `data/motherland-categories.ts` (taka category: deeper subcategories + facts + quiz)
- Modify: `data/motherland-deep.ts` (taka figures/timeline kept, add denominations note if sourced)

- [ ] **Step 1:** Expand taka `subcategories` to: "A short history of the taka", "Changing money as a visitor" (banks, authorised dealers, airport, ATMs, cards), "Paying day to day" (cash norms, bKash/Nagad/Rocket explained, agents, a worked `$100 ≈ ৳…` example marked illustrative), "Rules & staying safe" (small notes, fair fares, common scams, hotline 999/tourist police). Each story sourced where a figure appears; guide framed as practical.
- [ ] **Step 2:** Add a visible "Rates are illustrative and move daily" line into the relevant story text (no live rate claimed).
- [ ] **Step 3:** Update taka `facts` + `quiz` to match (denominations, mobile-money launch 2011, etc.).
- [ ] **Step 4:** `npm test` → PASS (figures still resolve). Browser-check `/bangladesh/taka`.
- [ ] **Step 5:** Commit: `content: full foreigner money guide on Taka`.

---

### Task 3: Nature — native life, seasons, conservation

**Files:**
- Create: `data/motherland-nature.ts` (animals, birds, trees, flowers, fruits, seasons lists, each with source)
- Create: `components/motherland/nature-list.tsx` (server component: columned lists on paper)
- Modify: `data/motherland-categories.ts` (nature subcategories deeper)
- Modify: `components/motherland/category.tsx` (render nature-list block when `slug==="nature"`)

**Interfaces:**
- Produces: `NATIVE_LIFE` (animals/birds/trees/flowers/fruits arrays `{name, note, source?}`), `SEASON_NATURE` (6 seasons `{name, months, look}`), `<NatureList />`.

- [ ] **Step 1:** Write `data/motherland-nature.ts` with sourced lists (tiger, spotted deer, Ganges dolphin, gharial, hoolock gibbon, fishing cat; birds: doyel national bird, kingfisher, shalik; trees: sundari, banyan, krishnachura, shimul, mango; flowers: shapla national flower, kodom, kash; fruits: jackfruit national fruit, mango, litchi). National-symbol facts cite Bangladesh government/Banglapedia.
- [ ] **Step 2:** Write `nature-list.tsx` rendering the lists as tidy columns with small labels, paper background, one premium photo per group.
- [ ] **Step 3:** Add a conservation subcategory/story (why it matters for our existence, threats, how to help) and the six-season nature notes.
- [ ] **Step 4:** Wire `<NatureList />` into `CategoryPage` for `slug==="nature"` (after the stack band).
- [ ] **Step 5:** `npm test` + `tsc` → PASS. Browser-check `/bangladesh/nature`.
- [ ] **Step 6:** Commit: `content: native life, seasons and conservation on Nature`.

---

### Task 4: Culture — calendar, Banglar Bhoot, sports, events + ticket popup

**Files:**
- Create: `data/motherland-culture-events.ts` (`EVENTS` array `{id,title,venue,city,month,kind,ticket}`, `GHOSTS` folklore list)
- Create: `components/motherland/events.tsx` (client: filter by kind/month + ticket dialog)
- Modify: `data/motherland-categories.ts` (culture: festivals-by-calendar, art forms, music incl. rock/90s, film/drama incl. Baker Bhai, language/victory days, sports; a Banglar Bhoot subcategory)
- Modify: `components/motherland/category.tsx` (render `<Events />` when `slug==="culture"`)

**Interfaces:**
- Consumes: Task 1 light theme.
- Produces: `EVENTS`, `GHOSTS`, `<Events events={EVENTS} />` with a dialog popup showing details + outbound "Get tickets" link (or "Tickets at the venue").

- [ ] **Step 1:** Write `data/motherland-culture-events.ts`: real recurring cultural events (Pohela Boishakh at Ramna, Ekushey Book Fair at Bangla Academy, Shilpakala theatre nights, Dhaka Lit Fest, classical music night) with venue, city, month, kind, and a `ticket` that is either an official outbound URL or `null` (→ "Tickets at the venue"). `GHOSTS`: folklore entries (Petni, Shakchunni, Mechho Bhoot, Aleya) clearly labelled folklore.
- [ ] **Step 2:** Write `events.tsx` (client): kind/month filter chips, event cards, and a dialog (`<dialog>` or state modal) that opens on a card → details + ticket link. No fake checkout. Keyboard-closable, focus-trapped, reduced-motion safe.
- [ ] **Step 3:** Expand culture `subcategories`: festivals by calendar, art forms, music (add rock/90s/fashion note), film & drama (Humayun Ahmed "Baker Bhai" as a sourced culture moment), national days, sports (kabaddi national sport, cricket), plus a "Banglar Bhoot" folklore subcategory mid-page.
- [ ] **Step 4:** Wire `<Events />` into `CategoryPage` for `slug==="culture"`.
- [ ] **Step 5:** `npm test` + `tsc` + eslint → PASS. Browser-check `/bangladesh/culture`: filter works, dialog opens/closes, outbound link present.
- [ ] **Step 6:** Commit: `content: culture calendar, folklore, sports and events with ticket popup`.

---

### Task 5: Travel — trip planner

**Files:**
- Create: `lib/motherland-trip.ts` (pure compute: `planTrip(regions, season, days) => {cost, transport, route, nearby}`)
- Create: `lib/motherland-trip.test.ts`
- Create: `components/motherland/trip-planner.tsx` (client: region/season/days inputs → result)
- Create: `data/motherland-trip.ts` (regions with approx costs, transport fares, attractions)
- Modify: `app/bangladesh/travel/page.tsx` (place planner high on the page)

**Interfaces:**
- Produces: `planTrip(input): TripPlan`; `<TripPlanner />`. Costs labelled approximate.

- [ ] **Step 1:** Write `data/motherland-trip.ts`: divisions/regions each `{id,name,dailyCost,transportFromDhaka:[{mode,fare,hours}],attractions,bestSeasons}`. Numbers approximate, documented as such in the file header.
- [ ] **Step 2:** Write `lib/motherland-trip.test.ts`: a failing test — `planTrip(["sylhet"],"autumn",3)` returns a cost = sum(daily×days)+transport, a route with 3 entries, and transport suggestions. Run → FAIL.
- [ ] **Step 3:** Write `lib/motherland-trip.ts` to pass: deterministic compute, no randomness. Run → PASS.
- [ ] **Step 4:** Write `trip-planner.tsx` (client): multiselect regions, season select, days number → calls `planTrip`, shows cost (with "approximate" note), transport table, day route, nearby suggestions. No "AI" wording; label it "Plan your trip".
- [ ] **Step 5:** Place `<TripPlanner />` high on `/bangladesh/travel` (after hero facts, per user's "middle upper").
- [ ] **Step 6:** `npm test` + `tsc` + eslint → PASS. Browser-check `/bangladesh/travel`.
- [ ] **Step 7:** Commit: `feat: trip cost and route planner on Geography & Travel`.

---

### Task 6: Science, People, Invest, History, Resources, Pro & Con content

**Files:**
- Modify: `data/motherland-categories.ts` (all six categories deeper)
- Modify: `data/motherland-deep.ts` (figures/timeline per category, sourced)
- Modify: `components/motherland/category.tsx` (Pro & Con policy line; Invest "Connect for details" → `/contact`)

- [ ] **Step 1 (Science):** add institutions (BUET, DU, BRRI, icddr,b), national/international projects/awards, a science-events story with an outbound "join" link, closing "on the way" note.
- [ ] **Step 2 (People):** replace/extend with documented non-political cultural figures (Jibanananda Das, Lalon, Zainul Abedin, SM Sultan, Novera Ahmed, Fazlur Rahman Khan, Runa Laila, Ayub Bachchu, Humayun Ahmed, Begum Rokeya) + a dedicated women-power subcategory. No politicians. Living-person facts kept plain and sourced.
- [ ] **Step 3 (Invest):** add an opportunity subcategory (sectors×regions, why-invest, resource behind it, market note) and a "Connect for details" button → `/contact`.
- [ ] **Step 4 (History):** deepen ancient→colonial-downfall→rose-again narrative; extend timeline. Frame "fell, then stood again".
- [ ] **Step 5 (Resources):** add gas, water/rivers, fisheries, young population/diaspora, garments capacity, strategic location — each a figure + source.
- [ ] **Step 6 (Pro & Con):** add the opening policy line (platform represents the country to aid development; not in conflict with government; government welcome to collaborate; goal to lift all Bangladesh) above the debate.
- [ ] **Step 7:** `npm test` + `tsc` + eslint → PASS. Browser-check all six pages at 1440 + 390.
- [ ] **Step 8:** Commit: `content: deeper Science, People, Invest, History, Resources, Pro & Con`.

---

### Task 7: Tests, full verification, CLAUDE.md + memory

**Files:**
- Modify: `lib/motherland-categories.test.ts`
- Modify: `CLAUDE.md`
- Modify: memory `project-motherland.md`

- [ ] **Step 1:** Extend `lib/motherland-categories.test.ts`: every category's new subcategories have ≥1 story with a picture; events each have a ticket link or null→"at venue"; no empty rails; nature lists non-empty.
- [ ] **Step 2:** Run full `npm test` → PASS. `npx eslint app components lib data` → clean. `npx tsc --noEmit` → clean. `npx next build` → compiles.
- [ ] **Step 3:** Browser sweep all 10 category pages + travel at 1440 + 390: no black bands, no overflow, dialogs/planner work, contrast OK.
- [ ] **Step 4:** Update CLAUDE.md MOTHERLAND line (light dress, planner, events) and memory `project-motherland.md`.
- [ ] **Step 5:** Commit: `docs: record MOTHERLAND deepen + brighten round`.

## Self-Review

- **Spec coverage:** theme (T1), Taka guide (T2), Nature life/seasons/conservation (T3), Culture calendar/Bhoot/sports/events+ticket (T4), Travel planner (T5), Science/People/Invest/History/Resources/ProCon (T6), tests/docs (T7). All spec sections mapped.
- **Placeholders:** none; each task names exact files and concrete content.
- **Type consistency:** `planTrip`, `TripPlan`, `NATIVE_LIFE`, `SEASON_NATURE`, `EVENTS`, `GHOSTS` used consistently.
- **No politicians, no AI wording, no black, approximate labels** enforced via Global Constraints.
