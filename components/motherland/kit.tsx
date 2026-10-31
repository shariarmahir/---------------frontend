/*
 * MOTHERLAND's kit: the column, the type scale and the pill buttons every
 * section shares. Titles are Anton in uppercase on one line, with a line of
 * text under them; each section's gold pill to its next page stands beside
 * its title. No hooks, so server components can use it.
 */
import Link from "next/link";
import type { Cta } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { RiseText } from "./rise-text";

/** The page column, wide like the reference site's (up to 120rem, a 3rem gutter from xl); the rails line up to it. */
export const COLUMN = "mx-auto w-full max-w-480 px-6 sm:px-10 xl:px-12";

/** A section's anchor lands clear of the fixed header. */
export const ANCHOR = "scroll-mt-(--ml-header)";

/** The big uppercase title, on one line: up to 96px, smaller when the words need it (RiseText fits it). */
export const DISPLAY = "font-ml-display text-[clamp(2.5rem,6.6vw,6rem)] leading-[1.02] tracking-[0.01em] uppercase";

export const LEDE = "max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl";

const PILL_BASE =
  "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3 text-base font-semibold whitespace-nowrap transition-[background-color,color,scale] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none";

/** The page's buttons: gold with ink text first; on hover ink on paper, paper on dark bands. */
export const pill = {
  onLight: cn(PILL_BASE, "bg-signal-orange text-ml-ink hover:bg-ml-ink hover:text-white focus-visible:outline-ml-green"),
  onDark: cn(PILL_BASE, "bg-signal-orange text-ml-ink hover:bg-white focus-visible:outline-white"),
  /** White, for the hero's suggestions. */
  white: cn(PILL_BASE, "bg-ml-ground text-ml-ink hover:bg-signal-orange focus-visible:outline-white"),
};

export type Tone = "light" | "dark";

/** The section's one way onward: the gold pill to the category's own page. */
export function NextPage({ cta, tone = "light", className }: { cta: Cta; tone?: Tone; className?: string }) {
  return (
    <Link href={cta.href} className={cn(tone === "dark" ? pill.onDark : pill.onLight, className)}>
      {cta.label}
    </Link>
  );
}

/**
 * A section's heading: the rising title on one line and the line under it,
 * nothing above. `cta`, the way onward, stands beside the title from lg
 * (under the words on a phone), above whatever the section shows.
 */
export function SectionHead({ id, title, lede, cta, tone = "light", className }: { id: string; title: string; lede?: string; cta?: Cta; tone?: Tone; className?: string }) {
  const dark = tone === "dark";
  return (
    <div className={cn("grid items-end gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,1fr)_auto]", className)}>
      <div className="flex min-w-0 flex-col gap-4">
        <RiseText id={id} text={title} className={cn(DISPLAY, dark ? "text-white" : "text-ml-ink")} />
        {lede ? <p className={cn(LEDE, dark ? "text-white/80" : "text-ml-ink/80")}>{lede}</p> : null}
      </div>
      {cta ? <NextPage cta={cta} tone={tone} className="justify-self-start lg:mb-1" /> : null}
    </div>
  );
}
