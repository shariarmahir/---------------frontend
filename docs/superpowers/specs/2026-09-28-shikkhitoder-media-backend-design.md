# শিক্ষিতদের মিডিয়া — Backend (Design)

Date: 2026-09-28 · Status: approved by Mahir (via direct request) · Companion to
`2026-09-25-shikkhitoder-media-v2-design.md` (frontend) and CLAUDE.md §3/§7/§9.

## Purpose

Replace the frontend's mock, browser-only state (`lib/auth/core.ts`,
`lib/media/store.ts`, localStorage) with a real, production-ready HTTP API,
without changing the rules the frontend already encodes. Every business rule
below is copied from the existing pure TypeScript logic — this is a faithful
server-side reimplementation, not a redesign.

Repo: the existing (currently empty) sibling directory
`M:\কাণ্ডারী-ল্যাব\কাণ্ডারী-ল্যাব-backend` — own git history, own
deploy lifecycle — CLAUDE.md §1 keeps this platform "self-contained" and
"able to move to its own repo later"; a backend is the forcing function.
Frontend integration (swapping `lib/auth/client.ts` / `lib/media/store.ts`
for `fetch` calls) is a **separate, later** frontend-repo task — out of
scope here. This spec covers only the backend service.

## Scope decomposition

The domain has nine bounded contexts. All ship in one FastAPI app (one
deploy unit, one database) — splitting into microservices would add
operational cost with no present benefit at this scale — but each is an
isolated router + service + repository module so any could be extracted
later without touching the others.

1. **Identity & auth** — phone-OTP, email+password, magic link, sessions,
   NID/passport verification gate
2. **Profile** — handle, categories, skills (self vs. community rating)
3. **Feed** — posts, comments/replies, likes, ratings (verify/challenge)
4. **Marketplace** — listings, negotiation (offer/counter/accept), orders
5. **Wallet & fees** — ledger, escrow, withdrawals, fee computation
6. **Jobs** — fair-pay-enforced job posts, applications
7. **Civic** — reports, confirmations, solutions
8. **Community** — events + sponsors, teams, challenges + entries
9. **Messaging & notices** — threads tying together hire/offer negotiations

## Approach

**Recommended: modular monolith, FastAPI + PostgreSQL + SQLAlchemy 2.0
(async) + Alembic, one process.**

Alternatives considered:
- *Django REST Framework* — heavier batteries-included admin/ORM, but the
  brief and CLAUDE.md both name FastAPI explicitly, and the async-first
  design suits the negotiation/rating read-heavy feed better.
- *Microservices per bounded context* — wrong scale for a first backend
  with one team; the modular-monolith router/service split gets the same
  seam without the deployment/observability overhead.

FastAPI is confirmed (user request + CLAUDE.md recommendation).

## Architecture

```
app/
  main.py                 # FastAPI() app, router mounts, middleware, exception handlers
  config.py                # Pydantic Settings (env-driven)
  database.py               # async engine/session, Base
  deps.py                   # shared FastAPI Depends: db session, current_account, pagination
  security.py                # JWT issue/verify, password hashing (passlib[argon2]), OTP codes

  core/
    errors.py               # AppError hierarchy -> RFC7807-style JSON responses
    pagination.py
    ids.py                   # ULID generation

  identity/                  # bounded context 1
    models.py                 # Account, OtpTicket, VerifiedPhone, MagicLink, LoginFailure, Session/RefreshToken
    schemas.py                # Pydantic request/response models
    service.py                 # port of lib/auth/core.ts rules
    sms.py                     # SmsSender protocol + LoggingSmsSender (dev) + interface for a real gateway
    router.py                  # /auth/*

  profiles/                  # bounded context 2
    models.py                 # Profile, SkillRating
    schemas.py / service.py / router.py   # /profiles/*

  feed/                      # bounded context 3
    models.py                 # Post, Comment, Like, Rating
    schemas.py / service.py / router.py   # /posts/*

  market/                    # bounded context 4
    models.py                 # Listing, Negotiation, Round, Order
    schemas.py / service.py / router.py   # /listings/*, /negotiations/*
    rules.py                   # port of lib/media/market.ts + negotiation.ts

  wallet/                    # bounded context 5
    models.py                 # WalletAccount, LedgerTxn, Withdrawal
    schemas.py / service.py / router.py   # /wallet/*
    fees.py                    # port of lib/media/fees.ts

  jobs/ civic/ community/ messaging/   # bounded contexts 6-9, same shape

  shared/
    fair_price.py              # port of lib/media/fair-price.ts
    fair_pay.py                 # port of lib/media/fair-pay.ts
    skill_status.py              # port of lib/media/skill.ts
    identity_validate.py          # port of lib/media/identity.ts (NID/passport format)

alembic/                     # migrations
tests/
  unit/                      # rules ported 1:1 from the *.test.ts files (same cases)
  integration/                # httpx.AsyncClient + test DB (testcontainers or SQLite for CI speed)
pyproject.toml                # uv/poetry, ruff, mypy strict, pytest
Dockerfile
docker-compose.yml            # api + postgres + (later) redis, for local dev
.env.example
DEPLOYMENT.md
```

**Why this shape:** every existing `lib/media/*.ts` pure-rule file has a
direct 1:1 counterpart under `shared/` or a context's `rules.py`/`fees.py`.
Porting the existing `.test.ts` cases into `pytest` gives free regression
coverage against rules already validated by the frontend team — no rule is
invented fresh, only translated.

## Data model (PostgreSQL, key tables)

- `accounts` — id (ULID), name, phone (unique, normalized), email
  (unique, nullable), password_hash (argon2), role, district, sectors
  (array), products (array), notify_sms, notify_email, media_handle,
  created_at
- `otp_tickets` — phone, code_hash, purpose, sent_at, expires_at, attempts
  (never store the raw code at rest — hash it, same as a password; the
  frontend mock keeps plaintext only because it has no server to hash on)
- `verified_phones` — phone, expires_at (signup phone-proof window)
- `magic_links` — token_hash, account_id, expires_at
- `login_failures` — identifier, count, locked_until
- `refresh_tokens` — id, account_id, token_hash, expires_at, revoked_at
- `profiles` — account_id (1:1), handle (unique), district, headline, bio,
  categories (array), doc_type, doc_number_hash (never store raw NID),
  verified_at
- `skill_ratings` — profile_id, skill, category, self, community_avg,
  raters — `community_avg`/`raters` are derived from `post_ratings`,
  recomputed transactionally on each new rating (see Feed below)
- `posts`, `comments` (self-referential parent_id for replies), `likes`
  (post_id/comment_id polymorphic — two nullable FKs, checked exclusive),
  `post_ratings` (post_id, rater_id unique together, stars, verdict, reason)
- `listings`, `negotiations` (1:1 with listing or standalone hire thread),
  `negotiation_rounds`, `orders` (booked negotiation -> escrow txn)
- `wallet_accounts` (1:1 per profile: available, escrow, lifetime),
  `ledger_txns` (append-only; balance is derived, never mutated directly),
  `withdrawals` (method, account_ref, amount, status)
- `jobs`, `job_applications`
- `civic_reports`, `civic_confirmations`, `civic_solutions`,
  `solution_votes`
- `events`, `event_sponsors`, `event_joins`, `teams`, `team_members`,
  `challenges`, `challenge_entries`
- `threads`, `messages`, `notices`

All money fields are integer taka (paisa-free, matches the frontend's
integer BDT convention) — never floats, to avoid rounding drift in fee math.

## Business rules (ported, not reinvented)

**Auth** (`identity/service.py`, from `lib/auth/core.ts`):
- OTP: 6 digits, 5 min TTL, 30s resend cooldown, 5 max attempts then locked
- Phone-proof window after signup OTP: 15 min to complete registration
- Password: 8–72 chars, argon2 hash (real backend upgrades the frontend's
  cyrb53 mock hash to a real KDF — explicitly called out as mock-only in
  its own docstring)
- Lockout: 5 failed password attempts -> 5 min lock
- Magic link: 15 min TTL, single use, **always returns success shape**
  whether or not the email exists (enumeration resistance — the frontend
  comment already states this intent; the backend is where it actually
  matters)
- Session: JWT access token (short-lived, e.g. 15 min) + rotating refresh
  token (30-day absolute expiry, matching `AUTH_RULES.sessionMs`) stored
  hashed, revocable — the frontend's single long-lived localStorage
  session becomes access+refresh so a stolen access token expires fast

**Identity documents** (`shared/identity_validate.py`, from
`lib/media/identity.ts`): NID must normalize to 10/13/17 ASCII digits
(Bangla digit input accepted); passport must be 9 chars, 1–2 letters then
7–8 digits. Format check only — this backend does not call the Election
Commission or passport authority; that integration is a marked stub.

**Skill status** (`shared/skill_status.py`, from `lib/media/skill.ts`):
verified = ≥5 raters and self−community ≤ 0.5; challenged = ≥3 raters and
self−community ≥ 1.5; else rated/unrated. Recomputed on every new
`post_ratings` row inside the same DB transaction that inserts it.

**Fees** (`wallet/fees.py`, from `lib/media/fees.ts`): seller fee 5% of
price (rounded), buyer service charge 5% of price (rounded), both shown on
every ledger row; `platform_total = seller_fee + buyer_charge`.

**Fair price / fair pay** (`shared/fair_price.py`, `shared/fair_pay.py`):
category price bands; job pay floor is category-band-based for `task` unit,
fixed ৳12,500/month and ৳150/hour otherwise; a job posted below floor is
rejected at the API layer (422), not just flagged client-side as the mock
does — a real backend is the actual enforcement point CLAUDE.md's "pay
below the fair band is refused" language calls for.

**Negotiation** (`market/rules.py`, from `lib/media/negotiation.ts` +
`market.ts`): state machine open → awaiting-seller → countered/declined →
agreed → booked; max 3 buyer offers; seller auto-response (accept ≥92% of
ask, decline <75% of floor, else counter at the midpoint, never below
floor) runs server-side synchronously on offer submission (no cron/queue
needed — it's a pure function of the new offer, same as the frontend).
Booking an agreement is one transaction: negotiation.booked=true + escrow
ledger debit from buyer + credit to escrow, atomically.

## API surface (representative — full OpenAPI is generated by FastAPI)

```
POST   /auth/otp/request              {phone, purpose}
POST   /auth/otp/verify               {phone, code}
POST   /auth/register                 {name, phone, email?, password, role, district, sectors, products, notify}
POST   /auth/login/password           {identifier, password}
POST   /auth/login/link/request       {email}
POST   /auth/login/link/consume       {token}
POST   /auth/refresh                  {refresh_token}
POST   /auth/logout
GET    /auth/me
PATCH  /auth/me
POST   /auth/me/password
DELETE /auth/me                       {password}

GET    /profiles/{handle}
POST   /profiles/onboarding/identity   {docType, number, fullName, dob, ...}   -> 202 pending verification
POST   /profiles/onboarding/categories {categories}
POST   /profiles/onboarding/basics     {displayName, handle, district, headline, bio}

GET    /posts?cursor&category&topic
POST   /posts                          (postSchema)
GET    /posts/{id}
POST   /posts/{id}/like
POST   /posts/{id}/comments             {text}
POST   /posts/{id}/comments/{cid}/replies
POST   /posts/{id}/comments/{cid}/like
POST   /posts/{id}/rating               (verifySchema)

GET    /listings?cursor&category
POST   /listings
GET    /listings/{id}
POST   /listings/{id}/offers            {amount}         -> runs sellerResponse, returns updated negotiation
POST   /negotiations/{id}/accept-counter
POST   /negotiations/{id}/confirm       -> books escrow

GET    /wallet
GET    /wallet/txns?cursor
POST   /wallet/withdraw                 (withdrawSchema)
POST   /orders/{id}/release             -> escrow release to seller

GET    /jobs?cursor&sector&type
POST   /jobs                            (jobSchema, server-enforces fair-pay floor)
POST   /jobs/{id}/apply

GET    /civic?cursor&district&kind
POST   /civic
POST   /civic/{id}/confirm
POST   /civic/{id}/solutions
POST   /civic/solutions/{id}/vote

GET    /events?cursor  POST /events  POST /events/{id}/join  POST /events/{id}/sponsors
GET    /teams?cursor   POST /teams   POST /teams/{id}/join
GET    /challenges?cursor  POST /challenges  POST /challenges/{id}/entries

GET    /threads?cursor  GET /threads/{id}/messages  POST /threads/{id}/messages  POST /threads/{id}/read
GET    /notices?cursor
```

All list endpoints use cursor pagination (opaque base64 cursor over
`(created_at, id)`), not offset — feed/listings/civic grow unbounded.

Every mutating endpoint requires a valid access token except
`/auth/*` (pre-login) — mirrors `PROTECTED_PREFIXES` in `data/auth.ts`
(the whole platform is members-only).

## Error handling

Single `AppError` hierarchy in `core/errors.py` mapping to the frontend's
existing Bangla error-code tables (`AUTH_ERROR_BN`, per-field zod messages)
— the backend returns a stable machine-readable `code` (e.g.
`"otp_expired"`, `"phone_taken"`) plus an `en` debug message; the *frontend*
owns Bangla user-facing copy via its existing `AUTH_ERROR_BN`-style maps, so
translations aren't duplicated or allowed to drift between two codebases.
Validation errors (pydantic) return RFC7807 `application/problem+json` with
per-field detail, shaped so the frontend's existing zod-error-display
components need minimal adapting.

## Security

- Argon2id for passwords (passlib), never the frontend's cyrb53 mock
- OTP codes hashed at rest (HMAC-SHA256 with a server pepper), never
  stored or logged in plaintext in production config (the dev
  `LoggingSmsSender` logs to stdout only, gated by `ENV=development`)
- JWT access tokens (short TTL) + rotating opaque refresh tokens (hashed
  at rest, revocable, one-time use with reuse detection -> revoke family)
- Rate limiting at the reverse-proxy/ASGI-middleware layer on
  `/auth/otp/request`, `/auth/login/*` (protects against brute force
  beyond the existing attempt-counter rules)
- CORS locked to the known frontend origin(s) via config, not `*`
- All list/detail endpoints authorize per CLAUDE.md's members-only rule;
  ownership checks (can't edit/delete another account's post/listing/job)
  enforced in each service, tested explicitly
- NID/passport numbers: only a salted hash is stored for uniqueness
  checks; raw values are never persisted past the verification step in
  this backend (real KYC storage/redaction policy is a compliance
  decision for Mahir, flagged, not decided here)
- SQL injection: not reachable — SQLAlchemy Core/ORM parameterized queries
  only, no raw string interpolation anywhere in the codebase
- Structured logging (no PII values in logs — phone/email hashed for
  correlation) + request-id middleware

## Testing

- `tests/unit/` mirrors every `*.test.ts` in `lib/media/` and
  `lib/auth/auth.test.ts` case-for-case (same inputs, same expected
  outputs) — this is the direct regression proof that the port is
  faithful
- `tests/integration/` — httpx AsyncClient against the FastAPI app with a
  disposable Postgres (docker-compose service in CI), covering the full
  core loop end to end: signup -> onboarding -> post -> rate -> list ->
  negotiate -> book -> wallet ledger reflects fees correctly
- Coverage gate: 80%+ on `core/`, `identity/`, `market/`, `wallet/`
  (money and auth paths are the highest-cost-of-bug areas)

## Deployment

Documented step-by-step in `DEPLOYMENT.md` (produced alongside the code):
Docker image (multi-stage, non-root user, `uvicorn` behind `gunicorn`
worker manager), `docker-compose.yml` for local dev (api + postgres),
Alembic migration step as a release-phase command, environment variable
reference (`.env.example`), and a target-agnostic guide covering
Railway/Render/Fly.io/a bare VPS with Caddy/Nginx as reverse proxy +
TLS — matching CLAUDE.md §3's "Railway/Render/VPS" hosting note, without
locking to one vendor since Mahir hasn't confirmed infra preference
(§9 open item #1 remains partially open: framework is now confirmed by
this task, host is not).

## Explicitly out of scope (flagged, not silently decided)

- Real SMS gateway account/credentials (interface built, provider pending
  — CLAUDE.md §9 open item #3)
- Real bKash/Nagad/SSLCommerz money movement (ledger + stub integration
  point only, per your answer above)
- Election Commission NID / passport authority verification calls (format
  validation only, same limitation the frontend docstring already states)
- Updating the Next.js frontend to call this API instead of
  localStorage — separate follow-up task in the frontend repo
