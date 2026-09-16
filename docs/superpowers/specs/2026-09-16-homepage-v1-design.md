# Kandari Lab (কাণ্ডারী-ল্যাব) — Marketing Homepage v1 Design

## Context

Kandari Lab is a Bangladesh-focused startup. This spec covers the **frontend-only marketing homepage** — a single, rich landing page that tells the startup's story (mission, vision, goals, impact) and drives app downloads. It intentionally excludes authentication, user profiles, dashboards, and the community/reviews system, which are deferred to a phase 2 spec once this foundation and visual language are approved.

## Goals

- Present Kandari Lab as a premium, internationally credible, trustworthy Bangladesh startup.
- Communicate mission/vision/impact (solving unemployment, community benefit) with real-feeling data visualizations.
- Drive two actions: **Download App** and (visually present, not yet functional) **Sign In**.
- Fully responsive across mobile, tablet, and desktop.

## Non-Goals (deferred to phase 2)

- Auth (sign in / sign up) functionality.
- Kandari user profile pages and dashboards.
- Community / reviews system (real, persisted).
- Dedicated About / Services / Team pages (only previews of these live on the homepage in v1).
- Backend integration (FastAPI/Fastify). All data in v1 is static/mock.

## Tech Stack

- **Framework**: Next.js (latest, App Router, TypeScript, Turbopack dev server)
- **Styling**: Tailwind CSS (latest)
- **Components**: shadcn/ui (buttons, cards, navigation-menu, dialog, badge)
- **3D**: React Three Fiber + drei (hero background)
- **Animation**: Framer Motion (scroll reveals, hover states, counters)
- **Charts**: Recharts (impact graphs, mock data)
- **Fonts**: Poppins (headings), Inter (body); Noto Sans Bengali as fallback for any Bangla text
- **Package manager**: npm

## Brand Tokens

Defined as CSS variables mapped into the Tailwind theme:

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` (Bottle Green) | `#006A4E` | Primary brand color — sections, primary buttons, nav accents |
| `--color-accent` (Red) | `#F42A41` | Secondary accent — highlights, badges, alerts |
| `--color-title` (Orange) | `#FF9100` | Headings, CTA button color/text emphasis |
| Neutral grays/white | Tailwind default slate/white scale | Backgrounds, body text, borders |

Light theme only for v1 (no dark mode toggle).

## Page Structure (single `/` route, App Router)

1. **Sticky Navigation**
   - Logo + wordmark
   - Anchor links: Mission, Impact, Services, Team, Community
   - "Sign In" button — renders and links to a placeholder `/login` route (a simple "coming soon" stub page), not functional auth
   - "Download App" primary CTA button (`#FF9100`)
   - Mobile: collapses into a slide-out sheet (shadcn `Sheet`)

2. **Hero Section — 16:6 aspect ratio**
   - React Three Fiber canvas: an extruded/embossed 3D Bangladesh map mesh, slow auto-rotation, ambient + directional lighting, subtle green/red floating particles, gradient backdrop (bottle green → dark).
   - Foreground: headline in `#FF9100` (Poppins bold), supporting subheadline (Inter), primary "Download App" button, secondary "Explore Kandari" ghost button.
   - Mobile fallback: reduced particle count and simplified camera framing to maintain performance; canvas still renders (no static-image fallback) but at lower geometry/particle detail based on viewport width.

3. **Mission & Vision**
   - 2–3 column card layout (shadcn `Card`), icon + short copy per card (Mission, Vision, Goal).
   - Hover: lift + shadow + border glow in accent color.

4. **Impact Section**
   - Animated stat counters (e.g., people trained, unemployment addressed, partners, regions reached) using Framer Motion, triggered on scroll into view.
   - Recharts visualizations (e.g., a line/area chart showing growth over time, a bar chart by region) using realistic mock data defined in a local `data/impact.ts` file.

5. **Services Preview**
   - Grid of 3–4 service cards with icon, title, short description.
   - Hover: 3D tilt/glow effect (Framer Motion + CSS perspective transform).
   - "View all services" link → route stub `/services` (placeholder page, phase 2 builds it out).

6. **Team Preview**
   - 3–4 team member cards (photo placeholder, name, role, short bio, social icons revealed on hover).
   - Mock data in `data/team.ts`.

7. **Community / Reviews Teaser**
   - Horizontally scrolling testimonial carousel (mock quotes/names/roles) framed as a preview of a future community feature.

8. **Download App CTA Band**
   - Full-width bottle-green band with App Store / Google Play badge placeholders and a QR code placeholder.

9. **Footer**
   - Link columns (Company, Resources, Legal — placeholder links), social icons, contact info, copyright line.

## Responsiveness

- Mobile-first Tailwind breakpoints (`sm`, `md`, `lg`, `xl`).
- All grid sections collapse: 1 column (mobile) → 2 columns (tablet) → 3–4 columns (desktop).
- Hero canvas resizes and simplifies on small viewports per above.
- Nav collapses to a slide-out sheet under `md`.

## Data

All content (impact stats, team members, testimonials, services) lives in local TypeScript data files under a `data/` directory so it's easy to swap for real API calls in a later phase without touching component structure.

## Error Handling

- `/login` and `/services` are placeholder stub pages (simple "Coming soon" message) so nav links don't 404 — no functional error states needed in v1 since there's no data fetching or forms yet.
- 3D canvas: if WebGL is unavailable, render a static gradient hero background with the same text/CTAs instead of the R3F canvas (progressive enhancement, detected via a simple WebGL support check).

## Testing

- Component-level rendering checks are lower priority for a marketing site; focus verification on:
  - Successful `next build` (type-checks and lints cleanly).
  - Manual responsive check at mobile/tablet/desktop breakpoints via browser dev tools.
  - Manual verification the hero renders and animates, and gracefully degrades without WebGL.

## Open Items for Phase 2

- Auth flows (sign in/up), Kandari user profile & dashboard with real impact graphs tied to backend data.
- Dedicated About / Services / Team pages.
- Real community/reviews system (likely needs backend + moderation).
- Backend integration via FastAPI or Fastify.
