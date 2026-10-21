import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HEAD, Kicker, MoreButton, SectionHead, StoryList, StoryRow, StoryText, StoryTile, Thumb } from "@/components/media/news/paper/story";
import type { NewsItem } from "@/lib/media/news";
import { newsHref, type NewsSection, type NewsSub } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

/*
 * The blocks of a section's page and its sub-sections' pages in নাগরিক জীবন,
 * after The Daily Star's /news: the section's name, a lead pair of wide
 * photos, a strip of five, then one block per sub-section in turning
 * layouts, and a closing band of the quieter sub-sections. Every story is
 * drawn from the feeds; a block takes only stories the page hasn't shown.
 */

const headline = "font-grotesk font-bold tracking-[-0.01em] text-balance text-white transition-colors duration-200 group-hover:text-signal-orange";
const focusRing = "rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none";

/* ---------- Picking stories ---------- */

/** Stories with a photo first (in their order), then the rest: leads and strips want pictures. */
export function photoFirst(items: NewsItem[]): NewsItem[] {
  return [...items.filter((n) => n.image), ...items.filter((n) => !n.image)];
}

/** Up to `n` stories the page hasn't shown yet; they are marked as shown. */
export function takeFresh(items: NewsItem[], used: Set<string>, n: number): NewsItem[] {
  const out: NewsItem[] = [];
  for (const it of items) {
    if (out.length >= n) break;
    if (used.has(it.id)) continue;
    used.add(it.id);
    out.push(it);
  }
  return out;
}

/* ---------- Titles ---------- */

/** The page's own title: the section's (or sub-section's) name, large and gold, over a double hairline. */
export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-b-[3px] border-double border-white/15 pb-4", className)}>
      <h1 className="font-grotesk text-4xl leading-tight font-bold tracking-tight text-signal-orange sm:text-5xl">{children}</h1>
    </div>
  );
}

/** Section › sub-section, gold links. */
export function Breadcrumb({ section, sub }: { section: NewsSection; sub: NewsSub }) {
  return (
    <nav aria-label="অবস্থান" className="mb-2">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm font-bold">
        <li>
          <Link href={newsHref.home} className={cn("inline-flex min-h-11 items-center text-signal-orange hover:text-white", focusRing)}>
            নাগরিক জীবন
          </Link>
        </li>
        <li aria-hidden className="text-white/40">
          <ChevronRight className="size-4" />
        </li>
        <li>
          <Link href={newsHref.section(section.slug)} className={cn("inline-flex min-h-11 items-center text-signal-orange hover:text-white", focusRing)}>
            {section.bn}
          </Link>
        </li>
        <li aria-hidden className="text-white/40">
          <ChevronRight className="size-4" />
        </li>
        <li aria-current="page" className="inline-flex min-h-11 items-center text-white/75">
          {sub.bn}
        </li>
      </ol>
    </nav>
  );
}

/* ---------- Lead pair and strip ---------- */

/**
 * A wide photo with the headline on a solid navy band across its foot: the
 * section page's lead pair. Solid, never a fade (the palette has no gradients).
 */
export function StoryOverlay({ item, priority }: { item: NewsItem; priority?: boolean }) {
  return (
    <article>
      <Link href={newsHref.story(item.id)} className={cn("group relative block overflow-hidden", focusRing)}>
        <Thumb item={item} ratio="aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/9]" sizes="(min-width: 1024px) 700px, (min-width: 768px) 50vw, 100vw" priority={priority} />
        <span className="absolute inset-x-0 bottom-0 block bg-bdnavy-900 px-4 py-3.5 ring-1 ring-white/12 ring-inset sm:px-5 sm:py-4">
          <span lang={item.lang} className={cn("line-clamp-3", headline, HEAD.lg)}>
            {item.title}
          </span>
        </span>
      </Link>
      <Kicker item={item} source className="mt-2.5" />
    </article>
  );
}

/** A row of tiles: a snap carousel on phones (and the strip on tablets), a grid from `grid`. */
export function TileRow({ items, cols, tablet = "grid", size = "sm", summary }: { items: NewsItem[]; cols: 4 | 5; tablet?: "grid" | "carousel"; size?: keyof typeof HEAD; summary?: boolean }) {
  if (items.length === 0) return null;
  const grid = cols === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";
  return (
    <div
      className={cn(
        "no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 gap-4 overflow-x-auto px-3 lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0",
        tablet === "grid" && "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0",
        grid,
      )}
    >
      {items.map((n) => (
        <div key={n.id} className={cn("w-[78%] shrink-0 snap-start lg:w-auto", tablet === "grid" ? "sm:w-auto" : "sm:w-[38%]")}>
          <StoryTile item={n} size={size} summary={summary} sizes="(min-width: 1024px) 280px, 80vw" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Sub-section blocks ---------- */

export type BlockKind = "focus" | "row" | "columns";

/** How many stories each block wants. */
export const BLOCK_SIZE: Record<BlockKind, number> = { focus: 5, row: 4, columns: 5 };

/** (a) A big tile with its summary at left, four rows at right. */
function FocusBlock({ items }: { items: NewsItem[] }) {
  const [lead, ...rest] = items;
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
      <StoryTile item={lead} size="lg" summary ratio="aspect-[16/9]" sizes="(min-width: 1024px) 760px, 100vw" />
      {rest.length > 0 ? (
        <StoryList className="lg:border-l lg:border-white/10 lg:pl-10">
          {rest.map((n) => (
            <StoryRow key={n.id} item={n} />
          ))}
        </StoryList>
      ) : null}
    </div>
  );
}

/** (c) A column of headlines with their summaries, beside a column of photos. */
function ColumnsBlock({ items }: { items: NewsItem[] }) {
  const photos = items.slice(0, 2);
  const texts = items.slice(2);
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
      {texts.length > 0 ? (
        <StoryList className="order-2 lg:order-1 lg:border-r lg:border-white/10 lg:pr-10">
          {texts.map((n) => (
            <StoryText key={n.id} item={n} size="md" />
          ))}
        </StoryList>
      ) : null}
      <div className={cn("order-1 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:order-2 lg:gap-10", texts.length > 0 ? "lg:col-span-2" : "lg:col-span-3")}>
        {photos.map((n) => (
          <StoryTile key={n.id} item={n} size="md" summary sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw" />
        ))}
      </div>
    </div>
  );
}

/** One sub-section's block on its section's page, under a title that leads to the sub-section. */
export function SubBlock({ section, sub, items, kind }: { section: NewsSection; sub: NewsSub; items: NewsItem[]; kind: BlockKind }) {
  const id = `sub-${sub.slug}`;
  return (
    <section aria-labelledby={id} className="mt-14 lg:mt-16">
      <SectionHead id={id} title={sub.bn} href={newsHref.sub(section.slug, sub.slug)} more={`সব ${sub.bn}`} className="mb-6" />
      {kind === "focus" ? <FocusBlock items={items} /> : kind === "row" ? <TileRow items={items} cols={4} size="md" summary /> : <ColumnsBlock items={items} />}
    </section>
  );
}

/** The closing band: the quieter sub-sections side by side, each one tile, three rows and the way onward. */
export function SubBand({ section, entries }: { section: NewsSection; entries: [NewsSub, NewsItem[]][] }) {
  if (entries.length === 0) return null;
  return (
    <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
      {entries.map(([sub, items]) => {
        const [lead, ...rest] = items;
        const id = `band-${sub.slug}`;
        return (
          <section key={sub.slug} aria-labelledby={id} className="flex flex-col">
            <h2 id={id} className="mb-5 border-t border-white/12 pt-4 font-grotesk text-2xl leading-tight font-bold tracking-tight text-signal-orange">
              <Link href={newsHref.sub(section.slug, sub.slug)} className={cn("transition-colors hover:text-white", focusRing)}>
                {sub.bn}
              </Link>
            </h2>
            <StoryTile item={lead} size="md" sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" />
            {rest.length > 0 ? (
              <StoryList className="mt-4 border-t border-white/10 pt-4">
                {rest.map((n) => (
                  <StoryRow key={n.id} item={n} />
                ))}
              </StoryList>
            ) : null}
            <div className="mt-auto pt-6">
              <MoreButton href={newsHref.sub(section.slug, sub.slug)}>আরও {sub.bn}</MoreButton>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** A plain grid of headlines with their photos (the section's leftovers, the other news under an empty desk). */
export function TileGrid({ items, summary }: { items: NewsItem[]; summary?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((n) => (
        <StoryTile key={n.id} item={n} size="sm" summary={summary} sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw" />
      ))}
    </div>
  );
}

/** The sub-section page's right rail: the newest from the section's other sub-sections. */
export function Rail({ title, href, items }: { title: string; href?: string; items: NewsItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside aria-labelledby="rail-title">
      <SectionHead id="rail-title" title={title} href={href} more="সব" className="mb-5 [&_h2]:text-xl sm:[&_h2]:text-2xl" />
      <StoryList>
        {items.map((n) => (
          <StoryRow key={n.id} item={n} />
        ))}
      </StoryList>
    </aside>
  );
}
