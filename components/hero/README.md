# Animated collage hero

A Three.js (react-three-fiber) hero for the Kandari Lab landing page. The
source is one collage photograph, sliced into tiles at build time, then
rebuilt as a textured 3D scene that pans across the collage.

## Asset paths

| What | Where |
| --- | --- |
| Source collage (2572 x 718) | `public/hero/CREATEDhero.jpg` |
| Sliced tiles | `public/hero/tiles/{id}.webp` |
| Tile manifest | `public/hero/tiles.json` |
| Static fallback (reduced motion / no WebGL) | `public/hero/CREATEDhero.jpg` |

## Re-running the slicer

```bash
# 1. put CREATEDhero.jpg in public/hero/
# 2. run the slicer
npm run slice:hero
```

The slicer (`scripts/slice-collage.mjs`) scans the source for gold
(`#E4B027`) border lines, snaps the known tile rectangles onto the detected
grid, crops 2px inside each border to drop the gold edge pixels, and writes
each tile as WebP (quality 85) plus `public/hero/tiles.json`.

If a tile cannot be snapped cleanly it falls back to the approximate
rectangle and is reported in the slicer's output.

Requires `sharp` (already present via Next.js). If it is ever missing:

```bash
npm i -D sharp
```

## Code map

| File | What it does |
| --- | --- |
| `components/hero/HeroSection.tsx` | The band, the scrim, the headline and the two buttons. HTML over the canvas. |
| `components/hero/HeroCanvas.tsx` | Client-only canvas mount, the static-image fallback, the reduced-motion path, the mobile path. |
| `components/hero/CollageScene.tsx` | The three.js scene: camera, pan, idle drift, pointer parallax. |
| `components/hero/Tile.tsx` | One photo tile: reveal, gold frame sweep, Ken Burns, per-group motion, water ripple. |
| `components/hero/PixelPoints.tsx` | The gold point cloud that outlines Bangladesh in the opening. |
| `components/hero/useHeroTimeline.ts` | The single master clock. Everything reads from it, so the whole thing pauses together. |
| `components/hero/MobileFilmStrip.tsx` | The mobile 3D strip: one tile large, neighbours partly visible, swipable and auto-advancing. |
| `components/hero/collage-layout.ts` | Source-pixel to world-unit conversion, group depths, the tile type. |
| `components/hero/useCollageAssets.ts` | Checks the collage assets exist before the animated hero takes over. |

## The timeline (14 seconds, then idle)

| Time | What happens |
| --- | --- |
| 0 - 2.5s | Gold points drift in from both edges and settle into a Bangladesh outline on black. |
| 2.5 - 5s | Points dissolve; tiles fade in left to right, 40ms apart, each scaling 1.04 -> 1.0. Gold frames sweep on around each one. |
| 5 - 12s | Slow linear camera pan across the whole collage, with parallax from the group depths. |
| 12 - 14s | Camera settles; the headline and buttons resolve. |
| 14s onward | Idle: a very slow back-and-forth drift, plus pointer parallax (desktop only). |

## The three groups

`archive` (1971 and other historical material) gets a slow, straight push-in
and nothing else — no ripple, no tilt, no particles, no colour grading.
`youth` gets Ken Burns plus a faint 2 degree tilt. `rural` gets Ken Burns,
a one percent drift, and a soft UV ripple on the water and rain tiles
(amplitude below 0.004).

## Colour

The project is Tailwind v4, so the tokens live in `app/globals.css` under
`@theme`, not in a `tailwind.config.ts`:

- `--color-signal-orange: #e4b027` — headline, buttons, frames, points
- `--color-text-primary: #032017` — the ink on the gold button
- `--color-bdnavy-900: #0b1849`, `--color-cobalt: #035397` — available but unused here
- `--color-national-crimson: #da291c` — urgency only, not used in this hero

## Fallbacks

- `prefers-reduced-motion: reduce` — the static collage, no animation.
- No WebGL, or the canvas fails to initialise — the same static collage.
- Mobile (< 768px) — the 3D film strip, no point intro, plain fade.
- The hero scrolls out of view or the tab is hidden — the render loop stops.

## Optional video export

`scripts/export-video.mjs` is not included yet. It would open the hero at
1920x720, step the timeline deterministically, capture at 30fps and encode
H.264 plus a 1280x480 WebM with ffmpeg into `public/hero/hero-loop.mp4`.
It needs Playwright and ffmpeg on the path, so it is left out of the repo
until the hero itself is settled.
