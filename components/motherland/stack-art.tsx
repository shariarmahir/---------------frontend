import type { ReactNode } from "react";
import type { Art } from "@/data/motherland";
import { cn } from "@/lib/utils";

/*
 * The faint drawings behind each history card's words, as the reference
 * site lays sweeping bands behind its own: each one taken from the card's
 * subject. Arches for the mosques and monasteries of ancient Bengal; the
 * Shaheed Minar's five frames before its sun for 1952; the seven peaks of
 * the National Martyrs' Memorial for 1971; river currents for society.
 * Drawn in white at a whisper, so the words stay on top.
 */

/** A doorway arch standing on the ground line, `w` wide with its crown at `top`. */
const arch = (cx: number, w: number, top: number) => `M${cx - w / 2} 820 V${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${cx + w / 2} ${top + w / 2} V820`;

/** A triangle from the ground line to an apex, the memorial's folded planes. */
const peak = (cx: number, half: number, top: number) => `M${cx - half} 820 L${cx} ${top} L${cx + half} 820`;

const DRAWINGS: Record<Art, ReactNode> = {
  arches: (
    <g fill="none" stroke="currentColor" strokeWidth="34">
      <path d={arch(560, 520, 180)} />
      <path d={arch(560, 360, 330)} />
      <path d={arch(560, 200, 480)} />
      <path d={arch(150, 220, 470)} />
      <circle cx="560" cy="120" r="70" />
    </g>
  ),
  minar: (
    <g fill="none" stroke="currentColor" strokeWidth="28">
      <circle cx="560" cy="470" r="210" fill="currentColor" fillOpacity="0.6" stroke="none" />
      <path d="M470 820 V180 H650 V820" />
      <path d="M320 820 V420 H400 V820" />
      <path d="M720 820 V420 H800 V820" />
      <path d="M190 820 V560 H250 V820" />
      <path d="M870 820 V560 H930 V820" />
    </g>
  ),
  peaks: (
    <g fill="none" stroke="currentColor" strokeWidth="22" strokeLinejoin="round">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={peak(560, 420 - i * 52, 60 + i * 34)} />
      ))}
    </g>
  ),
  waves: (
    <g fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round">
      <path d="M-60 260 C 140 120, 360 380, 560 240 S 900 150, 980 260" />
      <path d="M-60 430 C 160 300, 380 540, 600 410 S 900 330, 980 430" />
      <path d="M-60 600 C 180 480, 400 700, 620 580 S 900 520, 980 600" />
      <path d="M-60 770 C 200 660, 420 860, 640 750 S 900 700, 980 770" />
    </g>
  ),
};

export function StackArt({ art, className }: { art: Art; className?: string }) {
  return (
    <svg viewBox="0 0 920 820" preserveAspectRatio="xMaxYMax slice" aria-hidden className={cn("pointer-events-none absolute inset-0 size-full text-white/5", className)}>
      {DRAWINGS[art]}
    </svg>
  );
}
