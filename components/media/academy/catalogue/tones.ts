import type { CSSProperties } from "react";

/**
 * Each department's colour in the catalogue — the reference's seven, with
 * the brand's blue and yellow standing in for its blue and amber. `fill` is
 * the badge and hover edge (black text sits on it); `light` and `dark` are
 * the ink for words on ash and on charcoal.
 */
const TONES = [
  { fill: "#3d74ff", light: "#013fd0", dark: "#84a9ff" },
  { fill: "#e8573f", light: "#b83a24", dark: "#ff8a70" },
  { fill: "#8b5cf6", light: "#6a3fd6", dark: "#b69cff" },
  { fill: "#ffb423", light: "#8f5600", dark: "#ffc14d" },
  { fill: "#12a58a", light: "#0a7563", dark: "#3fd6b8" },
  { fill: "#e0368f", light: "#b0206c", dark: "#ff7ab8" },
  { fill: "#7bb51c", light: "#457008", dark: "#a6e04a" },
] as const;

/** The style that gives an element (with the `tone` class) the n-th colour, cycling. */
export function toneStyle(n: number): CSSProperties {
  const t = TONES[n % TONES.length];
  return { "--c-app": t.fill, "--c-tone-light": t.light, "--c-tone-dark": t.dark } as CSSProperties;
}
