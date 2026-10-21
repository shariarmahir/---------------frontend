import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_ICON } from "@/components/media/news/news-ui";
import { Ago } from "@/components/media/ui/numerals";
import { btn } from "@/components/ui/section-kit";
import { sourceName } from "@/data/media/news-sources";
import type { NewsItem } from "@/lib/media/news";
import { newsHref, placeStory } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

/*
 * The newspaper's story blocks (নাগরিক জীবন, after The Daily Star's
 * layout, in the landing page's colours and type). Every block links to the
 * story's own page in the paper (story/[id]); only that page links out to
 * the publisher. Headlines are white and turn gold when pointed at; the
 * kicker under each (time · sub-section) is quiet, the sub-section gold.
 *
 * Feeds don't always carry a photo. A story without one gets a solid plate
 * in one of the landing fields (navy, cobalt, ink, picked by its id so it
 * never changes), with its category's symbol and the publisher's name: a
 * marker, never a stand-in photograph.
 */

const PLATES = ["bg-bdnavy-900", "bg-cobalt", "bg-text-primary"] as const;

function plateOf(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PLATES[Math.abs(h) % PLATES.length];
}

/** Headline sizes, one step per block. Bangla needs a looser line than Latin. */
export const HEAD = {
  xl: "text-2xl leading-snug sm:text-[2rem] sm:leading-[1.2] lg:text-[2.25rem]",
  lg: "text-xl leading-snug sm:text-2xl",
  md: "text-lg leading-snug",
  sm: "text-base leading-snug",
} as const;

const headline = "font-grotesk font-bold tracking-[-0.01em] text-balance text-white transition-colors duration-200 group-hover:text-signal-orange";

/** The story's photo, or its plate. `ratio` is a Tailwind aspect class. */
export function Thumb({ item, ratio = "aspect-[4/3]", sizes, className, priority }: { item: NewsItem; ratio?: string; sizes: string; className?: string; priority?: boolean }) {
  const Icon = CATEGORY_ICON[item.category];
  return (
    <span className={cn("relative block overflow-hidden", ratio, item.image ? "bg-white/5" : plateOf(item.id), className)}>
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          fill
          unoptimized
          priority={priority}
          referrerPolicy="no-referrer"
          sizes={sizes}
          className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      ) : (
        <span aria-hidden className="absolute inset-0 flex flex-col items-start justify-between p-[8%] ring-1 ring-white/10 ring-inset">
          <Icon className="size-[clamp(1.25rem,22%,3rem)] text-signal-orange" strokeWidth={1.75} />
          <span className="line-clamp-1 font-grotesk text-xs font-bold text-white/70">{sourceName(item.source)}</span>
        </span>
      )}
    </span>
  );
}

/** Time and where the story is filed: "২ ঘণ্টা আগে · আইন ও বিচার". */
export function Kicker({ item, source, className }: { item: NewsItem; source?: boolean; className?: string }) {
  const { section, sub } = placeStory(item);
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-semibold text-white/55", className)}>
      <Ago iso={item.at} live />
      <span aria-hidden>·</span>
      <span className="text-signal-orange">{(sub ?? section).bn}</span>
      {source ? (
        <>
          <span aria-hidden>·</span>
          <span>{sourceName(item.source)}</span>
        </>
      ) : null}
    </p>
  );
}

/** The block's link: the whole block is the target, the focus ring drawn on it. */
function StoryLink({ item, className, children }: { item: NewsItem; className?: string; children: React.ReactNode }) {
  return (
    <Link href={newsHref.story(item.id)} className={cn("group block rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none", className)}>
      {children}
    </Link>
  );
}

/** The front page's lead: a wide photo, the biggest headline under it, the summary, the kicker. */
export function LeadStory({ item, priority }: { item: NewsItem; priority?: boolean }) {
  return (
    <article>
      <StoryLink item={item}>
        <Thumb item={item} ratio="aspect-[16/9]" sizes="(min-width: 1024px) 720px, 100vw" priority={priority} />
        <h2 lang={item.lang} className={cn("mt-4", headline, HEAD.xl)}>{item.title}</h2>
      </StoryLink>
      <Kicker item={item} source className="mt-2.5" />
      {item.summary ? <p lang={item.lang} className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-white/75">{item.summary}</p> : null}
    </article>
  );
}

/** A photo on top, the headline under it; the summary when asked. */
export function StoryTile({ item, size = "md", summary, ratio = "aspect-[16/10]", sizes = "(min-width: 1024px) 320px, 50vw" }: { item: NewsItem; size?: keyof typeof HEAD; summary?: boolean; ratio?: string; sizes?: string }) {
  return (
    <article>
      <StoryLink item={item}>
        <Thumb item={item} ratio={ratio} sizes={sizes} />
        <h3 lang={item.lang} className={cn("mt-3", headline, HEAD[size])}>{item.title}</h3>
      </StoryLink>
      <Kicker item={item} className="mt-2" />
      {summary && item.summary ? <p lang={item.lang} className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">{item.summary}</p> : null}
    </article>
  );
}

/** A small photo at the left, the headline and kicker beside it: the lists down the columns. */
export function StoryRow({ item, size = "sm" }: { item: NewsItem; size?: keyof typeof HEAD }) {
  return (
    <article className="flex gap-3.5">
      <StoryLink item={item} className="w-28 shrink-0 sm:w-32">
        <Thumb item={item} sizes="128px" />
      </StoryLink>
      <div className="min-w-0">
        <StoryLink item={item}>
          <h3 lang={item.lang} className={cn(headline, HEAD[size])}>{item.title}</h3>
        </StoryLink>
        <Kicker item={item} className="mt-1.5" />
      </div>
    </article>
  );
}

/** Headline, summary, kicker: no photo. */
export function StoryText({ item, size = "md", summary = true }: { item: NewsItem; size?: keyof typeof HEAD; summary?: boolean }) {
  return (
    <article>
      <StoryLink item={item}>
        <h3 lang={item.lang} className={cn(headline, HEAD[size])}>{item.title}</h3>
      </StoryLink>
      <Kicker item={item} className="mt-1.5" />
      {summary && item.summary ? <p lang={item.lang} className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">{item.summary}</p> : null}
    </article>
  );
}

/**
 * A tall photo with the headline on a solid navy band across its foot (the
 * feature row). Solid, not a fade: the palette has no gradients.
 */
export function StoryFeature({ item }: { item: NewsItem }) {
  return (
    <article>
      <StoryLink item={item} className="relative overflow-hidden rounded-2xl">
        <Thumb item={item} ratio="aspect-[4/5]" sizes="(min-width: 1024px) 340px, 50vw" />
        <span className="absolute inset-x-0 bottom-0 block bg-bdnavy-900 p-4 ring-1 ring-white/12 ring-inset">
          <span lang={item.lang} className={cn("line-clamp-3", headline, HEAD.md)}>{item.title}</span>
        </span>
      </StoryLink>
      <Kicker item={item} className="mt-2.5" />
    </article>
  );
}

/** A ranked headline: a big gold numeral, the headline beside it. */
export function StoryNumbered({ item, n }: { item: NewsItem; n: React.ReactNode }) {
  return (
    <article className="flex items-start gap-4">
      <span aria-hidden className="w-8 shrink-0 font-grotesk text-3xl leading-none font-extrabold text-signal-orange">{n}</span>
      <div className="min-w-0">
        <StoryLink item={item}>
          <h3 lang={item.lang} className={cn(headline, HEAD.sm)}>{item.title}</h3>
        </StoryLink>
        <Kicker item={item} className="mt-1.5" />
      </div>
    </article>
  );
}

/** A section's title on the page: gold, with the way to the whole section at the right. */
export function SectionHead({ title, href, more = "আরও", id, as: As = "h2", className }: { title: string; href?: string; more?: string; id?: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-t border-white/12 pt-4", className)}>
      <As id={id} className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-signal-orange sm:text-[1.75rem]">
        {href ? (
          <Link href={href} className="rounded-sm transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
            {title}
          </Link>
        ) : (
          title
        )}
      </As>
      {href ? (
        <Link href={href} className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md text-sm font-bold text-white/75 transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
          {more}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

/** The full-width way onward under a block ("আরও শিক্ষা"): the kit's gold outline on navy. */
export function MoreButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(btn.goldOutline, "w-full bg-bdnavy-900")}>
      {children}
    </Link>
  );
}

/** A thin rule between stories in a column. */
export function StoryList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-white/10 [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0", className)}>{children}</div>;
}

/** Said plainly when a section or search has nothing yet; never filled with made-up stories. */
export function EmptyDesk({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-bdnavy-900 p-8 text-center ring-1 ring-white/12">
      <p className="font-grotesk text-lg font-bold text-white">{title}</p>
      {children ? <div className="mt-2 text-sm leading-relaxed text-white/70">{children}</div> : null}
    </div>
  );
}
