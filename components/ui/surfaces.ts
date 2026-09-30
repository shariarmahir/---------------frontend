import type { CSSProperties } from "react";

/**
 * Colour fields for the product pages, the home page's Pixel-Map palette in
 * its order: green, gold, orange, then ink. Ink text on gold and orange,
 * white on green and ink (white on gold or orange would fall under 4.5:1).
 * Ink cards carry a faint ring so they hold an edge on the black ground.
 * `tile` is the contrasting fill for an icon or number plate on that card.
 */
export const SURFACES = [
  { card: "bg-bd-green text-white", tile: "bg-signal-orange text-text-primary", glow: "var(--color-bd-green)" },
  { card: "bg-signal-orange text-text-primary", tile: "bg-text-primary text-signal-orange", glow: "var(--color-signal-orange)" },
  { card: "bg-bdorange-600 text-text-primary", tile: "bg-text-primary text-signal-orange", glow: "var(--color-bdorange-600)" },
  { card: "bg-text-primary text-white ring-1 ring-white/12", tile: "bg-bdgreen-500 text-text-primary", glow: "var(--color-bdgreen-500)" },
] as const;

export const surfaceAt = (i: number) => SURFACES[i % SURFACES.length];

/** Inline `--glow` for the hover / press shadow. */
export const glowStyle = (glow: string) => ({ "--glow": glow }) as CSSProperties;

/**
 * Lift and glow on hover (mouse) and on press (touch): a quick press-in, a
 * slow release. The transition names `translate` and `scale` as well as
 * `transform`, because Tailwind's lift sets those separate properties.
 */
export const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-20px_var(--glow)] active:-translate-y-1.5 active:scale-[0.98] active:shadow-[0_22px_40px_-20px_var(--glow)] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";
