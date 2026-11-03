# MOTHERLAND category pages — deepen, brighten, add planners

**Date:** 2026-11-04
**Scope:** the ten `/bangladesh/<slug>` category pages only. The MOTHERLAND
landing (`/bangladesh`) and `/bangladesh/facts` are **not** touched. `/bangladesh/travel`
is its own page; it gets the new trip planner but keeps its existing structure.

## Goal

Make each category page deeper, more useful to a foreigner deciding whether to
visit or invest, and visibly premium. Re-skin from the current pitch-black dress
to light backgrounds (white / navy / yellow). Remove the "MOTHERLAND" eyebrow from
the hero. Structure each page on AIDA. No "AI" wording anywhere; any assistant-like
feature is a plain, working data tool, not a chatbot.

## Decisions taken (from the user, 2026-11-04)

1. **Planner / events:** build real, data-driven tools (trip cost + route; filterable
   events calendar with a ticket-link popup). Never call them "AI".
2. **Backgrounds:** re-skin all 10 category pages to light. Landing + Facts stay dark.
3. **Delivery:** page by page, highest-impact first, verified in batches.
4. **Video:** licensed Pexels stock where one fits; otherwise premium high-res photos.
   Never claim footage we don't have.
5. **People:** widely-documented non-political cultural figures only; sourced; no
   politicians (no Hasina, Mujib, Khaleda, Zia); add a women-power section.

## Design system change: a scoped light theme

The shared `kit.tsx` tokens stay as they are (the landing uses them). The light
dress lives in the **category rendering components** (`category.tsx`, `figures.tsx`,
`photo-card.tsx` variants), not in global tokens.

Palette for category pages (maps to existing CSS vars, no new black):
- **Paper** `--color-ml-ground` (off-white) — default section background.
- **Navy** — a deep navy band for emphasis sections and figure bands (replaces the
  old `bg-ml-ink`/`bg-ml-deep` dark bands). Reuse the site navy token.
- **Gold** `--color-signal-orange` — the facts line, accents, buttons (unchanged).
- Text: ink on paper, white on navy. No pure-black section grounds.

Hero: keep a full-bleed photo/film for drama (Attention), but drop the
"MOTHERLAND" link eyebrow. A small back-to-MOTHERLAND link moves to a quiet spot
(top-left chip or the footer), so the marked label is gone from the headline stack.

Band rhythm per page (AIDA):
- **Attention** — hero image/film + title + one line.
- **Interest** — the narrow gold facts line, then the first story block (CardStack
  on paper/navy) and the "by the numbers" band (now navy, not black).
- **Desire** — the deep content rails (wildlife lists, culture calendar, taka guide,
  etc.) on alternating paper/navy/gold-tinted bands, with premium photos.
- **Action** — the page's own call (quiz, "connect"/"plan"/"see events" button),
  then other categories, then footer.

## Per-page content plan

Highest-impact order: **Taka → Nature → Culture → Travel planner → Science →
People → Invest → History → Resources → Pro & Con.**

### Taka (foreigner money guide)
A practical guide: short taka history; note denominations (৳2–৳1000) and coins;
how a foreigner converts money (banks, authorised dealers, airport, cards, ATMs);
how to pay (cash norms, mobile apps bKash/Nagad/Rocket — what they are, that they
need a local number, how a visitor uses an agent); card acceptance; a worked
example ("$100 ≈ ৳… at a typical rate" — shown as illustrative, rate not fixed);
bank-transfer basics; rules and security (keep small notes, авто fare norms,
common scams to avoid, emergency/hotline). Timeline kept. Clearly labelled as a
guide, rates illustrative.

### Nature (native life + seasons + conservation)
Native **animals** list (Royal Bengal tiger, spotted deer, Ganges river dolphin,
gharial, hoolock gibbon, etc.), **birds**, **trees** (sundari, banyan, krishnachura,
shimul), **flowers** (shapla national flower, kodom, kash), **fruits** (mango,
jackfruit national fruit, litchi), forests (Sundarbans mangrove, Lawachara, hill
forests), rivers and sea. The **six seasons** shown as how nature changes (short
notes + photo per season, video where one fits). A **conservation** block: why it
matters for our existence, threats, how to help. Sundarbans wildlife shown with
premium stills (and stock clip if one fits), never claimed as our own footage.

### Culture (calendar + events + Banglar Bhoot + sports)
Rich culture rails: festivals by the calendar (Pohela Boishakh, Eid, Durga Puja,
Nobanno, pitha, mela, village culture), art forms (Baul, jamdani, rickshaw art,
nakshi kantha), music (classic + a **rock/90s culture** note + fashion/vibes),
film and drama (incl. the Humayun Ahmed "Baker Bhai" moment as a short, sourced
culture story), language movement / 21 Feb, Victory Day, 26 March, sports (kabaddi
national sport, cricket). A **"Banglar Bhoot"** section mid-page — a light, fun
tour of folklore ghosts (data, clearly folklore). An **events** block: a
filterable list of cultural events/venues (Bangla Academy, Shilpakala, theatres)
with a **ticket popup** — a small modal that shows event details and an outbound
"Get tickets" link (no fake checkout; outbound to the official source, or marked
"tickets at venue"). A culture-places section (venues with a map link).

### Travel planner (on /bangladesh/travel)
A **trip planner** component: pick region(s)/division, season, and days → it
computes an approximate total cost, suggests transport (bus/train/launch/air with
approx fares), a day-by-day route, and nearby suggestions. All from local data
tables (`data/motherland-trip.ts`); costs labelled approximate. A plain search/filter
UI — not a chat, not "AI". Sits high on the travel page per the user's ask.

### Science (achievements + institutions + events)
Deeper achievements (Padma Bridge, metro, satellite, jute genome, ORS, rice,
freelancing/IT, nuclear plant as in-progress), **institutions** (BUET, Dhaka Univ,
RUET/KUET/CUET, BRRI, icddr,b, BCSIR), national + international projects/awards,
a **science events** block with a "join" outbound link, and a closing
"we are on the way" note. Hero may use a stock science/engineering clip.

### People (underrated cultural figures + women power)
Non-political figures with sourced facts: poets/thinkers (Jibanananda Das, Lalon,
Farrukh Ahmad), artists (Zainul Abedin, SM Sultan, Novera Ahmed), science (Fazlur
Rahman Khan, Jagadish Chandra Bose heritage, Maqsudul Alam), music (Runa Laila,
Ayub Bachcho for rock), literature (Humayun Ahmed). A dedicated **women power**
rail (Begum Rokeya, Novera Ahmed, Runa Laila, etc.). Living-person claims kept to
plainly-documented facts. No politicians.

### Invest (opportunity locator)
An **opportunity** block: sectors (RMG, leather, pharma, IT/ITES, agro, light
engineering, tourism) × regions, each with why-invest, the resource/strength
behind it, and a market-size note (population-driven). A **"Connect for details"**
button → routes to `/contact` (or Join), no fake form. Keeps the existing invest
simulator.

### History
More narrative depth: ancient (Mahasthangarh, Mauryan/Pala/Sena, Bengal Sultanate,
Mughal Bengal, rich pre-colonial economy), the colonial downfall (Plassey, famine,
deindustrialisation of muslin), the rise again (Language Movement, 1971, rebuilding,
middle-income). Timeline kept and extended. Frame: "fell, then stood again."

### Resources
Deeper data like other pages: natural gas, coal, arable land + rivers (water),
fisheries, human capital (young population, diaspora), garments capacity, strategic
location (Bay of Bengal, land bridge to NE India/Myanmar). Each with a figure +
source.

### Pro & Con
Add the required opening **policy line** (verbatim intent): MOTHERLAND represents
the country to help development through one easy information platform; it is **not
in conflict with government**; government is welcome to collaborate and be included;
goal is to lift all of Bangladesh and every citizen. Then keep the sourced
best/worst debate.

## New components

- `components/motherland/trip-planner.tsx` (client) — region/season/days inputs →
  computed cost, transport, route, suggestions. Pure compute in
  `lib/motherland-trip.ts` (tested).
- `components/motherland/events.tsx` (client) — filterable event list + ticket
  popup (dialog). Data in `data/motherland-culture-events.ts`.
- `components/motherland/nature-list.tsx` (server) — the native-life columns.
- Light-theme variants in `category.tsx` / `figures.tsx` / `photo-card.tsx`.

## Data files

- Extend `data/motherland-categories.ts` (deeper stories per category).
- Extend `data/motherland-deep.ts` (more figures/timeline, sourced).
- New: `data/motherland-trip.ts`, `data/motherland-culture-events.ts`,
  `data/motherland-nature.ts`.
- Every figure names a source; illustrative numbers labelled as such.

## Testing

- `lib/motherland-trip.test.ts` — cost/route compute is deterministic and correct.
- Extend `lib/motherland-categories.test.ts` — new subcategories render, no empty
  rails, each figure has a source, events have a ticket link or "at venue".
- Build + lint + tsc clean; browser check each batch at 1440 and 390 for overflow
  and contrast on the new light bands.

## Non-goals

- No backend, no real AI model, no real checkout/payment.
- No change to the landing page, Facts page, header, or footer shells.
- No politicians on People. No invented stories/quotes. No Pinterest images.
