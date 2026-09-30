import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared parts for the home page, in the header's language: gold, ink and
 * bottle green as solid colour fields, and a gold signal pulse running
 * along the seams of the dark bands.
 */

export type Tone = "light" | "dark";

/**
 * Three pixels — gold, green, ink — the mark every section heading carries.
 * They run a wave one after another: each rises, turns a half-turn and
 * glows in its own colour, then settles (keyframes in globals.css).
 */
export function PixelMark({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const pixels = [
    { fill: "bg-signal-orange", glow: "var(--color-signal-orange)" },
    tone === "dark"
      ? { fill: "bg-bdgreen-500", glow: "var(--color-bdgreen-500)" }
      : { fill: "bg-bd-green", glow: "var(--color-bd-green)" },
    tone === "dark"
      ? { fill: "bg-white", glow: "white" }
      : { fill: "bg-text-primary", glow: "var(--color-text-primary)" },
  ];
  return (
    <span aria-hidden className={cn("flex items-center gap-1.5 py-1", className)}>
      {pixels.map((px, i) => (
        <span
          key={i}
          style={{ "--i": i, "--glow": px.glow } as CSSProperties}
          className={cn("pixel-wave size-2.5 rounded-[3px]", px.fill)}
        />
      ))}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
  tone = "light",
  className,
}: {
  /** A short Bangla line above the title. */
  kicker?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("story-reveal mb-10 flex max-w-3xl flex-col gap-3", className)}>
      <PixelMark tone={tone} />
      {kicker ? (
        <span className={cn("font-bengali text-sm font-bold", tone === "dark" ? "text-white/80" : "text-bd-green")}>{kicker}</span>
      ) : null}
      <h2
        className={cn(
          "font-grotesk text-2xl font-bold tracking-tight text-balance uppercase sm:text-3xl lg:text-4xl",
          tone === "dark" ? "text-signal-orange" : "text-text-primary",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p className={cn("max-w-2xl font-sans text-base leading-relaxed", tone === "dark" ? "text-white/80" : "text-text-secondary")}>
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
 * Button looks. Gold carries the primary action on light, ink and green
 * grounds; on a gold ground the primary turns ink so it never disappears.
 */
const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:-translate-y-0.5 active:scale-[0.97] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100";

export const btn = {
  gold: cn(
    "inline-flex items-center justify-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-xs font-bold text-text-primary uppercase shadow-tile hover:shadow-tile-lift sm:text-sm",
    "focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:outline-none",
    LIFT,
  ),
  ink: cn(
    "inline-flex items-center justify-center gap-2 rounded-xl bg-text-primary px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase shadow-ink hover:bg-bd-green-dark sm:text-sm",
    "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-text-primary focus-visible:outline-none",
    LIFT,
  ),
  ghost: cn(
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/15 sm:text-sm",
    "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none",
    LIFT,
  ),
};

/** Hover lift shared by the white tiles. */
export const tileLift = cn("shadow-tile hover:shadow-tile-lift", LIFT);
