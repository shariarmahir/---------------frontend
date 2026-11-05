# শিক্ষিতদের মিডিয়া v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use `- [ ]`.

**Goal:** Rebuild `/media` around the core loop (post → self-rate → verify → hire) per `docs/superpowers/specs/2026-09-25-shikkhitoder-media-v2-design.md`.

**Architecture:** Same shape as v1 — server pages over typed mock data in `data/media`, client islands over `lib/media/store.ts`. New: pure `lib/media/negotiation.ts` (offer state machine), zod schemas in `lib/media/schemas.ts`, numerals context + leaf number components, shadcn primitives written against the vendored `radix-ui`.

**Tech Stack:** Next 16.3.5, React 19.2, Tailwind v4, radix-ui, lucide-react 1.46, @phosphor-icons/react 2.1, zod 4, react-hook-form 7, sonner.

## Global Constraints

- Excluded features must not appear anywhere in `/media` (jobs, civic, events, teams, challenges, exams, requests, notes, tuition classifieds).
- Self rating and community rating are always two separate numbers.
- No hover/active translate on cards or buttons.
- Site tokens only: `bd-green`, `signal-orange` (dark text), `national-crimson` for challenged/errors.
- Every number shown to users goes through `<Num>` / `<Taka>` / `<Ago>` / `<Compact>`.
- localStorage in try/catch; server snapshot = empty state.

---

### Task 1 — Pure rules + schemas (TDD)
- Create `lib/media/negotiation.ts` + test: `startNegotiation`, `buyerOffer`, `sellerReply`, `acceptLatest`, `confirmAgreement`, `negotiationStatus`.
- Create `lib/media/schemas.ts` + test: identity, profile basics, post, comment, verify/challenge, hire, offer, withdraw.
- Update `lib/media/format.ts` + test: `numerals` parameter (`"bn" | "latn"`).
- Remove `identity`-unrelated v1 tests only if their module is deleted.

### Task 2 — Data v2
- Rewrite `data/media/types.ts`, `users.ts` (work history), `posts.ts` (skill/project posts, comments), `market.ts` (sellable listings only), `chat.ts` (negotiation threads), `wallet.ts` (gross/fee/net per row), `nav.ts`; delete `jobs.ts`, `community.ts`, `tests.ts`; update integrity test.

### Task 3 — Foundation UI
- shadcn primitives: tabs, avatar, form, textarea, slider, switch, skeleton, sonner.
- Media layout: Noto Sans Bengali variable, numerals provider (cookie), Toaster.
- Shell: top bar (search, numerals toggle, messages, wallet, avatar), left rail, bottom tabs, mobile Sheet nav.
- Primitives: `Num/Taka/Ago/Compact`, `VerifiedSeal` (Phosphor duotone), `Stars`, `RatingPair`, `MediaFrame`, `EmptyState` (Phosphor), skeletons.
- Delete v1 routes/components for excluded features.

### Task 4 — Feed + post detail + comments + verify/challenge dialog
### Task 5 — Post creation form
### Task 6 — Profile (portfolio, ratings, sticky Hire, work history, wallet card) + Hire sheet
### Task 7 — Messages: negotiation thread, offers, agreement confirmation
### Task 8 — Marketplace list/detail with Buy dialog and Make offer
### Task 9 — Wallet with commission rows and withdraw form
### Task 10 — Onboarding (trust gate → categories → basics)
### Task 11 — Loading skeletons, verification (tests, tsc, lint, build, browser at 390/1440, core loop end to end)
