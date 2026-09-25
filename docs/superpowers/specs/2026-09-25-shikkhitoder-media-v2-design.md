# শিক্ষিতদের মিডিয়া v2 — Core Loop Rebuild (Design)

Date: 2026-09-25 · Status: approved by Mahir · Supersedes the scope of
`2026-09-25-shikkhitoder-media-design.md` (v1). Frontend only, mock data.

## Core loop (the product)

Post a skill → self-rate it → community verifies or challenges the rating →
viewer hires directly from the profile. Everything on screen serves this loop.

## Removed from v1

Jobs board, civic/safety alerts, events & sponsorship, teams (incl. travel
groups), challenges & tournaments, skill exams, buying requests, notes,
explore/category pages, tuition classifieds. Their routes, data and components
are deleted, not hidden.

## Screens

| # | Screen | Route |
|---|---|---|
| 1 | Onboarding: NID/passport trust gate → skill categories (1–5) → profile basics | `/media/onboarding` |
| 2 | Feed: skill posts (video/photo/project demo placeholder, skill tag, category chip), inline self-rating, "Verify this rating", comment thread | `/media`, `/media/post/[id]` |
| 3 | Profile: portfolio grid, per-skill self vs community rating as two separate numbers, sticky Hire, work history, wallet balance on own profile | `/media/u/[handle]` (`/media/me` → own) |
| 4 | Post creation: media placeholders, skill tag selector, self-rating slider, sellable toggle + price | `/media/post/new` |
| 5 | Hire/negotiate: thread, offer → counter → accept (max 3 buyer offers), agreement confirmation with escrow | `/media/messages?t=` |
| 6 | Marketplace: listing card = thumbnail, price, seller verified rating, Buy / Make offer | `/media/market`, `/media/market/[id]` |
| 7 | Wallet: balance, escrow, history with commission on every row, withdraw (bKash / Nagad / BanglaQR) | `/media/wallet` |

## Design

- Palette: site tokens kept — bottle green `#006747` primary, orange `#FF9100`
  for primary actions (near-black text on it), crimson only for "challenged" and
  errors. Warm neutral canvas, restrained shadows, no gradients.
- 8px spacing scale. Cards and buttons never move on hover or press: state is
  shown with border, shadow and color only.
- Icons: lucide-react throughout; Phosphor duotone only for verification seals
  and empty states.
- Type: Inter for Latin and numerals, Noto Sans Bengali for Bangla, mixed per
  glyph via the font stack (`font-sans` = Inter → Noto Sans Bengali).
- Motion (the trust signal only, plus feedback): verified seal shines once,
  stars fill in sequence, like pops, skeleton shimmer, dialog/sheet fades.
  All disabled under `prefers-reduced-motion`.
- Skeletons: route `loading.tsx` for feed, post, profile, market, messages,
  wallet; client-state surfaces show skeletons until localStorage hydrates.
- Numerals: Bangla (default) or Latin, toggled in the shell, stored in cookie
  `sm-numerals`, rendered through `<Num>`, `<Taka>`, `<Ago>` leaf components so
  the server render already uses the chosen digits.

## Rules

- Skill status (unchanged): verified = ≥5 raters and community within 0.5 of
  self; challenged = ≥3 raters and self − community ≥ 1.5.
- A challenge needs a reason (≥10 chars); a verification is just stars.
- Fees: seller 5% of sale; buyer 5% service charge (incl. gateway), shown on
  every transaction row.
- Negotiation: buyer offers ≤ 3 times; seller auto-responds (accept ≥ 92% of
  ask, decline < 75% of floor, else counter midway, never below floor); either
  side's accepted amount becomes the agreement; confirming books it into escrow.
- Withdraw: min ৳500, ≤ available; bKash/Nagad need an 11-digit `01…` number;
  BanglaQR needs a linked account.

## Components

shadcn/ui (in `components/ui`): card, dialog, sheet, tabs, avatar, badge,
form, input, textarea, slider, switch, skeleton, label, sonner. Forms use
react-hook-form + zod (`lib/media/schemas.ts`).

## Verification

`npm test` (pure rules + schemas + data integrity), `tsc`, `eslint`,
`next build`, browser pass at 390px and 1440px: every route, no console
errors, no horizontal scroll, core loop walked end to end.
