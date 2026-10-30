# শিক্ষিতদের মিডিয়া Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the skill-first social platform at `/media/*` (feed, portfolio profiles, marketplace with bargaining/auctions, wallet, jobs with verification pipeline, skill exams, teams/events/civic, chat, notes) as a production-grade frontend on mock data.

**Architecture:** A route subtree `app/media/` with its own shell layout. Pages are server components reading typed mock data from `data/media/`; interaction lives in small client islands backed by one localStorage store (`lib/media/store.ts`). Pure business rules (fees, fair price, skill status, bargaining, auction, formatting) live in dependency-free modules under `lib/media/` with `node:test` unit tests.

**Tech Stack:** Next.js 16.3.5 App Router, React 19.2.8, TypeScript strict, Tailwind v4 (site tokens in `app/globals.css`), shadcn/ui primitives in `components/ui`, Material Symbols via `components/ui/icon.tsx`, Node 24 `node --test` (native type stripping).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-25-shikkhitoder-media-design.md`.
- UI name: শিক্ষিতদের মিডিয়া. Bangla-first copy; English only as secondary labels.
- Colours: only site tokens — `bd-green` (#006747) primary, `signal-orange` (#FF9100) primary actions, `national-crimson` (#DA291C) urgency only (civic alerts, risky zones, below-fair warnings). No ad-hoc hex in components.
- Seller fee 5%, buyer service charge 5% (includes SSLCommerz). Bargain max 3 rounds. Below-fair warning when amount < 75% of band low.
- No new npm dependencies.
- `prefers-reduced-motion` respected; touch targets ≥ 44px; no horizontal scroll at 360px.
- localStorage access always wrapped in try/catch; server snapshot = seed data (no hydration mismatch).
- Removed from nav: Grok/AI lab, Creator Studio, Premium, Reposts.
- Pure modules in `lib/media/*.ts` import nothing (tests run them directly with Node).

---

## File Structure

```
lib/media/
  format.ts          Bangla digits, ৳ formatting (bn-BD lakh grouping), relative time
  fees.ts            computeFees(price) — seller 5%, buyer 5%
  fair-price.ts      assessPrice(amount, band) → verdict
  skill.ts           skillStatus(self, avg, count) → status
  market.ts          bargain + auction rules
  store.ts           client store (useSyncExternalStore + localStorage)
  *.test.ts          node:test suites for the pure modules
data/media/
  types.ts           all domain types
  categories.ts      17 categories + fair price bands
  users.ts           people (portfolio data)
  posts.ts           feed posts (10 types)
  market.ts          listings + buying requests
  jobs.ts            jobs + screening content
  tests.ts           skill exams + challenges
  community.ts       teams, events, civic alerts
  chat.ts            threads
  wallet.ts          wallet seed
  nav.ts             rail + bottom-tab navigation
components/media/
  shell/             top-bar, left-rail, right-rail, bottom-tabs, page-header
  ui/                avatar, trust-badges, skill-meter, media-placeholder, price, fair-price-note, chip-filter, stat, empty-state
  feed/              composer, post-card (switch), one file per post type
  profile/           portfolio sections, notes-board
  market/            listing-card, buy-panel, bargain-thread, auction-panel, sell-form, request-card, quote-form
  wallet/            wallet-summary, txn-list, withdraw-dialog
  jobs/              job-card, apply-pipeline
  verify/            exam-runner, certificate, challenge-card
  community/         team-card, event-card, alert-card, area-risk-board
  chat/              inbox, thread-view, offer-card
app/media/...        routes per spec table
```

---

### Task 1: Pure business rules with tests

**Files:**
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true`)
- Modify: `package.json` (add script `"test": "node --test lib/media/"`)
- Create: `lib/media/format.ts`, `fees.ts`, `fair-price.ts`, `skill.ts`, `market.ts`
- Test: `lib/media/format.test.ts`, `fees.test.ts`, `fair-price.test.ts`, `skill.test.ts`, `market.test.ts`

**Interfaces — Produces:**
```ts
// format.ts
export function bnDigits(value: number | string): string;
export function taka(amount: number): string;            // taka(125000) === "৳১,২৫,০০০"
export function compactBn(n: number): string;            // 1200 → "১.২ হা", 1_500_000 → "১৫ লাখ"
export function timeAgoBn(iso: string, now: Date): string; // "৫ মিনিট আগে" | "৩ ঘণ্টা আগে" | "২ দিন আগে" | "এইমাত্র"
// fees.ts
export const SELLER_FEE_RATE = 0.05; export const BUYER_FEE_RATE = 0.05;
export interface FeeBreakdown { price: number; sellerFee: number; sellerReceives: number; buyerCharge: number; buyerPays: number; platformTotal: number; }
export function computeFees(price: number): FeeBreakdown;
// fair-price.ts
export interface PriceBand { low: number; high: number; unit: string; }
export type PriceVerdict = "unfair" | "under" | "fair" | "premium";
export function assessPrice(amount: number, band: PriceBand): PriceVerdict;
// skill.ts
export type SkillStatus = "unrated" | "rated" | "verified" | "challenged";
export function skillStatus(self: number, communityAvg: number, count: number): SkillStatus;
// market.ts
export const MAX_BARGAIN_ROUNDS = 3;
export function canCounter(roundsSoFar: number): boolean;
export function minNextBid(currentBid: number, startPrice: number, increment: number): number;
export function isValidBid(amount: number, currentBid: number, startPrice: number, increment: number): boolean;
```

- [ ] **Step 1: Write failing tests**

`lib/media/fees.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFees } from "./fees.ts";

test("5% each side on a round price", () => {
  assert.deepEqual(computeFees(1000), {
    price: 1000, sellerFee: 50, sellerReceives: 950,
    buyerCharge: 50, buyerPays: 1050, platformTotal: 100,
  });
});
test("rounds to whole taka", () => {
  const f = computeFees(333);
  assert.equal(f.sellerFee, 17);
  assert.equal(f.buyerPays, 350);
});
test("zero and negative prices clamp to zero", () => {
  assert.equal(computeFees(-5).buyerPays, 0);
});
```
`lib/media/fair-price.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { assessPrice } from "./fair-price.ts";
const band = { low: 1000, high: 2000, unit: "প্রতি পিস" };
test("verdicts", () => {
  assert.equal(assessPrice(700, band), "unfair");   // < 750
  assert.equal(assessPrice(900, band), "under");
  assert.equal(assessPrice(1500, band), "fair");
  assert.equal(assessPrice(2000, band), "fair");
  assert.equal(assessPrice(2500, band), "premium");
});
```
`lib/media/skill.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { skillStatus } from "./skill.ts";
test("statuses", () => {
  assert.equal(skillStatus(4, 0, 0), "unrated");
  assert.equal(skillStatus(5, 3.2, 4), "challenged");
  assert.equal(skillStatus(5, 3.2, 2), "rated");      // too few raters to challenge
  assert.equal(skillStatus(4, 4.3, 12), "verified");
  assert.equal(skillStatus(4, 4.3, 3), "rated");      // too few raters to verify
});
```
`lib/media/market.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { canCounter, minNextBid, isValidBid } from "./market.ts";
test("bargain rounds", () => {
  assert.equal(canCounter(0), true);
  assert.equal(canCounter(2), true);
  assert.equal(canCounter(3), false);
});
test("auction bids", () => {
  assert.equal(minNextBid(0, 5000, 200), 5000);   // first bid = start price
  assert.equal(minNextBid(5400, 5000, 200), 5600);
  assert.equal(isValidBid(5500, 5400, 5000, 200), false);
  assert.equal(isValidBid(5600, 5400, 5000, 200), true);
});
```
`lib/media/format.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { bnDigits, taka, compactBn, timeAgoBn } from "./format.ts";
test("digits and money", () => {
  assert.equal(bnDigits(2026), "২০২৬");
  assert.equal(taka(125000), "৳১,২৫,০০০");
  assert.equal(compactBn(1200), "১.২ হা");
  assert.equal(compactBn(1500000), "১৫ লাখ");
  assert.equal(compactBn(950), "৯৫০");
});
test("relative time", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  assert.equal(timeAgoBn("2026-09-25T11:59:40Z", now), "এইমাত্র");
  assert.equal(timeAgoBn("2026-09-25T11:55:00Z", now), "৫ মিনিট আগে");
  assert.equal(timeAgoBn("2026-09-25T09:00:00Z", now), "৩ ঘণ্টা আগে");
  assert.equal(timeAgoBn("2026-09-23T12:00:00Z", now), "২ দিন আগে");
});
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the five modules** (code as specified by interfaces; bnDigits maps 0-9 → ০-৯; taka uses `new Intl.NumberFormat("bn-BD")`; compactBn: <1000 plain, <100000 "হা" with one decimal trimmed of trailing ".০", <10000000 "লাখ", else "কোটি"; timeAgoBn: <60s এইমাত্র, <60m মিনিট, <24h ঘণ্টা, <30d দিন, else মাস; computeFees clamps price to ≥0 then Math.round each fee; assessPrice: < low*0.75 unfair, < low under, ≤ high fair, else premium; skillStatus rules exactly as tests; minNextBid = currentBid>0 ? currentBid+increment : startPrice).

- [ ] **Step 4: Run** `npm test` — Expected: all PASS.

- [ ] **Step 5: Commit** (only if Mahir asks for commits in this session).

---

### Task 2: Domain types, categories, mock data, navigation

**Files:** Create everything under `data/media/`.

**Interfaces — Produces (`data/media/types.ts`):**
```ts
export type CategoryId = "tech"|"engineering"|"design"|"art"|"music"|"cooking"|"tuition"|"research"|"sports"|"travel"|"modeling"|"content"|"smallbiz"|"crafts"|"rent"|"homeservice"|"finance";
export interface Category { id: CategoryId; bn: string; en: string; icon: string; blurb: string; band: PriceBand; tags: string[]; }
export interface SkillRating { skill: string; category: CategoryId; self: number; communityAvg: number; raters: number; certified?: boolean; }
export type TrustBadge = "nid" | "skill" | "community";
export interface Person { handle: string; name: string; nameBn: string; initials: string; headline: string; district: string; area: string; bio: string; badges: TrustBadge[]; skills: SkillRating[]; categories: CategoryId[]; followers: number; completedJobs: number; earningsRank?: string; teamId?: string; tone: "green"|"orange"|"emerald"|"amber"|"slate"; openToWork: boolean; hourlyRate?: number; joined: string; }
export type MediaKind = "image" | "video" | "audio" | "doc";
export interface MediaSlot { kind: MediaKind; label: string; ratio: "16/9"|"4/3"|"1/1"|"4/5"; src?: string; duration?: string; }
export type PostType = "skill"|"project"|"listing"|"request"|"job"|"event"|"civic"|"team"|"lifestyle"|"video";
export interface Post { id: string; type: PostType; author: string; category: CategoryId; createdAt: string; text: string; tags: string[]; media?: MediaSlot[]; stats: { likes: number; comments: number; shares: number; views: number };
  skill?: { name: string; selfRating: number; communityAvg: number; raters: number };
  refId?: string; /* listing/request/job/event/team/alert id for embedded cards */ }
export type ListingMode = "fixed" | "bargain" | "auction";
export interface Listing { id: string; seller: string; category: CategoryId; title: string; description: string; mode: ListingMode; price: number; unit: string; delivery: ("home"|"pickup"|"digital"|"courier")[]; media: MediaSlot[]; stock?: number; licence?: string; auction?: { startPrice: number; increment: number; currentBid: number; bids: number; endsInHours: number }; floorPrice?: number; rating: number; sold: number; location: string; }
export interface BuyRequest { id: string; buyer: string; category: CategoryId; title: string; detail: string; budgetLow: number; budgetHigh: number; neededBy: string; location: string; quotes: Quote[]; }
export interface Quote { id: string; seller: string; amount: number; days: number; note: string; }
export interface Job { id: string; org: string; orgInitials: string; category: CategoryId; title: string; type: "full"|"part"|"contract"|"gig"|"internship"; location: string; remote: boolean; salaryLow: number; salaryHigh: number; salaryUnit: string; hashtags: string[]; summary: string; responsibilities: string[]; requirements: string[]; screening: { quizId: string; task: string; interviewPrompts: string[] }; applicants: number; postedAt: string; }
export interface Question { id: string; prompt: string; options: string[]; answer: number; explain: string; }
export interface SkillTest { id: string; category: CategoryId; skill: string; level: "basic"|"intermediate"|"advanced"; minutes: number; passMark: number; questions: Question[]; takers: number; }
export interface Challenge { id: string; kind: "code"|"problem"|"team-vs-team"|"lab"|"tournament"|"competition"; title: string; host: string; category: CategoryId; prize: string; deadline: string; participants: number; summary: string; }
export type TeamKind = "family"|"lab"|"band"|"travel"|"project"|"sports";
export interface Team { id: string; kind: TeamKind; name: string; tagline: string; lead: string; members: string[]; openRoles: string[]; area: string; wins: string[]; category: CategoryId; }
export interface EventItem { id: string; title: string; kind: "social"|"competition"|"workshop"|"meetup"; host: string; date: string; place: string; goal: string; going: number; capacity: number; fundGoal: number; funded: number; sponsors: { name: string; tier: "gold"|"silver"|"community" }[]; perks: string[]; }
export type AlertLevel = "critical" | "warning" | "info";
export interface CivicAlert { id: string; kind: "chadabaji"|"road"|"crime"|"pollution"|"rights"|"protest"|"utility"; level: AlertLevel; title: string; area: string; district: string; reportedAt: string; confirmations: number; detail: string; status: "open"|"verified"|"resolved"; }
export interface AreaRisk { area: string; district: string; score: number; trend: "up"|"down"|"flat"; top: string; }
export interface ChatMessage { id: string; from: string; at: string; text?: string; offer?: { listingId: string; amount: number; status: "pending"|"accepted"|"declined"|"countered" } }
export interface Thread { id: string; kind: "direct"|"team"|"deal"; title: string; with: string[]; listingId?: string; messages: ChatMessage[]; unread: number; }
export interface Txn { id: string; at: string; kind: "sale"|"purchase"|"fee"|"withdraw"|"escrow"|"refund"|"job"; label: string; amount: number; status: "done"|"pending"|"held"; }
export interface WalletSeed { available: number; escrow: number; lifetime: number; txns: Txn[]; methods: { id: string; kind: "banglaqr"|"bkash"|"nagad"|"bank"; label: string; masked: string }[]; }
export interface Note { id: string; kind: "task"|"help"|"memory"|"best"; text: string; at: string; }
```
(`PriceBand` imported from `@/lib/media/fair-price`.)

Also produce lookup helpers in each data file: `getPerson(handle)`, `getCategory(id)`, `getListing(id)`, `getJob(id)`, `getTest(id)`, `getTeam(id)`, `getEvent(id)`, `getThread(id)`, and `CURRENT_USER_HANDLE = "mahir"`.

Content volume: 17 categories with bands; ≥14 people spread over categories (village tailor, housewife cook, BUET student, musician, architect, tutor, painter, model/photographer, gamer, mechanic, traveller, content creator, small shop owner, Mahir); ≥16 posts covering all 10 types; ≥12 listings (≥3 bargain, ≥3 auction); ≥5 buying requests with quotes; ≥10 jobs across sectors; ≥5 skill tests with ≥5 questions each; ≥8 challenges; ≥6 teams (one of each kind); ≥5 events; ≥10 civic alerts + ≥8 area risks; ≥5 chat threads including a deal thread with offers; wallet with ≥10 txns.

Nav (`data/media/nav.ts`): `mediaNav` left rail (হোম ফিড, অন্বেষণ, দক্ষতা যাচাই, কাজ ও চাকরি, বাজার, ক্রয় অনুরোধ, চ্যালেঞ্জ, দল, ইভেন্ট, নাগরিক সতর্কতা, বার্তা, ওয়ালেট, নোট, প্রোফাইল) and `mediaTabs` bottom bar (ফিড, বাজার, পোস্ট +, বার্তা, আমি).

- [ ] Step 1: write files. - [ ] Step 2: `npx tsc --noEmit` — Expected: 0 errors.

---

### Task 3: Client store

**Files:** Create `lib/media/store.ts` (client-only, `"use client"` not needed for a plain module but it must only be imported by client components).

**Produces:**
```ts
export interface MediaState {
  liked: Record<string, true>;
  verifiedRatings: Record<string, number>;            // postId → rating the viewer gave
  offers: Record<string, { amount: number; by: "me" | "seller"; at: string }[]>; // listingId → offer rounds
  bids: Record<string, { amount: number; at: string }[]>;                      // listingId → my bids
  purchases: { id: string; listingId: string; amount: number; at: string }[];
  quotes: Record<string, { amount: number; days: number; note: string }>;      // requestId → my quote
  applications: Record<string, { stage: "quiz"|"task"|"interview"|"submitted"; quizScore?: number; task?: string }>; // jobId
  attempts: Record<string, { score: number; total: number; passed: boolean; at: string }>;                           // testId
  rsvps: Record<string, true>; joinedTeams: Record<string, true>; confirmedAlerts: Record<string, true>;
  sent: Record<string, { id: string; text: string; at: string }[]>;            // threadId → my messages
  notes: Note[]; withdrawals: Txn[]; posts: Post[];                             // composer posts
  identity: { status: "none" | "pending" | "verified"; docType?: "nid" | "passport" };
}
export function useMediaState<T>(select: (s: MediaState) => T): T;
export function updateMedia(fn: (s: MediaState) => MediaState): void;
export function resetMedia(): void;
```
Implementation: module-level `state`, `listeners` Set, key `"shikkhitoder-media-v1"`, lazy hydrate from localStorage on first client `subscribe`, `getServerSnapshot` returns the frozen initial state, writes are immutable and persisted in try/catch. Selector results for objects must be stable: `useSyncExternalStore(subscribe, () => select(state), () => select(initial))`.

- [ ] Step 1: implement. - [ ] Step 2: `npx tsc --noEmit` — Expected: 0 errors.

---

### Task 4: App shell, shared UI, redirects, header link

**Files:**
- Create: `app/media/layout.tsx`, `components/media/shell/{top-bar,left-rail,right-rail,bottom-tabs,page-header}.tsx`, `components/media/ui/{avatar,trust-badges,skill-meter,media-placeholder,price,fair-price-note,chip-filter,empty-state,section-card}.tsx`, `app/media/not-found.tsx`
- Modify: `next.config.ts` (`redirects()`: `/jibaner-joygan`→`/media`, `/profile`→`/media/me`, `/u/:slug`→`/media/u/:slug`, all `permanent: false`), `components/layout/site-header.tsx` (feed link href → `/media`), `CLAUDE.md` §1 (platform now lives at `/media`)
- Delete (after redirects verified): `app/jibaner-joygan`, `app/profile`, `app/u`, `components/feed`, `components/profile` only if nothing else imports them (grep first; `profile-sidebar` logo etc.).

Shell behaviour: sticky top bar (h-14) with wordmark "শিক্ষিতদের মিডিয়া", search input (`/media/explore?q=`), icons for chat/alerts/wallet with count dots, avatar menu; left rail `lg:` fixed 16rem with active state from `usePathname` (client island only for active state); right rail `xl:` with trending skills, top verified talent, nearby alerts; bottom tabs `lg:hidden` fixed with safe-area padding, centre "পোস্ট" orange FAB linking `/media?compose=1`. Main content column max-w-[720px] (feed) or wide (market/jobs grids) via `PageHeader` + child layout.

Shared UI contracts:
- `Avatar({ person | initials, tone, size: "sm"|"md"|"lg"|"xl", ring?: boolean })`
- `TrustBadges({ badges, compact? })` — NID shield (green), skill (orange check), community (emerald group)
- `SkillMeter({ rating: SkillRating })` — two bars (self vs community) + status chip via `skillStatus`
- `MediaPlaceholder({ slot })` — aspect-ratio box; image: gradient + `image` icon + label; video: dark gradient + play button + duration; audio: waveform bars; uses `src` with next/image when present
- `Price({ amount, unit? })`, `FairPriceNote({ amount, band })` — verdict chip; `unfair` crimson with Bangla explanation
- `ChipFilter({ items, active, hrefFor })` — horizontal scroll, links (server friendly)

- [ ] Steps: implement → `npx tsc --noEmit` → `npm run build` passes → visit `/media` placeholder page renders shell at 390px and 1440px.

---

### Task 5: Feed, composer, explore, category pages

**Files:** `app/media/page.tsx`, `app/media/explore/page.tsx`, `app/media/c/[category]/page.tsx` (`generateStaticParams` over categories, `dynamicParams = false`), `components/media/feed/{feed-list,composer,post-card,post-actions,verify-rating,skill-post,project-post,listing-post,request-post,job-post,event-post,civic-post,team-post,lifestyle-post,video-post}.tsx`.

Behaviour: category chip filter via `?c=` search param; feed tabs (আপনার জন্য / যাচাইকৃত দক্ষতা / কাজ / বাজার / নাগরিক); composer (client) with post-type picker (10 types), category select, text, media slot adds (placeholder), tags; new posts prepend from store. `PostActions` (client): like toggle, comment count, share (copy link via `navigator.clipboard` in try/catch), views. `VerifyRating` (client) on skill posts: 1–5 star rating by viewer, updates displayed community average optimistically, shows status via `skillStatus`. Explore: search (`?q=` filters people/listings/jobs by name/title/tags), 17 category tiles, top verified talent, trending hashtags. Category page: header with blurb + fair band, sections: people, listings, jobs, posts.

- [ ] Steps: implement → tsc → browser check filters, composer adds post, rating updates.

---

### Task 6: Portfolio profile, dashboard, notes, identity

**Files:** `app/media/u/[handle]/page.tsx` (static params over people), `app/media/me/page.tsx`, `app/media/notes/page.tsx`, `app/media/verify-identity/page.tsx`, `components/media/profile/{portfolio-hero,skill-board,portfolio-grid,certificates,profile-tabs,hire-dialog,notes-board,identity-flow,dashboard-cards}.tsx`.

Profile: cover + avatar + name/headline/district + TrustBadges + open-to-work + hourly rate with FairPriceNote; actions Hire (dialog: brief, budget, deadline → creates deal thread in store and links to `/media/chat?t=`), Message, Follow; stats (followers, jobs done, avg rating); SkillBoard (all SkillMeters); portfolio grid (their listings + project posts); certificates (passed tests); team link; notes preview. `/media/me`: dashboard cards — earnings, escrow, active offers/bids, applications by stage, test attempts, identity status CTA. Notes: sticky-note board with 4 kinds (coloured tape), add/delete, "আজকের সেরা কাজ" pinned. Identity flow (client): steps doc type (NID/passport) → number (NID 10/13/17 digits or passport pattern `^[A-Z]{1,2}\d{7}$`, inline validation) → front/back upload placeholders → selfie placeholder → review → status `pending` then simulated `verified`; explains one-person-one-account rule.

- [ ] Steps: implement → tsc → browser: hire dialog creates thread; identity validation errors show.

---

### Task 7: Marketplace

**Files:** `app/media/market/page.tsx`, `app/media/market/[id]/page.tsx`, `app/media/market/sell/page.tsx`, `app/media/requests/page.tsx`, `components/media/market/{listing-card,buy-panel,bargain-thread,auction-panel,sell-form,fee-breakdown,request-card,quote-form}.tsx`.

- Market list: filters by mode (সব / নির্ধারিত দাম / দরদাম / নিলাম), category chips, delivery; grid of ListingCards (media, title, seller + badges, price/mode chip, location, rating, sold).
- Detail: gallery placeholders, description, licence (for music/design), seller card, delivery options, FairPriceNote vs category band. Right panel by mode:
  - fixed → BuyPanel: qty, delivery choice, FeeBreakdown (buyer view), "কিনুন" → confirmation step → records purchase + wallet txn in store.
  - bargain → BargainThread: offer input, rounds shown as chat bubbles, seller auto-response rule (accept if ≥ price·0.92; counter at midpoint of offer and price, rounded to 10, if ≥ floorPrice; decline otherwise), round counter "রাউন্ড ২/৩", after accept → buy with agreed price; unfair offers flagged before sending.
  - auction → AuctionPanel: current bid, bid count, countdown from `endsInHours` computed from first client mount, min next bid, quick-bid buttons (+1×,+2×,+5× increment), validation via `isValidBid`, my bids list.
- Sell: form (title, category, mode, price / start price+increment / floor price, unit, delivery, stock, media slots) with live FeeBreakdown (seller view: you receive) and FairPriceNote; submit → preview card + success state.
- Requests: list with budget range + FairPriceNote on budget, quotes list, QuoteForm (amount, days, note) saves to store.

- [ ] Steps: implement → tsc → browser: bargain 3 rounds end state; auction invalid bid rejected; fees correct (1000 → buyer pays ৳১,০৫০).

---

### Task 8: Wallet

**Files:** `app/media/wallet/page.tsx`, `components/media/wallet/{wallet-summary,txn-list,withdraw-dialog,fee-explainer}.tsx`.

Summary cards (available, escrow, lifetime) merged with store purchases/withdrawals; transactions with filters (সব / আয় / খরচ / ফি / উত্তোলন); withdraw dialog: method (BanglaQR, bKash, Nagad, bank), amount with validation (≥ ৳৫০০, ≤ available), review, success → pending txn; fee explainer card with a worked example from `computeFees`.

- [ ] Steps: implement → tsc → browser: withdrawing more than available is blocked.

---

### Task 9: Jobs + apply pipeline

**Files:** `app/media/jobs/page.tsx`, `app/media/jobs/[id]/page.tsx`, `components/media/jobs/{job-card,job-filters,apply-pipeline,quiz-step,task-step,interview-step}.tsx`.

List: filters by sector (category), type, remote, hashtag (`?tag=`); JobCard shows salary band with FairPriceNote against category band (low end), applicants, posted time. Detail: summary, responsibilities, requirements, hashtags, org card, ApplyPipeline stepper: Quiz (uses the linked SkillTest questions, 10-minute timer, auto-score, must reach passMark to continue) → Task (textarea ≥ 80 chars) → Interview (3 prompts, record placeholder with 60s timer simulation, "রেকর্ড" toggles) → Submitted summary. Progress persisted in store `applications`.

- [ ] Steps: implement → tsc → browser: failing quiz blocks progress; reload keeps stage.

---

### Task 10: Skill verification centre + challenges

**Files:** `app/media/verify/page.tsx`, `app/media/verify/[testId]/page.tsx`, `app/media/challenges/page.tsx`, `components/media/verify/{test-card,exam-runner,certificate,challenge-card}.tsx`.

Centre: how verification works (post → self-rate → community verify → test → certificate), tests by category with level, minutes, pass mark, takers, my attempts. ExamRunner (client): intro → one question at a time with progress, countdown (auto-submit at 0), review screen with explanations → result → Certificate (printable card: name, skill, level, score, date, id) stored in attempts. Challenges: filter by kind, cards with prize, deadline, participants, "যোগ দিন" joins (store).

- [ ] Steps: implement → tsc → browser: pass and fail paths.

---

### Task 11: Teams, events, civic

**Files:** `app/media/teams/page.tsx`, `app/media/teams/[id]/page.tsx`, `app/media/events/page.tsx`, `app/media/events/[id]/page.tsx`, `app/media/civic/page.tsx`, `components/media/community/{team-card,team-detail,event-card,funding-bar,sponsor-wall,rsvp-button,alert-card,area-risk-board,report-form}.tsx`.

Teams: kind filter (productive family, uni lab, band, travel, project, sports), cards with members avatars, open roles; detail with members + skills, open roles with apply, wins, join button. Events: social-work first; card with date, place, going/capacity, funding bar, sponsors; detail with goal, schedule, perks (sponsor T-shirt), RSVP (store), "স্পন্সর হোন" dialog (tier choice → thanks). Civic: area risk board (score 0–100, crimson ≥ 70, trend), alert feed with level filter and kind filter, confirm button (+1 confirmation, store), report form (kind, area, detail; anonymous toggle) → prepends alert. Rights & protest section with lawful-conduct guidance note.

- [ ] Steps: implement → tsc → browser: RSVP persists; report adds alert.

---

### Task 12: Chat

**Files:** `app/media/chat/page.tsx`, `components/media/chat/{inbox,thread-view,offer-card,composer}.tsx`.

Two-pane on lg (inbox + thread), single pane with back button on phones, selected via `?t=`. Inbox: tabs সব / ডিল / দল, unread counts, last message preview. Thread: bubbles, day separators, OfferCard (listing mini card, amount, status; accept/counter/decline in deal threads — counter uses the same bargain rules), composer (Enter sends, Shift+Enter newline) saving to store `sent`; threads created by Hire dialog appear.

- [ ] Steps: implement → tsc → browser: send message persists after reload; offer accept updates status.

---

### Task 13: Full verification

- [ ] `npm test` — all pass.
- [ ] `npx tsc --noEmit` — 0 errors.
- [ ] `npm run lint` — 0 errors in new files.
- [ ] `npm run build` — succeeds; all `/media/*` routes listed.
- [ ] Browser (chrome-devtools MCP) at 390×844 and 1440×900: every route renders, no console errors, no horizontal scroll, bottom tabs on phone, redirects from old routes work.
- [ ] Update `CLAUDE.md` §1 and report to Mahir.
