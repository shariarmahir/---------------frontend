import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared parts for the home page, in the header's language: gold, ink and
 * bottle green as solid colour fields, and a gold signal pulse running
 * along the seams of the dark bands.
 */

export type Tone = "light" | "dark";

export function SectionHeading({
  title,
  lead,
  tone = "light",
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("story-reveal mb-8 flex flex-col gap-3 sm:mb-10", className)}>
      {/* The hero title's style: mixed case, balanced on a phone (28px there, so a section title outranks its cards), one line from lg up. */}
      <h2
        className={cn(
          "font-grotesk text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance sm:text-3xl sm:leading-[1.2] lg:text-4xl lg:whitespace-nowrap",
          tone === "dark" ? "text-signal-orange" : "text-text-primary",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p className={cn("max-w-3xl font-sans text-base leading-relaxed lg:max-w-none", tone === "dark" ? "text-white/80" : "text-text-secondary")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/** A hairline with a gold pulse travelling along it (decorative). */
export function SignalSeam({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-x-0 h-px overflow-hidden bg-white/10", className)}>
      <span className="signal-run absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-signal-orange to-transparent" />
    </span>
  );
}

/**
 * Button looks. Every button shares one shape, size and weight, in sentence
 * case; only the colour changes. Gold is the primary on dark grounds, navy
 * the primary on gold; each has an outline twin for the secondary action.
 */
const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:-translate-y-0.5 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";

const BASE = cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 font-grotesk text-sm font-bold focus-visible:outline-none", LIFT);
const SOLID = "shadow-tile hover:shadow-tile-lift";

export const btn = {
  gold: cn(BASE, SOLID, "bg-signal-orange text-text-primary focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2"),
  /** On a gold field the buttons are navy, never gold on gold (Mahir, 2026-10-17). */
  navy: cn(BASE, SOLID, "bg-bdnavy-900 text-white hover:bg-bdnavy-700 focus-visible:ring-2 focus-visible:ring-bdnavy-900 focus-visible:ring-offset-2 focus-visible:ring-offset-signal-orange"),
  /** The secondary of gold, on navy, ink and black: a gold edge that fills solid gold when pointed at. On the black ground give it a navy fill (`bg-bdnavy-900`), never leave it see-through there. */
  goldOutline: cn(BASE, "text-signal-orange ring-2 ring-signal-orange ring-inset hover:bg-signal-orange hover:text-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"),
  /** The secondary of navy, on gold. */
  navyOutline: cn(BASE, "text-bdnavy-900 ring-2 ring-bdnavy-900 ring-inset hover:bg-bdnavy-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-signal-orange"),
  /** Pages outside the home page still use these two. */
  ink: cn(BASE, "bg-text-primary text-white shadow-ink hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-text-primary"),
  ghost: cn(BASE, "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-signal-orange"),
};

/** Hover lift shared by the white tiles. */
export const tileLift = cn("shadow-tile hover:shadow-tile-lift", LIFT);
