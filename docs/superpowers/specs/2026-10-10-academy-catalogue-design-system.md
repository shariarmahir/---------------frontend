# Academy catalogue design system

**Status:** adopted 2026-10-10. Every academy page now uses it: the front page, the department and course catalogues, each academy, department and course, admission, routine, the classrooms (hub, room, live class, opening a batch, a new course), exams, graduation, class videos, teacher channels, teaching applications and panel marking.
**Source:** a close study of getartcraft.com/apps and getartcraft.com/press-kit: their markup, stylesheet, scroll-choreography script and page-ruler script. The study copies their layout, motion and behaviour, but not their brand, words or assets.
**Code:** `components/media/academy/catalogue/` (the kit), plus `front/` (the front page) and `catalogue/departments-view.tsx` (the department catalogue).

## 1. The idea

A page is a stack of **bands**: framed columns ruled by hairlines, like a printed catalogue. The page is charcoal by default and warm ash in light mode. Departments carry colour, and the instruments (the needle and the turned words) carry the brand's yellow and blue. Everything is square-edged: no rounded cards and no shadows on the page, only hairlines. Motion is quiet and exact: rules draw, labels rise out of a blur, and the page glides.

## 2. Page frame

- **The shell gives the page the whole screen.**
  - The academy shell (`components/media/academy/shell/academy-shell.tsx`) gives every page the whole screen once the gate and the opening story are done.
  - The academy header, sidebar, journey strip and phone dock then step aside.
  - `#academy-main` remains the scroll container.
- **The page is wrapped as `<CatalogueRoot>` → `<CatalogueNav />` → `<CatalogueRuler />` → bands → `<CatalogueFooter />`.**
  - `CatalogueRoot` owns the theme (dark by default, kept in localStorage `kandari-catalogue-theme`), the Lenis glide (`lerp 0.12`) on `#academy-main`, and the reveal observer.
  - It also owns the faces: Archivo (wide), Instrument Serif and Tiro Bangla (italic).

## 3. Tokens

Tokens are scoped to `.catalogue` and prefixed `--c-`, because shadcn already defines `--muted` and `--accent`. The values are in `app/globals.css`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--c-bg` / `-raised` / `-sunken` | #121316 / #101014 / #060607 | #f2f1ee / #faf9f7 / #e9e8e4 | page, dialogs, picture frames |
| `--c-ink` / `-strong` | #f2f1ee / #fff | #0b1020 / #000 | text, headings |
| `--c-muted` / `--c-faint` | ink at 62% / 46% | ink at 66% / 52% | body copy / labels and numbers |
| `--c-line` / `-strong` | ink at 15% / 40% | ink at 16% / 40% | hairlines / outlined buttons and ticks |
| `--c-accent-ink` | #84a9ff | #013fd0 | links and leaned words (the brand blue) |
| `--c-signal` | #ffb423 | #ffb423 | the one primary button, strong matches |
| `--c-needle`, `--c-turn` | #ffb423 | #013fd0 | the ruler's needle, the turned word |
| `--c-invert-bg` / `-fg` | white / near-black | ink / ash | hover inverts, the bar's main button |

**Department colour.** `toneStyle(n)` from `tones.ts`, on an element with the `tone` class, gives `--c-app` (a fill with black text on it) and `--c-app-ink` (text, which lightens on charcoal). There are seven colours: the reference's palette, with the brand blue and yellow taking its blue and amber.

## 4. Type

- **`.display`:** Archivo at weight 620 and 118% width for Latin and digits; Hind Siliguri for Bangla. Use it for all headings.
- **`.turn`:** serif italic in `--c-turn`, for the one word a heading turns on: "একাডেমি *খুঁজুন*।". Use `<Turn>`. `<Lean>` is the blue variant.
- **`.hud`:** 12px, mono digits with Bangla beside them. Use it for running labels, card strips and numbers. **Never** apply wide letter-spacing or uppercase to Bangla.
- **Numbers:** always go through `Num`, `Taka` or `twoDigits`, so the user's Bangla or Latin numerals setting holds.

## 5. Components (kit)

| Piece | What it is |
|---|---|
| `Band` | A section. Its top rule draws across, two corner ticks pop in, and a sticky running label reads "০২ / সব বিভাগ" with a note on the right. `now` marks the first screen. `rulerLabel` names it in the ruler. |
| `BandTitle` | A 4xl–6xl display heading that rises in. |
| `AssetCard` + `AssetGrid` | The press-kit card: a strip (kind icon and name, number), a 16:9 `frameClass` frame (`FrameImage` filling it or held in, `FrameTag` inverted in the corner), a title, a line of text, and one full-width outlined `actionClass` button with a quiet aside. The grid is 1/2/3 columns of hairline cells and pads its last row with blanks. |
| `DeptCard` | The apps-page card: a coloured number badge, a picture with the icon breaking its edge, the name with "বিভাগ" in its colour, the academy link, tags and teachers. |
| `CatalogueNav` | 48px bar. Square hover inverts; the current page stays inverted; "বিভাগ বাছুন" is set apart after a rule; then ভর্তি, the cart, the theme switch and the inverted "আমার শেখা". Phones get a menu. |
| `CatalogueRuler` | The right-edge page ruler on desk screens with a mouse. Details below. |
| `Modal` | Backdrop black/70 fading over 200ms; the panel rises 10px and grows from 95%. Escape or the backdrop closes it. The glide pauses underneath. |
| `ShareRow`, `CatalogueFooter` | The share strip (link copy, Facebook, WhatsApp) and the ruled footer grid. |
| `CourseCard`, `CourseLineup` | The apps-page card for a course (its department's colour, code, level, next batch, fee, modes), and the line-up with "আপনি কোথায় আছেন?" across its top. The line-up can be driven from outside (`level`, `onLevel`). |
| `TabStrip` | Tabs as a ruled strip of square cells, the chosen one inverted; arrow keys move along it. |
| `buttons.ts`, `fields.ts` | `primaryBtn` (the one yellow button), `secondaryBtn`, `blockBtn`; `fieldClass`, `labelClass`, `messageClass`, `choiceClass`. Shared shadcn fields get their colours from `.catalogue [data-slot=…]` rules in `globals.css`, which outrank the /media shell's own. |
| `EnrolButton`, `PayMethods`, `TierTag` | "ভর্তি হোন" into the cart and checkout; the ruled payment choices; a teacher's standing as a square tag. |
| `fill-row.ts` | `lineupGrid`, `fillRow` (a content cell that fills the last row) and `blankFill` (a blank one, hidden where the row is full). |

## 6. Motion (from the reference's own values)

- **Section arrival** (when its top reaches 88% of the screen):
  - the rule draws in, `scaleX` 0→1 over 0.7s (power2.out);
  - the label rises from 28px with an 8px blur over 0.9s (power3.out), starting at +0.15s;
  - the ticks pop in over 0.35s, starting at +0.35s, 0.06s apart.
- **Blocks:** `data-reveal` blocks rise in the same way. Inside `data-reveal-group`, cards further right start up to 0.18s later.
- **Hover:** pictures zoom to 1.02–1.03 over 500ms; icons lift 4px over 300ms; coloured top edges draw across over 300ms. Buttons and bar links invert over 150ms.
- **Reduced motion:** nothing is hidden or animated, and the ruler becomes a still list of section links.

## 7. The ruler

- **Rail:** 60px, frosted. Ticks every 1% of the page and numbered every 5%; they scroll with the page.
- **Needle:** glows in `--c-needle` with a rolling three-digit readout. Ticks near it stretch with scroll speed.
- **Section words:** the section you're in is large at the top, under the passed ones (small). The ones ahead are queued at the bottom.
  - As a section comes up, its word leaves the queue and rides the rail beside the section's top edge.
  - It then flips letter by letter into the top stack: 200px flip zone, 0.16 stagger, 28px arc.
  - A flip left half-done resolves itself 400ms after scrolling stops.
- **Hover:** after 150ms the page folds into the rail as a map, with a crosshair cursor, a ghost line and a bracket for the visible part.
  - Click to jump (up to 1.25s, easeOutExpo).
  - Drag to scrub.
- **Letters:** split into grapheme clusters (`Intl.Segmenter`), so Bangla stays whole. Keep ruler labels free of conjuncts where possible.

## 8. Building the next page

1. Wrap the page in `CatalogueRoot` / `CatalogueNav` / `CatalogueRuler` / `CatalogueFooter`. Content drawn after the first paint (a form once the browser's records load, a new tab) still arrives with the reveal: the root watches for it.
2. A department keeps its colour everywhere: `toneStyle(departments.findIndex(…))` on a `tone` element.
3. Write it as numbered `Band`s. The first is `now` and carries an `h1` with one `<Turn>` word.
4. Lists become `AssetGrid`s of `AssetCard`s with exactly one action each.
5. Only numbers from the data, and no invented claims.
6. Check dark, light, phone and a mid-scroll ruler state with screenshots before calling it done.
7. Video and live-class frames stay black in both themes; everything else follows the theme tokens.
