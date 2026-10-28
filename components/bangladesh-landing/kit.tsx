/*
 * The Bangladesh kit, shared by the landing page (/bangladesh) and its five
 * chapters, in the main landing page's dress: a pitch-black ground, solid
 * navy, ink and cobalt cards with a faint white ring, Sora titles in gold,
 * Inter body in white tiers (white, white/80, white/65) and the site's own
 * buttons. No hooks, so server and client components can both use it.
 */
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { chapterById, type ChapterId, type Fact } from "@/data/bangladesh";
import { cn } from "@/lib/utils";

/** The page column: the site header's grid width and gutters. */
export const COLUMN = "mx-auto w-full max-w-384 px-gutter-x";

/** A section title: the home page's heading, gold on black (28px on a phone, 30px from sm, 36px from lg). */
export const TITLE =
  "font-grotesk text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance text-signal-orange sm:text-3xl sm:leading-[1.2] lg:text-4xl";

/** An underlined link inside small print, white so it holds on every card colour; gold when pointed at. */
export const LINK =
  "rounded-sm underline decoration-white/40 underline-offset-4 transition-colors hover:text-signal-orange hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

/**
 * A section's heading: the gold title, an optional lede under it and an
 * optional action level with the title from lg (usually a ChapterLink).
 */
export function SectionHeading({ id, title, lede, action }: { id: string; title: ReactNode; lede?: ReactNode; action?: ReactNode }) {
  return (
    <div className="story-reveal mb-8 grid gap-x-12 gap-y-5 sm:mb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="flex flex-col gap-3">
        <h2 id={id} className={TITLE}>
          {title}
        </h2>
        {lede ? <p className="max-w-3xl text-base leading-relaxed text-white/80">{lede}</p> : null}
      </div>
      {action ? <div className="lg:pt-0.5">{action}</div> : null}
    </div>
  );
}

/**
 * A section of the landing page or of a chapter: the page column, one seam
 * of rhythm above and below, its heading, and a landing spot clear of the
 * fixed header when an anchor (#national-index) points at it.
 */
export function Section({
  id,
  title,
  lede,
  action,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(COLUMN, "section-band scroll-mt-header lg:scroll-mt-header-lg", className)}>
      <SectionHeading id={`${id}-title`} title={title} lede={lede} action={action} />
      {children}
    </section>
  );
}

/** "Explore the chapter": the kit's gold outline on navy (it stands on black), with the chapter's name for screen readers. */
export function ChapterLink({ chapter, className }: { chapter: ChapterId; className?: string }) {
  const c = chapterById(chapter);
  return (
    <Link href={c.href} className={cn(btn.goldOutline, "group shrink-0 bg-bdnavy-900", className)}>
      Explore the chapter<span className="sr-only">: {c.title}</span>
      <Icon name="arrow_forward" className="text-lg transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}

export type Surface = "navy" | "ink" | "cobalt";

/* Each card colour and the soft shadow it lifts on. On cobalt keep body text white/80 and gold text large or bold. */
const SURFACE: Record<Surface, { fill: string; glow: string }> = {
  navy: { fill: "bg-bdnavy-900", glow: "var(--color-bdnavy-400)" },
  ink: { fill: "bg-text-primary", glow: "var(--color-bdnavy-400)" },
  cobalt: { fill: "bg-cobalt", glow: "var(--color-cobalt)" },
};

const LIFT =
  "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-22px_var(--glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/**
 * A solid card on the black ground: navy, ink or cobalt, the faint ring
 * that holds its edge, and the landing page's lift on hover. With `href`
 * the whole card is the link.
 */
export function Card({ surface = "navy", href, className, children }: { surface?: Surface; href?: string; className?: string; children: ReactNode }) {
  const style = { "--glow": SURFACE[surface].glow } as CSSProperties;
  const look = cn("block rounded-3xl p-6 text-white ring-1 ring-white/12 sm:p-8", SURFACE[surface].fill, LIFT, className);
  return href ? (
    <Link href={href} style={style} className={cn(look, "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none")}>
      {children}
    </Link>
  ) : (
    <div style={style} className={look}>
      {children}
    </div>
  );
}

/** One sourced fact: the figure in gold over its name, a line of context, then the source. */
export function FactCard({ fact, surface }: { fact: Fact; surface?: Surface }) {
  return (
    <Card surface={surface} className="flex h-full flex-col">
      <h3 className="font-grotesk text-lg font-bold text-white">{fact.label}</h3>
      <p className="order-first mb-2 font-grotesk text-3xl font-bold tracking-tight text-signal-orange tabular-nums lg:text-4xl">{fact.value}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{fact.detail}</p>
      <p className="mt-auto pt-5 text-xs text-white/80">
        Source:{" "}
        <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
          {fact.source}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </Card>
  );
}
