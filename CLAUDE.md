# CLAUDE.md — Kandari-Lab (কাণ্ডারী-ল্যাব) Company Website

This file is the persistent working context for Claude Code on this repo. Read it fully before making changes. It encodes decisions already made, defaults chosen where the brief was ambiguous, and open items that still need Mahir's sign-off — those are marked **[FLAG]** and must not be silently resolved differently without asking.

---

## 1. What this repo is

A single deliverable: the **Kandari-Lab mother-company marketing/portfolio website**. It tells the startup's story (vision, mission, impact, solutions), showcases products, and converts visitors into "Kandari Profile" subscribers and app downloads.

**Out of scope for this repo** (do not build here — separate future repos):
- The **Shukh** super-app itself (mobile, React Native/Expo — see `Shukh-frontend`/`Shukh-backend`).

**Exception — শিক্ষিতদের মিডিয়া (decided by Mahir, 2026-09-25):** the skill-first social platform is built in this repo, self-contained under `/media/*` with its own shell (`app/media/layout.tsx`), data (`data/media/`), rules (`lib/media/`) and components (`components/media/`). Keep it isolated there so it can move to its own repo later: nothing outside `/media` imports from those folders except the header link. Scope is the core loop only (post a skill → self-rate → community verifies → hire); jobs, civic alerts, events, travel groups, tournaments and tuition classifieds are explicitly out. Spec: `docs/superpowers/specs/2026-09-25-shikkhitoder-media-v2-design.md` (supersedes v1). The old `/jibaner-joygan`, `/profile` and `/u/*` pages redirect into it (see `next.config.ts`). Tests: `npm test`.

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
| Action / CTA | Orange | `#FF9100` | titles (per brief), all primary buttons, links, highlighted stats — the color that must draw the eye |
| Alert / urgency | Red | `#DA291C` | reserved for emergency/urgency-coded UI only (e.g. "Golden Two Hours" callouts, critical stats) — **not** a general decorative color. Overusing it undercuts the "calm, trustworthy" positioning the brief also asks for. |
| Neutrals | Near-black `#0A0A0A`, off-white `#FAFAF8`, gray scale | — | body text, backgrounds, borders |

Rationale for capping red's role: the brief asks simultaneously for "green and red" *and* a "very professional, trusted, advanced premium" look. Three high-saturation colors fighting for attention reads as busy, not premium. Giving red a narrow, meaningful job (urgency) instead of general decoration keeps the palette disciplined while still using every color the brief named.

### 4.2 Typography
- Latin: a modern geometric sans (Inter or Satoshi).
- Bengali: **Noto Sans Bengali or Hind Siliguri** — required, not optional. The brand name, motto, and product names are Bangla-first; do not let the Bangla text render in a fallback system font. Tune line-height separately for Bangla (conjuncts need more vertical room than Latin defaults).
- Titles/headings: orange (`#FF9100`) per brief, bold weight, generous letter-spacing at large sizes.

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
/profile             Kandari Profile — auth-gated subscriber dashboard (see §9)
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
- Buttons: solid orange (`#FF9100`) = primary action (Download App, Join Kandari Profile); outline green = secondary.

---

## 9. Open decisions log (do not resolve unilaterally — surface these back to Mahir)
1. FastAPI vs. Fastify for the backend (recommended FastAPI, not yet confirmed).
2. Custom Postgres-backed content management vs. third-party headless CMS.
3. SMS/OTP provider for phone auth.
4. Color hierarchy in §4.1 — confirm red is scoped to urgency-only use.
5. Hero ratio behavior on mobile (§4.3) — confirm the 4:5/stacked fallback approach.
6. "MOTO" vs. "Motto" spelling in the brand motto.