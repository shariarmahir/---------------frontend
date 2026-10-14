/**
 * Picks the headline colour for a patch of photograph, from the five the UI
 * already uses: gold, white, black, bottle green and deep navy.
 *
 * Pure maths, no DOM: the hero feeds it the pixels behind its text (see
 * components/sections/hero-tone.ts). The rule is contrast, not a brightness
 * guess. Each colour is scored by how much of the patch it reads on at the
 * WCAG large-text ratio (3:1). Only colours within a few percent of the best
 * coverage are eligible; of those, the first in brand order (gold, green,
 * navy, white, black) whose contrast on the patch's average tone is
 * comfortable (4.5:1) wins, and when none is comfortable the highest contrast
 * does. So dark photographs get gold, mid greens get white, and a bright
 * mustard field gets navy. An empty patch is white, the page's default text.
 */

export type TextTone = "gold" | "white" | "black" | "green" | "navy";

/** Preference order when several colours read equally well. */
const ORDER: readonly TextTone[] = ["gold", "green", "navy", "white", "black"];

/** sRGB of each colour: #E4B027, #FFFFFF, #000000, #006747, #0B1849. */
const RGB: Record<TextTone, readonly [number, number, number]> = {
  gold: [228, 176, 39],
  white: [255, 255, 255],
  black: [0, 0, 0],
  green: [0, 103, 71],
  navy: [11, 24, 73],
};

/** WCAG AA for large text, which the hero title is. */
const MIN_CONTRAST = 3;
/** Comfortable contrast, the bar for choosing among colours that all read. */
const COMFORT_CONTRAST = 4.5;

function linear(channel: number) {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an sRGB colour, 0–255 channels. */
export function luminance(r: number, g: number, b: number) {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG contrast ratio between two relative luminances. */
function contrast(a: number, b: number) {
  return a > b ? (a + 0.05) / (b + 0.05) : (b + 0.05) / (a + 0.05);
}

const TONE_LUMINANCE = Object.fromEntries(
  ORDER.map((tone) => [tone, luminance(...RGB[tone])]),
) as Record<TextTone, number>;

/** Coverage gaps smaller than this count as a tie. */
const TIE = 0.05;

/** The colour that reads best on these luminances. */
export function pickTone(luminances: ArrayLike<number>): TextTone {
  const n = luminances.length;
  if (n === 0) return "white";

  let sum = 0;
  for (let i = 0; i < n; i++) sum += luminances[i];
  const mean = sum / n;

  const coverage = {} as Record<TextTone, number>;
  let best = 0;
  for (const tone of ORDER) {
    const lt = TONE_LUMINANCE[tone];
    let reads = 0;
    for (let i = 0; i < n; i++) if (contrast(lt, luminances[i]) >= MIN_CONTRAST) reads++;
    coverage[tone] = reads / n;
    best = Math.max(best, coverage[tone]);
  }

  const eligible = ORDER.filter((tone) => coverage[tone] >= best - TIE);
  const comfortable = eligible.find((tone) => contrast(TONE_LUMINANCE[tone], mean) >= COMFORT_CONTRAST);
  if (comfortable) return comfortable;
  // Nothing is comfortable (a mid tone): the highest contrast on the mean.
  return eligible.reduce((a, b) => (contrast(TONE_LUMINANCE[b], mean) > contrast(TONE_LUMINANCE[a], mean) ? b : a));
}

const INK_RGB = [3, 32, 23] as const;

/**
 * The hero's two scrims, so the photograph is judged as the visitor sees
 * it, not as the file is. KEEP IN SYNC with the gradient classes in
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
