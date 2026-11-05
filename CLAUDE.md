# CLAUDE.md — Kandari-Lab (কাণ্ডারী-ল্যাব) Company Website

This file is the persistent working context for Claude Code on this repo. Read it fully before making changes. It encodes decisions already made, defaults chosen where the brief was ambiguous, and open items that still need Mahir's sign-off — those are marked **[FLAG]** and must not be silently resolved differently without asking.

---

## 1. What this repo is

A single deliverable: the **Kandari-Lab mother-company marketing/portfolio website**. It tells the startup's story (vision, mission, impact, solutions), showcases products, and converts visitors into "Kandari Profile" subscribers and app downloads.

**Out of scope for this repo** (do not build here — separate future repos):
- The **Shukh** super-app itself (mobile, React Native/Expo — see `Shukh-frontend`/`Shukh-backend`).

**Exception — চেতনা (decided by Mahir, 2026-09-25):** the skill-first social platform is built in this repo, self-contained under `/media/*` with its own shell (`app/media/layout.tsx`), data (`data/media/`), rules (`lib/media/`) and components (`components/media/`). Keep it isolated there so it can move to its own repo later: nothing outside `/media` imports from those folders except the header link. The core loop (post a skill → self-rate → community verifies → hire) comes first. On 2026-09-27 Mahir made the whole platform members-only: every `/media/*` page needs a signed-in Kandari Profile (no public feed browsing); see `PROTECTED_PREFIXES` in `data/auth.ts`. On 2026-09-25 Mahir reversed the earlier exclusions: jobs (free, fair-pay only), civic reports and area alerts, social-work events with sponsors, teams (productive family, university labs, travel, sports), challenges, sticky notes, certificates, a dashboard and wellbeing features (daily Learn→Connect→Create→Apply→Relax plan, break reminders) are now in scope under `/media/*`. Fees stay 5% seller / 5% buyer (confirmed over the ৳2 flat idea). Spec: `docs/superpowers/specs/2026-09-25-shikkhitoder-media-v2-design.md` (supersedes v1). The old `/jibaner-joygan`, `/profile` and `/u/*` pages redirect into it (see `next.config.ts`). Tests: `npm test`.

**Exception — কাণ্ডারী HQ (decided by Mahir, 2026-10-21):** the company's own super prime admin control room and every member's TaskBook live in this repo, self-contained under `/hq` (`app/hq`, `components/hq`, `lib/hq`, `data/hq`; API under `app/api/hq`). Members sign in with username + password; the face check (face-api in the browser, only the 128-number signature reaches the server) is off until the prime admin turns on the face lock in Settings (Mahir, 2026-10-22: hide it at first). There is exactly one super prime admin, Mahir: the level is never assigned (`ASSIGNABLE_LEVELS`) and holds every permission. Each level gets its own Command Center and role brief (`data/hq/roles.ts`). While `HQ_DEMO_PASSWORD` is set, one demo sign-in per level below prime (`kandari@demo-chief` … `kandari@demo-intern`, `lib/hq/server/demo.ts`) shows on the sign-in page; unset it before the real team signs in. The super prime admin's credentials live only in `.env.local` (`HQ_PRIME_EMAIL`, `HQ_PRIME_PASSWORD_HASH` from `scripts/hq-hash.mjs`, `HQ_SESSION_SECRET`); never put them in code. Until the FastAPI + Postgres backend exists the data is one JSON document on the server's disk (`.hq-data/`, git-ignored) — fine on a dev machine or VPS, **not** on Vercel serverless. For testing on Vercel (Mahir, 2026-10-23) it falls back to `/tmp` (per instance, wiped on cold starts), and the HQ_* variables must be set in Vercel's settings; `/hq/login` names any that are missing (`lib/hq/server/setup.ts`). Every change goes through `act(domain, action)` → `lib/hq/domains/*` (validated, permission-checked); every read is the member's filtered view (`lib/hq/view.ts`). Same dress as the landing page (pitch black, navy/ink/cobalt fields, gold titles, red for urgency only). Tests: `npm test` (`lib/hq/**/*.test.ts`).

---

## 2. Brand source of truth

- **Name:** Kandari-Lab (কাণ্ডারী-ল্যাব)
- **Motto:** "কে আছ জোয়ান? হও আগুয়ান। হাঁকিছে ভবিষ্যৎ।" *(brief spells this "MOTO" — confirm intended spelling is "Motto" before it ships anywhere public.)* **[FLAG]**
- **Category:** Premium deep-tech startup — semiconductor, IoT, robotics, AI/ML, hardware + software — solving Bangladesh-specific infrastructure and public-service failures sector by sector.
- **Core metaphor for copy/visuals:** Bangladesh as a corrupted/low-resolution image; each unsolved sector problem is one bad pixel; Kandari-Lab fixes the map one sector at a time. Use this literally in the "Problem" section of the homepage (a pixelation-to-clarity visual works well as a scroll-triggered animation).
- **First sector (flagship):** healthcare. Product 1 = **SWASTI (স্বস্তি)**, a super-app (voice assistant, RAG medical agent, CNN diagnostic model). Product 2 = **আপনজন-Aponjon**, a wearable/neuro AI device (ECG, EMG, SpO2, temperature, glucose, vitals → stress/energy scoring).
- **Distribution model:** "One Village, One Medical Health Care Center" — smart pharmacy + digital care per village, starting with a personal-mission tie to Kazaikat village, Nakla, Sherpur.
- **Key narrative hook:** the "Golden Two Hours" — the window in which primary treatment materially changes survival odds. This is the single strongest emotional/data hook in the brief; it should anchor the hero or the first scroll section, not get buried in body copy.
- **Business model:** B2B + B2C, mixed by product/service.
- **R&D pipeline (for the R&D page):** blind-assistance wearable (2m real-time sensing + AI "eye consciousness"), organic-waste-to-soil classification/recycling. Both are early-stage — present as "In Research," not as shipping products.
- **Team** (for the Team page — pull live from a CMS table, don't hardcode):
  - CEO & Founder: Mahir Shariar Mahin
  - COO: Sadman bin Arif
  - CMO: Nabeel Shadad
  - Idea & Creative: Istiake Ahmed, Safia Mubassara Ruzba
  - Client Lead: Jamil Hossan
  - IoT: Janassor Ahmed, Sharul Bhuiya, Safia Mubassara Ruzba
  - Dev (web/app/AI/IoT): Luban Ahmed, Shabbin Ahmed
  - R&D: rotating interns, 2.5-month cycle, high performers converted to paid

---

## 3. Tech stack (decided)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest, App Router) | Server components for the marketing pages; client components only where interactivity/3D require it |
| Language | TypeScript | strict mode on |
| Styling | Tailwind CSS (latest) | design tokens in `tailwind.config` per §5, no ad-hoc hex values in components |
| UI kit | shadcn/ui | extend, don't fork — see §8 |
| 3D/animation | React Three Fiber + drei (hero only), Framer Motion (everything else) | see §6 performance rule — this is the highest-risk part of the brief |
| Backend | **FastAPI (recommended default)** | brief left this as "FastAPI or Fastify" — recommending FastAPI for stack consistency with the rest of Kandari-Lab's Python-based AI/ML work (BondhuAI, Jotno) and shared team context. **[FLAG — confirm or override]** |
| Database | PostgreSQL | subscriber/profile data, content tables |
| Auth | Phone-OTP primary, email magic-link fallback | see §9 rationale |
| Hosting | Vercel (frontend) + Railway/Render/VPS (API) | swap if Mahir has existing infra preferences |

---

## 4. Design system

### 4.1 Color — **resolved hierarchy** (the brief specifies three saturated colors, which is one too many for a "professional, trusted, premium" feel if used with equal weight; this is the resolution, not a rewrite of the brief) **[FLAG — confirm hierarchy]**

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary brand | Bottle Green | `#006747` | nav, footers, section backgrounds, primary text accents — the "trust" color |
| Action / CTA | Gold | `#E4B027` | titles (per brief), all primary buttons, links, highlighted stats — the color that must draw the eye. Replaced orange `#FF9100` on 2026-09-27 (Mahir's instruction), matching the new logo's gold; the CSS token keeps its old name `signal-orange`. Dark text on it, never white (white is ~2.2:1). |
| Alert / urgency | Red | `#DA291C` | reserved for emergency/urgency-coded UI only (e.g. "Golden Two Hours" callouts, critical stats) — **not** a general decorative color. Overusing it undercuts the "calm, trustworthy" positioning the brief also asks for. |
| Deep navy | Navy | `#0B1849` | the third card/field colour of the Pixel-Map palette (green → gold → **navy** → ink), icon and chart fills, selected states. **The site header bar is this navy** (Mahir, 2026-10-15, after a short-lived booking.com blue — do not bring that blue back): full width, flush with the top (utility `header-bar`), contents in a `max-w-384` grid. The logo stands in its own column spanning both rows from lg (68px tall); row one = civic actions, feed, account (right-aligned); row two (lg+) = the section tabs under a hairline, every tab a bold gold icon + label with no pill or glass fill, the current one marked by a gold bar on the header's bottom edge that springs between tabs (`.nav-bar`, with a running light). The logo PNG carries a thin gold outline (`.logo-on-navy`) so its dark letters hold on the navy. Header height 64px below lg, 120px from lg (`--header-offset`, `--spacing-header-lg`). **Replaced every orange on 2026-10-14 (Mahir's instruction): there is no orange anywhere in the UI, do not reintroduce one** (no `#E65100`/`#FF9100`/Tailwind `orange-*`, no `bdorange` token). White text on it (17:1); on the pitch-black ground a faint `ring-1 ring-white/12` holds its edge, as on ink cards. Navy text or strokes vanish on black, so there use the tints `bdnavy-300` (`#8FA1E3`) / `bdnavy-400` (`#6379D1`). Tokens: `--color-bdnavy-50…900` in `app/globals.css`, with 900 = `#0B1849`; `--secondary`, `--signal` and `--signal-text` are navy too. Inside `/media` the same tokens map to that area's own blues. |
| Neutrals | Near-black `#0A0A0A`, off-white `#FAFAF8`, gray scale | — | body text, backgrounds, borders |

Rationale for capping red's role: the brief asks simultaneously for "green and red" *and* a "very professional, trusted, advanced premium" look. Three high-saturation colors fighting for attention reads as busy, not premium. Giving red a narrow, meaningful job (urgency) instead of general decoration keeps the palette disciplined while still using every color the brief named.

### 4.2 Typography
- Latin: a modern geometric sans (Inter or Satoshi).
- Bengali: **Noto Sans Bengali or Hind Siliguri** — required, not optional. The brand name, motto, and product names are Bangla-first; do not let the Bangla text render in a fallback system font. Tune line-height separately for Bangla (conjuncts need more vertical room than Latin defaults).
- Titles/headings: gold (`#E4B027`) per brief, bold weight, generous letter-spacing at large sizes.

### 4.3 Hero section — ratio **[FLAG — as specified, this breaks on mobile]**
Brief specifies 16:6 (~2.67:1), an ultra-wide letterbox. At that ratio on a phone viewport, there isn't vertical room for headline + subhead + CTA + a legible 3D scene without severe cropping. Resolution used in this build:
- **Desktop (≥1024px):** 16:6 container as specified, 3D scene fills it.
- **Tablet/mobile (<1024px):** switch to a taller ratio (4:5) or auto-height stack (3D scene shrinks/simplifies, text stacks above it). Do not force 16:6 down to mobile.

### 4.4 Motion
- Hover animations on all cards and buttons (lift + shadow + border-glow in brand color), per brief.
- 3D hero background themed on Bangladesh — see §6 for the performance/inclusivity constraint before building this literally as full WebGL on every device.
- Respect `prefers-reduced-motion` everywhere; this is not optional for a trust-positioned health-adjacent brand.

---

## 5. Site map

```
/                    Home — hero, "pixel map" problem framing, Golden Two Hours hook,
                      solution overview, product cards (SWASTI, Aponjon), impact stats,
                      download-app CTA
/about               Vision, mission, founder story, "why Bangladeshis must solve this"
/products            Overview
/products/swasti     SWASTI app detail
/products/aponjon    আপনজন wearable detail
/rnd                 R&D departments + featured early-stage projects (blind-assist, waste-to-soil)
/impact               "One Village, One Medical Health Care Center" program, Kazaikat tie-in, stats
/team                Leadership + department rosters
/bangladesh          MOTHERLAND (Mahir, 2026-11-01): Bangladesh's country profile for the world, laid out
                      Header and footer tabs always open each topic's own page, never a section further down (Mahir, 2026-11-05; TOPIC_PAGES). The landing page wears the same dress and cards as the category pages (ml-light, Band, Mosaic, PeopleGrid and Wall from blocks.tsx, in full rows), never a row of cards running off the edge. One footer on every page (footer.tsx, no props): no narrow version. No source, credit or reference line on any card or section, Facts included: they all live on /bangladesh/references, section by section (data/motherland-references.ts, the footer's References button; reference.md is written from the same list; a test keeps source lines off the cards). Action links stay on the page: tickets, official wallets and banks, today's exchange rate, the railway. A page's corner action is an edge tab under "Join with us" from lg, a pill on phones, and steps aside at the footer (corner-button.tsx). Cards deepen their shadow on hover and do not move, so a row never looks out of line. The landing hero's logo and আমার সোনার বাংলা are melted into the film, the most important thing on the page (Mahir, 2026-11-05): no wash, no layer that looks added. film-melt.ts draws the letters in WebGL 2 over the untouched video, with the film's own moving picture inside them, carried to navy or gold by the settled light around each point (lib/motherland-film-tone.ts) and a slow tide that never stops; the colour seeps slightly past each edge. It stands still after a link is clicked, so the next page gets the processor. Where it can't run (less motion, data saving, no WebGL 2, or a device too slow for it) the plain vector letters stay and follow the film one colour at a time (film-ink.ts), as the header's logo always does. Don't put a transform or filter on the letters, and their shapes must never change as the colour moves: Mahir rejected an edge line that made them look like another font. Both are vector art in data/motherland-art.ts, written by scripts/motherland-art.py: the title from public/font/LiSirajeeSylheti3DANSIV2-Italic.ttf, the logo from Alfa Slab One slanted and chiselled to match. Never load that Lipighor font as a web font: its licence forbids uploading the file, and its ANSI encoding only reads Bijoy-typed text. The logo reads MOTHERLAND alone, never The or BANGLADESH. Other pages' hero titles and the words under each hero use the title face (fonts.ts): Mahir asked for Garet Bold, whose foundry requires a paid Web License, so it is Outfit until one is bought. The words under a hero turn from gold to navy as they scroll. Navy and yellow throughout: gold section titles on navy bands, gold for the main action, Taka on a gold band, mint for nature and sun for culture, red for urgency only. The film is one film, 33 seconds in phone, 2560 and 4K cuts (HERO.film, public/motherland/video/bangladesh*): clouded hills, ridges, a Bandarban sunrise, river, sea, beach road, boats, tea and rice, cut from Nishaan Ahmed's CC BY 3.0 "Cinematic Bangladesh in 4K" on Commons plus Pixabay's Lama sunrise. The source has black bars, so Film.bars zooms 1.2 past them; never use a stretch of it with burned-in text (seconds 8-12 and 32-37). Cuts are made with Windows Media Foundation (MediaComposition), then the moov box moved to the front; keep each file under GitHub's 100 MB. The welcome is a slim bar under the hero title and leaves with the hero, so it never covers a title or card. Essentials (components/motherland/essentials.tsx) leads to Facts, the government guide and the trip planner. /bangladesh has a stricter production CSP in next.config.ts: add any new outside host there or it will be blocked. The image optimiser only accepts picture file types (images.localPatterns), because asking it for a film stalled the server. Set NEXT_PUBLIC_SITE_URL on any host that is not Vercel, for share cards, canonical links and the sitemap (lib/site-url.ts).
                      after visittheusa.com, with its own header and footer (no site header) and NO issues.
                      Sections in Mahir's order: About (hero film) → History & Society → Science & Tech →
                      Biographies → Animals & Nature → Geography & Travel → Arts & Culture → Pro & Con →
                      Taka → Videos → Capability & Resources → Business & Investment (live "bright future"
                      simulation, model in lib/motherland-future.ts, illustrative not a forecast) → Join. Copy/media: data/motherland.ts; components/motherland; photos
                      (Unsplash, Commons) and films (Pexels) in public/motherland, credited in its footer.
                      Every section's gold button opens a category page /bangladesh/<slug> (history, science-tech, people,
                      nature, travel, culture, procon, taka, videos, resources, invest), all in the dress Geography & Travel set
                      (Mahir, 2026-11-04): film or drifting full-size photo, one narrow line of figures, first part as the landing's
                      CardStack, sourced figures that count up, portrait photo cards, timeline, quiz, other categories, narrow footer.
                      Copy: data/motherland-categories.ts; figures, films and timelines: data/motherland-deep.ts (every figure names
                      its source, reused from the Facts page where it can be); components/motherland/category.tsx; checked by
                      lib/motherland-categories.test.ts. Photos: licensed Unsplash and Commons only, 2400px where the source has it.
                      Rebuilt from research (Mahir, 2026-11-04): pages wear white, paper, navy and gold, never black or dark green (class
                      ml-light turns shared dark parts navy); nothing sits above the hero title; each page lists its blocks in reading order,
                      AIDA-style (data/motherland-pages.ts, data/motherland-page-*.ts, components/motherland/blocks.tsx). Every fact has a source, listed in reference.md.
                      Taka is a visitor's money guide with a converter; History is three acts (rich, fallen, standing up); Nature has native species,
                      the rarest things, six seasons, why and how to save it; Culture has a dated calendar, Banglar Bhoot in the middle, rock and the 90s
                      (Baker Bhai), films, sports, a map of cultural places, and a corner "Get tickets" popup; Science has world achievements, universities,
                      SpaceX's launch film (click to load), a corner "join now" popup, and closes on "We are on the way"; Invest has market data, sectors, a
                      map of where to locate, and Connect for details (opens the visitor's email; no server yet); People holds NO political biography at
                      all, by Mahir's instruction. Pro & Con opens with Mahir's policy line. Photos and films: public/motherland/more and video, licensed
                      Commons only, credited (data/motherland-more.ts is generated; a card with no photo is set in type). Films say where they were really
                      filmed. Rates, fares and event dates: data/motherland-live.ts, data/motherland-trip.ts, checked November 2026, re-check when they age.
                      Card system (Mahir, 2026-11-04, after he rejected text rows): NO row sections on these pages. Every story, step and table row is a card with a photograph (blocks.tsx; lib/motherland-mosaic.ts lays them out in wide pairs and threes so rows line up), gold tag on the photo, navy, white and gold skins, a detail panel where facts exist. Under each hero the paragraph that inks itself in on scroll, after visittheusa (INTROS in data/motherland-pages.ts). Motion: card rise and photo wipe (reveal.tsx), sideways-scrolling chapters (pinned-rail.tsx), full-bleed parallax breaks (block kind moment). The colours ml-ink, ml-green, ml-deep, ml-ground and ml-mist are live variables so .ml-light can turn them navy and cool white.
                      Later the same day Mahir tightened it: no sources or notes on the cards (data stays in the page files; reference.md, written by scripts/motherland-references.mts, lists every data source, photo and film; the licences' credits are on /bangladesh/references). Titles and subtitles hold ONE line (RiseText, FitLine, ledes at most 100 characters; phones may wrap a subtitle), checked by lib/motherland-categories.test.ts along with a photograph on every card. Section gaps are BAND_Y in kit.tsx. People is a portrait grid so faces aren't cropped. The Year in Bangladesh is a marked month calendar (culture-calendar.tsx), with no rows. Geography & Travel uses the same hero and cards as the others. Every hero on these pages holds the title alone, with no subtitle or buttons (Mahir, 2026-11-04); the landing page keeps its own. Every hero is a film, never a photograph (Mahir, 2026-11-05; PageHero takes a Film, so it can't be otherwise), with no parallax or drift. The title is centred across the hero and low on it (Mahir, 2026-11-05: he marked the spot on a screenshot), with no shadow or blur behind it: a text shadow gets cut into boxes by RiseText's word clipping. A colour wash gathers at the foot of the film under the title and fades to nothing higher up (HERO_WASH in category.tsx). Deep.titleTone picks it: gold is a gold title on navy; navy and green are a white title on a navy or deep-green wash, because a navy or green title can't be read on them. These pages' header is solid, and corner buttons wait until the hero has gone by (corner-button.tsx). Films come in phone, desktop (2560) and 4K cuts, 4K only from 2200px wide (hero-film.tsx). Pixabay also carries AI-generated "Bangladesh" drone films, tagged Ai Generated: never use them, this page presents the real country. Check every film's frames for political posters: rickshaws-tsc was removed for showing Mujib and Hasina. Wide screens stay calm (.ml-light sets --ml-column to 1600px and --ml-display to 72px at most). Every page ends on the wall of categories; Mahir removed the "Next:" band (2026-11-05), do not bring it back. Biographies opens on Lines that made us: one full-screen stage where the scroll carries each line in turn, with the poets' names as an index (lines-stage.tsx), and its photographs must hold a whole screen. Timelines show every date along one gold line on navy, with no hidden scrolling. A card should not repeat a photograph its own page already showed. Colour carries useful content (Mahir, 2026-11-05): gold bands for figures, the money brands, the converter and the actions a reader can take, soft sun and mint tints between them. Taka's Who moves the money (money-brands.tsx, data/motherland-money.ts) shows wallets and banks with logos in public/motherland/logos; bKash and Nagad show their names until their owners' logo files are added. In `cn()`, put a text size BEFORE its leading: tailwind-merge drops a leading that comes before a size, which is what made two-line titles overlap.
/bangladesh/facts    Facts about Bangladesh (Mahir, 2026-11-04; renamed from "Facts of"), the "Facts" tab, on the 14 topics of Facts about
                      Germany (tatsachen-ueber-deutschland.de) answered for Bangladesh, in the same dress as every other MOTHERLAND page:
                      ml-light, full-screen hero, gold figures line, inked-in intro, photo cards. Its two required sections are "Why we are the best"
                      and "Why we are not doing best": the one MOTHERLAND page that shows failings, by Mahir's instruction. Every figure has its source
                      on the References page, every strength shows its limit, every failing the reader's part.
                      No second navbar (Mahir removed it): a Topics tab on the right edge above "Join with us", a pill on phones (FactsNav in facts-parts.tsx),
                      opens a side panel with the green, red, green flag mark (FactsMark, token ml-flag so .ml-light can't turn it navy), a search
                      across all the facts (lib/motherland-facts-search.ts), the page's sections and every topic. "Both sides" shows one
                      subject from both lists (BOTH_SIDES adds no new figures). Facts have a copy-link button, and the print button loads every photo first.
                      Copy: data/motherland-facts.ts; re-check the figures when they age; checked by lib/motherland-facts.test.ts.
/bangladesh/travel   Geography & Travel (Mahir, 2026-11-04), its own page, not a [category] one, after visittheusa.com's portrait
                      cards in MOTHERLAND's dress. Its job is to make people want to come. Order, as Mahir set it: hero film
                      of the week with no controls or credit on it (WEEK_FILMS, changes by itself each Sunday in Dhaka; credit in the
                      footer) → one narrow line of figures → Top 10 this week (topTen, by season, full-size photos in public/motherland/top;
                      never from Pinterest, licensed sources only) → four old places in the landing page's CardStack, then a rail →
                      a short "When Bangladesh looks best" band of the six seasons, no mind map → hidden gems → crowd alert → know before you go → divisions →
                      stories band → quiz → other categories → the map → Plan your trip as the last section, above a narrow footer (Mahir, 2026-11-04). The map is MapLibre on open
                      data (OpenFreeMap, Terrain Tiles on AWS; no key), loaded only near the viewport; satellite is Esri **[FLAG:
                      check its terms before public launch]**. public/vendor/maplibre-gl-worker.mjs must match node_modules (a test
                      checks): the worker starts from a blob because Chrome won't start one from the service worker's saved copy.
                      The plus button adds a place with Not crowded / Moderate / Crowded, and places can get crowd reports (6 hours);
                      both stay in localStorage until auth, then move to the server (lib/motherland-reports.ts holds the shape).
                      Crowd figures are estimates from the calendar, never live data, and the page says so. "Save for offline"
                      (public/travel-sw.js) stores the map to zoom 10; verified with no server and no network, not just DevTools'
                      offline switch, which gives false failures here. Copy: data/motherland-travel.ts; checked by
                      lib/motherland-travel.test.ts. Plan your trip (trip-planner.tsx, lib/motherland-trip.ts, data/motherland-trip.ts; tested): ask in plain words or choose places, month, days and road (easiest, most enjoyable, cheapest), and it draws the route, adds up the cost from fare tables, warns on closures and permits, and shows ready-made tours and the road map from Dhaka. It reads the question in the browser; with ANTHROPIC_API_KEY set, app/api/motherland/plan also has Claude read it, but prices always come from the tables. /bangladesh/travel/stories is the story contest (top 10, travel wall, XP): sections only until
                      auth arrives, with no invented stories.
/bangladesh/government  BD Guide (Mahir, 2026-11-01), reached from MOTHERLAND's Gov button: an independent
                      guide to the Bangladesh government. Its home is "All topics and services" (cloned from
                      usa.gov's home page); /about is cloned from usa.gov/about-the-us. usa.gov's layout in
                      MOTHERLAND + Kandari colours (flag green titles and rules, Kandari navy, white; gold only for
                      small accents, never bars), MOTHERLAND-style rounded tiles (Tile in components/bd-gov/kit.tsx),
                      a navy footer, and a navy "guide" wordmark whose i alone is gold (components/bd-gov/mark.tsx).
                      Cards (Tile) are navy-cap badges with a small icon medallion; "Explore" opens a detail page
                      /bangladesh/government/<slug> (usa.gov/branches-of-government layout: side menu, official-site
                      card with "Go to the official site", parts, "Have a question?"), copy in data/bd-gov-details.ts,
                      checked by lib/bd-gov.test.ts. /benefits is cloned from usa.gov/benefits.
                      gv-* tokens; Merriweather + Source Sans 3. Its own header and footer. It must say it is NOT a government website (banner + footer). /national-portal carries
                      data gathered from bangladesh.gov.bd (counts, service categories, hotlines, offices), every
                      link to the official page. Copy: data/bd-gov.ts; components/bd-gov.
                      One-click directory (Mahir, 2026-11-05): the National Portal page opens on search and every service one button from its official page (data/bd-gov-services.ts, components/bd-gov/one-click.tsx, lib/bd-gov-services.ts; English and Bangla, tested). We link out and never file for anyone. Only list a link that opened: scripts/bd-gov-links.mts re-checks them, because about 80 of the 283 on the portal's own list were dead that day. `ready` holds only what the official page itself says. No fee amounts unless the official page confirms them: reports of passport fees disagree, so the card links to the fee page. Loan schemes name their press source and date. The government today names dates and offices, not people or parties.
/nagorik             "নাগরিক অধিকার ও দায়িত্ব" — National Index, BBS Time-Use Survey 2021 charts (real),
                      constitutional rights, helplines, responsibilities by group, nightly self-check, and
                      the four civic chapters moved from /bangladesh: /nagorik/crisis, shield, problems,
                      solutions (old /bangladesh/* links redirect). Data: data/nagorik.ts, data/desh.ts;
                      components/nagorik, components/desh.
/login, /signup      Kandari Profile auth — phone OTP first, email password or one-time link as fallback;
                      3-step sign-up (details → verify phone → sectors/products/consent). Mock gateway
                      (no backend yet): lib/auth/core.ts (pure, tested) + lib/auth/client.ts (browser
                      storage); demo accounts in data/auth.ts. proxy.ts guards PROTECTED_PREFIXES.
/account             Kandari Profile — auth-gated subscriber dashboard (was /profile, which now
                      redirects to /media/me)
/contact
```

Each product/solution card component must be reusable across `/`, `/products`, and future sector pages — Kandari-Lab is explicitly a multi-sector company, so the component shouldn't be hardcoded to healthcare content.

---

## 6. Performance & inclusivity constraint (data-backed, not a stylistic note)

The brief's own mission is "affordable and open for the full Bangladesh" — a large share of the target audience is on mid/low-end Android devices and inconsistent 3G/4G. A full WebGL 3D hero on every device works against that mission and against Core Web Vitals/LCP, which also undercuts "trusted, premium" (slow sites read as cheap, not premium).

Build rule:
- Code-split the R3F bundle; load only above a viewport/hardware threshold (or on user interaction).
- Serve a lightweight animated SVG/CSS fallback hero on low-end/mobile rather than a degraded 3D scene.
- Lazy-load everything below the fold; no blocking web fonts for Bangla script.

---

## 7. Data model & auth — "Kandari Profile"

Every profile subscribes to get notified of new research and product releases. Minimum fields: name, phone/email, sector interests (multi-select, since the company is multi-sector by design), followed products.

Auth: **phone-OTP primary, email magic-link fallback.** Rationale: OTP-by-SMS is the more reliable pattern for the general Bangladeshi public this site targets, vs. assuming universal comfortable email use. **[FLAG — confirm SMS gateway provider/budget]**

Content (team roster, product copy, impact stats) should live in Postgres tables managed via simple FastAPI admin routes rather than a third-party headless CMS, so non-technical team members can update copy without a new vendor dependency. **[FLAG — confirm this vs. a SaaS CMS like Sanity]**

---

## 8. Component conventions
- Extend shadcn/ui primitives (`Card`, `Button`, `Dialog`, etc.) — do not fork them into bespoke components unless shadcn genuinely can't do it.
- One `<ProductCard>` component, reused for SWASTI, Aponjon, and future sector products — don't build per-product one-offs.
- Buttons: solid gold (`#E4B027`) = primary action (Download App, Join Kandari Profile); outline green = secondary.

---

## 9. Open decisions log (do not resolve unilaterally — surface these back to Mahir)
1. FastAPI vs. Fastify for the backend (recommended FastAPI, not yet confirmed).
2. Custom Postgres-backed content management vs. third-party headless CMS.
3. SMS/OTP provider for phone auth.
4. Color hierarchy in §4.1 — confirm red is scoped to urgency-only use.
5. Hero ratio behavior on mobile (§4.3) — confirm the 4:5/stacked fallback approach.
6. "MOTO" vs. "Motto" spelling in the brand motto.