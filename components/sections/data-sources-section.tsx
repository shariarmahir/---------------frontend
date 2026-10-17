import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-kit";
import { dataSources, type DataSource } from "@/data/data-sources";
import { cn } from "@/lib/utils";

/**
 * The public sources behind the site's figures, one solid card each: the
 * source's mark (a symbol, not its logo) and name set large, what the site
 * takes from it, and a link out. One full-width row that drifts left on
 * its own, the list running twice so the loop has no seam; it holds under
 * the pointer or keyboard focus. Reduced motion: no drift, the row scrolls
 * by hand. Fields run navy, gold, ink, so no card touches its own colour,
 * round the loop too (see `fieldOf`).
 */
const FIELDS = [
  {
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    accent: "text-signal-orange",
    muted: "text-white/65",
    chip: "bg-white/8 ring-white/15",
    glow: "var(--color-bdnavy-400)",
  },
  {
    card: "bg-signal-orange text-text-primary",
    accent: "text-bdnavy-900",
    muted: "text-text-primary/70",
    chip: "bg-text-primary/8 ring-text-primary/20",
    glow: "var(--color-signal-orange)",
  },
  {
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    accent: "text-signal-orange",
    muted: "text-white/65",
    chip: "bg-white/8 ring-white/15",
    glow: "var(--color-signal-orange)",
  },
];

type Field = (typeof FIELDS)[number];

/**
 * navy, gold, ink in turn. When the count leaves one over (n mod 3 = 1) the
 * last card would be navy beside the first navy across the loop's seam, so
 * it takes gold instead (its other neighbour is ink).
 */
const fieldOf = (i: number, n: number) => FIELDS[i === n - 1 && n % 3 === 1 ? 1 : i % 3];

export function DataSourcesSection() {
  const n = dataSources.length;
  return (
    <section id="data-sources" className="section-band">
      <div className="mx-auto max-w-7xl px-gutter-x">
        <SectionHeading
          tone="dark"
          title="Our Data Sources"
          lead="Every figure on this site comes from a public source we cite. These are the ones we rely on."
        />
      </div>

      {/* py: room for the hover lift and its glow inside the clipped row. */}
      <div className="story-reveal overflow-hidden py-4 motion-reduce:overflow-x-auto">
        <ul className="ds-drift flex w-max">
          {[...dataSources, ...dataSources].map((source, i) => {
            const copy = i >= n;
            return (
              // Spacing is padding, not gap, so the doubled row is exactly twice one set.
              <li key={`${source.id}${copy ? "-copy" : ""}`} aria-hidden={copy || undefined} className="flex w-64 shrink-0 pl-4 sm:w-72">
                <SourceCard source={source} field={fieldOf(i % n, n)} copy={copy} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** One source. `copy`: the loop's second run, kept out of the tab order. */
function SourceCard({ source, field, copy }: { source: DataSource; field: Field; copy: boolean }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={copy ? -1 : undefined}
      style={{ "--glow": field.glow } as CSSProperties}
      className={cn(
        "group flex w-full flex-col rounded-3xl p-5 sm:p-6",
        "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-22px_var(--glow)]",
        "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        field.card,
      )}
    >
      <span className="flex items-start justify-between gap-3">
        {/* `!`: Google's icon stylesheet pins every symbol at 24px and outranks the utilities. */}
        <Icon
          name={source.icon}
          className={cn(
            "text-[44px]! transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 motion-reduce:transition-none sm:text-[52px]!",
            field.accent,
          )}
        />
        <Icon
          name="arrow_outward"
          className={cn(
            "text-[20px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none",
            field.muted,
          )}
        />
      </span>

      <span className="mt-6 font-grotesk text-xl leading-tight font-bold text-balance sm:text-2xl">{source.name}</span>
      {source.fullName && <span className={cn("mt-1 text-xs leading-snug", field.muted)}>{source.fullName}</span>}
      <span className="mt-3 text-sm leading-snug">{source.use}</span>

      {/* The tag sits on the card's foot, so the row of cards lines up. */}
      <span className="mt-auto pt-5">
        <span className={cn("inline-block rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.12em] uppercase ring-1", field.chip)}>
          {source.tag}
        </span>
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
