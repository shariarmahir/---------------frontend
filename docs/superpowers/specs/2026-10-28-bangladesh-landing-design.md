# Bangladesh: national landing page and chapters

Date: 2026-10-28. Decided with Mahir in this session. Supersedes the page structure in CLAUDE.md §5 (`/bangladesh` four acts) for this section.

## Goal

Bangladesh's first national landing page: a premium, international-standard page that tells the country's story, measures it honestly (National Index), names its 32 structural problems with evidence, and shows realistic solutions. One entry in the header (the duplicate "National Index" item goes). Hub plus chapters: `/bangladesh` is a curated landing page; each of its sections opens a full chapter page.

## Decisions (fixed)

| Question | Decision |
|---|---|
| Language | English only (headings, body, labels, place names in English). |
| Structure | Hub + chapters (option A merged with C). |
| Dress | The main landing page's: pitch-black ground; card fields navy `#0B1849` (`bdnavy-900`) / ink `#032017` / cobalt `#035397` with `ring-1 ring-white/12`; gold `signal-orange` (#E4B027) for titles and primary buttons, dark text on gold; red only for urgency; no orange; no gradients on cards; no uppercase, no eyebrow labels; nothing under 12px; 44px targets; visible focus; `prefers-reduced-motion` respected (shared `lib/use-reduced-motion.ts`). Heroes follow the Genius research page (`components/research/home.tsx`): full-bleed credited photo, black card cut into the corner, gold title. The night-green (`bdgreen-950`) world is retired from this section. |
| Facts | Only sourced facts. "At a glance": 8 divisions, 64 districts, area 147,570 km², Language Movement 21 Feb 1952, independence 1971 (26 March declared, 16 December victory), population 169.8 million (BBS Population and Housing Census 2022, adjusted). Index and problem figures keep their existing sources (`data/national-index.ts`, `data/amar-bangladesh.ts`). Photos keep their Wikimedia credits (`data/rural-life.ts`). |

## Routes

| Route | Content |
|---|---|
| `/bangladesh` | Landing hub, 9 sections (below), each a short summary ending in "Explore the chapter" (except 2, 3, 9). |
| `/bangladesh/history` | Chapter 1, The country we love: history timeline, map of divisions, nature, culture, people who lit the way, growth story. (Moved from today's `/bangladesh`.) |
| `/bangladesh/crisis` | Chapter 2, What threatens it: attacks and their shields, loss projection, measurement layer, why problems regenerate. |
| `/bangladesh/shield` | Chapter 3, Your part: the citizen shield from self to country; links to নাগরিক দায়িত্ব (`/nagorik`) and প্রতিবাদ (`/protibad`). |
| `/bangladesh/problems` | Chapter 4, 32 problems pixel by pixel: baseline numbers, where the system breaks first, rural lives, the 32 problems with evidence and paths. |
| `/bangladesh/solutions` | Chapter 5, What solving looks like: what we have, what to let go, who does what, roadmap, close, full research link. |

Old links: `/bangladesh/problems#national-index` → `/bangladesh#national-index` (home spotlight CTA, nav). Old URLs keep working (the chapter routes stay).

## Landing sections (`/bangladesh`)

1. Hero: "Bangladesh" + one line of the low-resolution-image thesis ("Every unsolved problem is one bad pixel. We fix the map one sector at a time."). Credited photo carousel. Primary: "See the National Index" (#national-index); secondary: "The 32 problems".
2. At a glance (#at-a-glance): six fact cards with sources.
3. National Index (#national-index): the `nationalStats` as meter cards (stable / watch / critical), value, change, source and year visible. Honest note: snapshots, not a live feed.
4. The country we love: horizontal card rail (history, nature, culture, achievement) → /bangladesh/history.
5. What threatens it: the top four priority breaks as large cards, "If unsolved / If solved" → /bangladesh/crisis.
6. 32 problems, pixel by pixel: the pixel map + a compact grid of the 32 (theme, urgency, evidence status) with a theme filter → /bangladesh/problems.
7. What solving looks like: roadmap in three phases + who does what (citizen, community, state) → /bangladesh/solutions.
8. Your part: self → neighbourhood → country, linking /nagorik and /protibad → /bangladesh/shield.
9. Go deeper: research (Genius `/research`) and the game (`/cholo-bangladesh-gori`, titled "Build Bangladesh, the game").

## Chapter pages

Shared frame: compact Genius-style chapter hero (chapter number, title, one-line lede, credited photo), a chapter bar under the site header (Overview, History, Crisis, Citizen shield, 32 problems, Solutions, Game; current one marked like the site header's gold bar), and previous/next chapter cards at the end. Content is the existing substance, rewritten in English and restyled; removed: the "share your memory" form, the summary placeholder, the daily judgment form, the six seasons strip, the icons gallery, the duplicate act openers.

## Architecture

- `components/bangladesh-landing/` (new, landing sections) and restyled chapter components; one shared kit for this section (section heading, chapter link card, fact card, meter card) so sections stay consistent and small.
- `data/bangladesh.ts` (new): all English copy for the hub and chapter frame (chapters list with routes, titles, ledes, photos; at-a-glance facts with sources). Chapter-specific English copy lives next to the existing data it replaces.
- `data/navigation.ts`: National Desk = Bangladesh + নাগরিক দায়িত্ব; `bangladeshNavLinks` in English with Overview first.
- Components used outside the section stay (`StoryHeading`, `StoryPhoto`: `/nagorik`, the game). Components and data that end up unused are deleted.

## Quality bar

`npx tsc --noEmit`, `npx eslint`, `npm test` clean; Playwright at 390 / 1024 / 1440 / 1920 on all six routes: no console errors or hydration warnings, no horizontal overflow, no serious/critical axe violations, images with alt text and credits, Lighthouse-friendly (images via next/image with sizes, below-the-fold lazy).
