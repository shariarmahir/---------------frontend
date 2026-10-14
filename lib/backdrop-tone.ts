/**
 * Picks how the hero's claim is coloured over a patch of photograph: one of
 * the five UI colours (gold, white, black, bottle green, deep navy) plus the
 * strength of a soft ink scrim laid behind the text.
 *
 * Pure maths, no DOM: the hero feeds it the pixels behind its text (see
 * components/sections/hero-tone.ts). The rule is the worst case, not the
 * average: a photograph with people in it is mostly bright field and partly
 * dark figure, and text that reads on "most" of it still vanishes on the
 * figures. So:
 *
 *  1. Dark text (green, then navy, then black) only when even the darkest
 *     few percent of the patch are bright enough for it at 4.5:1 — a pale
 *     sky, an even bright wall. No scrim.
 *  2. Otherwise light text, with the lightest scrim that brings the
 *     brightest few percent down far enough for it: gold when the photo is
 *     already dark enough that it costs little extra scrim, white otherwise.
 *     White needs 4.5:1 (its subtitle is body size); gold 3:1 on 98% of
 *     the patch (large text; a mid tone, so it gets fewer outliers than white).
 */

export type TextTone = "gold" | "white" | "black" | "green" | "navy";

export type HeroLook = {
  tone: TextTone;
  /** Peak opacity of the ink scrim behind the text, 0–1. */
  scrim: number;
};

/** What the hero shows before the photograph has been measured. */
export const DEFAULT_LOOK: HeroLook = { tone: "white", scrim: 0.45 };

/** sRGB of each colour: #E4B027, #FFFFFF, #000000, #006747, #0B1849. */
const RGB: Record<TextTone, readonly [number, number, number]> = {
  gold: [228, 176, 39],
  white: [255, 255, 255],
  black: [0, 0, 0],
  green: [0, 103, 71],
  navy: [11, 24, 73],
};

/** Dark colours in preference order. */
const DARK: readonly TextTone[] = ["green", "navy", "black"];

/** The page ink the scrims are made of, #032017. */
const INK_RGB = [3, 32, 23] as const;

/** Share of the patch allowed to break the rule (specks, highlights). */
const OUTLIERS = 0.03;
/** Most scrim the hero will lay down; past this the photo is lost. */
const MAX_SCRIM = 0.82;
/** Gold keeps the title when it needs no more scrim than this… */
const GOLD_SCRIM = 0.45;
/** …and no more than this beyond what white would need. */
const GOLD_EXTRA = 0.15;
/** Least scrim, so the claim always sits on a little depth. */
const MIN_SCRIM = 0.12;

function linear(channel: number) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB colour, 0–255 channels. */
export function luminance(r: number, g: number, b: number) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two relative luminances. */
export function contrast(a: number, b: number) {
  return a > b ? (a + 0.05) / (b + 0.05) : (b + 0.05) / (a + 0.05);
}

/** Relative luminance of each UI colour. */
export const TONE_LUMINANCE = Object.fromEntries(
  (Object.keys(RGB) as TextTone[]).map((tone) => [tone, luminance(...RGB[tone])]),
) as Record<TextTone, number>;

/** Brightest backdrop a light colour still reads on at `ratio`. */
const ceilingFor = (tone: TextTone, ratio: number) => (TONE_LUMINANCE[tone] + 0.05) / ratio - 0.05;

/** The luminance at fraction `q` of a sorted list. */
function quantile(sorted: Float64Array, q: number) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * sorted.length)))];
}

/** Luminances of `rgb` (flat r,g,b triples) under an ink scrim of opacity `a`, sorted. */
function scrimmed(rgb: ArrayLike<number>, a: number) {
  const n = Math.floor(rgb.length / 3);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3] * (1 - a) + INK_RGB[0] * a;
    const g = rgb[i * 3 + 1] * (1 - a) + INK_RGB[1] * a;
    const b = rgb[i * 3 + 2] * (1 - a) + INK_RGB[2] * a;
    out[i] = luminance(r, g, b);
  }
  return out.sort();
}

/** Least scrim that brings the brightest pixels (bar `outliers`) to `ceiling` or below. */
function scrimFor(rgb: ArrayLike<number>, ceiling: number, outliers = OUTLIERS) {
  if (quantile(scrimmed(rgb, 0), 1 - outliers) <= ceiling) return 0;
  let lo = 0;
  let hi = MAX_SCRIM;
  for (let step = 0; step < 14; step++) {
    const mid = (lo + hi) / 2;
    if (quantile(scrimmed(rgb, mid), 1 - outliers) <= ceiling) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** The look for a patch, given as flat r,g,b triples (0–255). */
export function pickLook(rgb: ArrayLike<number>): HeroLook {
  if (rgb.length < 3) return DEFAULT_LOOK;
  const lums = scrimmed(rgb, 0);

  // 1. Dark text, only if it reads on all but the darkest specks.
  const darkest = quantile(lums, OUTLIERS);
  for (const tone of DARK) {
    if (contrast(TONE_LUMINANCE[tone], darkest) >= 4.5) return { tone, scrim: 0 };
  }

  // 2. Light text on as little scrim as it needs.
  // Gold is a mid tone, so it is held to 3:1 on more of the patch than
  // white is: a white shirt in a crowd must not eat a word.
  const gold = scrimFor(rgb, ceilingFor("gold", 3), 0.02);
  const white = scrimFor(rgb, ceilingFor("white", 4.5));
  if (gold <= GOLD_SCRIM && gold - white <= GOLD_EXTRA) return { tone: "gold", scrim: Math.max(MIN_SCRIM, gold) };
  return { tone: "white", scrim: Math.max(MIN_SCRIM, white) };
}

/**
 * The hero's two fixed scrims, so the photograph is judged as the visitor
 * sees it, not as the file is. KEEP IN SYNC with the gradient classes in
 * components/sections/hero-section.tsx:
 *   left → right: ink 40% → 20% (middle) → clear
 *   bottom → top: ink 30% → clear (middle) → clear
 * `x` and `y` are 0–1 positions inside the band.
 */
export function shadeUnderScrim(r: number, g: number, b: number, x: number, y: number): [number, number, number] {
  const left = x <= 0.5 ? 0.4 - 0.4 * x : 0.2 * (1 - (x - 0.5) / 0.5);
  const fromBottom = 1 - y;
  const bottom = fromBottom < 0.5 ? 0.3 * (1 - fromBottom / 0.5) : 0;
  const mix = (c: number, i: number, a: number) => c * (1 - a) + i * a;
  return [
    mix(mix(r, INK_RGB[0], left), INK_RGB[0], bottom),
    mix(mix(g, INK_RGB[1], left), INK_RGB[1], bottom),
    mix(mix(b, INK_RGB[2], left), INK_RGB[2], bottom),
  ];
}

/** `object-position` such as "50% 38%" as 0–1 fractions. */
export function parseFocus(focus: string | undefined): [number, number] {
  const m = /^\s*(-?[\d.]+)%\s+(-?[\d.]+)%\s*$/.exec(focus ?? "");
  if (!m) return [0.5, 0.5];
  const clamp = (n: number) => Math.min(1, Math.max(0, n / 100));
  return [clamp(Number(m[1])), clamp(Number(m[2]))];
}
