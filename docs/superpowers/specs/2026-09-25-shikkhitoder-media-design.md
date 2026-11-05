# শিক্ষিতদের মিডিয়া — Skill-First Social Platform (Design)

Date: 2026-09-25 · Status: approved by Mahir · Scope: frontend only, mock data

## Purpose

A Bangladesh-first social platform where people prove skills instead of claiming
them, get community-verified, find fair-paid work, sell what they make, form
productive teams, and act on civic problems. Sources: Mahir's brief, the
"সচেতন hub" PDF (post → self-rate → verify → hire), and the "safe, productive
social media" PDF (Learn → Connect → Create → Apply → Relax).

Principles: no fake profiles (one NID/passport per account) · proof over
certificates · fair price for every product and salary · Bangla-first.

## Decisions

- Lives in this repo under `/media/*` with its own app shell (CLAUDE.md §1
  updated). Old routes `/jibaner-joygan`, `/profile`, `/u/[slug]` redirect in.
- UI name: শিক্ষিতদের মিডিয়া (header button already uses it).
- All 7 sub-projects built in one pass, full depth.
- Removed: Grok / AI lab, Creator Studio, Premium, Reposts, Kandari-R&D-only feed.

## Architecture

- `app/media/layout.tsx` — app shell: top bar (brand, search, chat, alerts,
  wallet, account), left rail (desktop), right rail (xl), bottom tab bar (phones).
- Server components by default; client islands only for interaction.
- `data/media/*.ts` — typed mock data (users, posts, listings, requests, jobs,
  tests, challenges, teams, events, alerts, threads, wallet).
- `lib/media/` — `format.ts` (Bangla digits, ৳ money, relative time),
  `fees.ts` (fee maths), `fair-price.ts` (category bands), `store.ts`
  (client store: `useSyncExternalStore` + localStorage, try/catch guarded)
  holding offers, bids, notes, likes/verifications, quiz attempts, wallet txns.
- Swapping in a backend = replacing `data/media` reads + `store.ts` writes.

## Routes

| Route | Content |
|---|---|
| `/media` | Feed: category filter, composer, 10 post types |
| `/media/explore` | Category grid, trending skills, top verified talent |
| `/media/c/[category]` | Category page: posts, listings, jobs, people |
| `/media/market` | Listings (fixed / bargain / auction), filters |
| `/media/market/[id]` | Listing detail: buy, bargain thread, live auction |
| `/media/market/sell` | Create listing with live fee breakdown + fair band |
| `/media/requests` | Buying requests; sellers send quotes |
| `/media/jobs`, `/media/jobs/[id]` | Sector jobs, hashtags, fair salary band, apply pipeline |
| `/media/verify`, `/media/verify/[testId]` | Skill verification centre, timed exam runner, certificate |
| `/media/challenges` | Code/problem challenges, team vs team, uni labs, tournaments |
| `/media/teams`, `/media/teams/[id]` | Productive family, uni lab, band, travel, project teams |
| `/media/events`, `/media/events/[id]` | Social-work events, RSVP, sponsors, funding bar |
| `/media/civic` | Area alerts, risky zones, chadabaji/road reports, protest & rights |
| `/media/chat` | Inbox, threads with offer cards, team rooms |
| `/media/wallet` | Balance, escrow, transactions, withdraw (BanglaQR/bKash/Nagad/bank) |
| `/media/notes` | Sticky-note board (best task / help / memory of the day) |
| `/media/u/[handle]` | Portfolio profile |
| `/media/me` | Own dashboard |
| `/media/verify-identity` | NID/passport onboarding (mock) |

## Content model

- **Categories (17):** tech, engineering, design & architecture, art, music &
  band, cooking & home food, tuition, research & projects, sports & gaming,
  travel, modeling & photography, content & marketing, small business
  (mudi/stationery/tong/food cart), crafts & tailoring, house rent, home
  services (cleaner/buaa/mechanic), finance & accounts.
- **Post types (10):** skill-proof, project, listing, buying-request, job,
  event, civic, team-recruit, lifestyle, video. Media = image/video placeholders
  with fixed aspect ratios plus a few real site photos.
- **Skill rating:** self (1–5) vs community average + count. Gap ≥ 1.5 →
  "চ্যালেঞ্জড" (≥ 3 raters); community within 0.5 of self (or above) and ≥ 5 raters →
  "যাচাইকৃত". (Revised during build: "community ≥ self" left a 4.9-vs-5 skill
  with 188 raters unverified.)
- **Trust badges:** NID-verified, skill-verified (passed test), community-verified.

## Commerce rules

- Seller fee 5% of sale price; buyer service charge 5% (includes SSLCommerz
  gateway). One constant each in `lib/media/fees.ts`.
- Listing modes: fixed; bargain (offer → counter → accept, max 3 rounds);
  auction (min raise, countdown, highest bid wins).
- Fair price band per category/unit; offers/salaries more than 25% below the
  band's low end show a warning.
- Wallet: available, in escrow, lifetime earned; withdrawals are mock.

## Verification pipeline (jobs & skills)

Quiz (timed MCQ, auto-scored) → problem task (written answer) → short video
interview (recording placeholder, question prompts). Passing a skill test issues
a certificate shown on the profile.

## Design system

Existing site tokens: bd-green primary, signal-orange actions, national-crimson
for urgency only (civic alerts, risky zones, below-fair warnings). Material
Symbols icons, Noto Sans Bengali, `prefers-reduced-motion` respected, 44px
touch targets, mobile bottom tab bar, no horizontal scroll at 360px.

## Out of scope (mocked)

Real payments, EC/Porichoy NID checks, live chat transport, uploads, auth backend.
Actions that need an account use the existing mock session.

## Verification

`tsc --noEmit`, `eslint`, `next build`, and a browser pass of every route at
390px and 1440px with no console errors.
