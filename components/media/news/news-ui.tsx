import Image from "next/image";
import {
  ArrowUpRight, Clapperboard, Cpu, Flag, Globe2, HeartPulse, Landmark, MessageSquareQuote, MoonStar, Scale, Sun, Sunrise, Sunset, TrendingUp, Trophy, Video, type LucideIcon,
} from "lucide-react";
import { sourceName } from "@/data/media/news-sources";
import { CATEGORIES, type Edition, type NewsCategory, type NewsItem } from "@/lib/media/news";
import { cn } from "@/lib/utils";
import { Ago } from "../ui/numerals";

export const CATEGORY_ICON: Record<NewsCategory, LucideIcon> = {
  national: Flag,
  politics: Landmark,
  crime: Scale,
  economy: TrendingUp,
  world: Globe2,
  sports: Trophy,
  entertainment: Clapperboard,
  tech: Cpu,
  life: HeartPulse,
  media: Video,
  opinion: MessageSquareQuote,
};

export const EDITION_ICON: Record<Edition, LucideIcon> = { morning: Sunrise, noon: Sun, evening: Sunset, night: MoonStar };

/** The story's own link, out to the publisher in a new tab. */
export function Out({ item, className, children }: { item: NewsItem; className?: string; children: React.ReactNode }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> — {sourceName(item.source)}-এ পুরো খবর, নতুন ট্যাবে খোলে</span>
    </a>
  );
}

/** Source and time, quiet. */
export function Byline({ item, light }: { item: NewsItem; light?: boolean }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs font-semibold", light ? "text-text-primary/70" : "text-white/55")}>
      <span className={light ? "text-text-primary" : "text-signal-orange"}>{sourceName(item.source)}</span>
      <span aria-hidden>·</span>
      <Ago iso={item.at} live />
    </p>
  );
}

export function CategoryChip({ category, tone = "dark" }: { category: NewsCategory; tone?: "dark" | "gold" | "ink" }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", tone === "gold" ? "bg-signal-orange text-text-primary" : tone === "ink" ? "bg-text-primary text-signal-orange" : "bg-white/10 text-white/85")}>
      <Icon className="size-3" aria-hidden /> {CATEGORIES[category].bn}
    </span>
  );
}

function Photo({ item, sizes, className }: { item: NewsItem; sizes: string; className?: string }) {
  if (!item.image) return null;
  return (
    <span className={cn("relative block overflow-hidden bg-white/5", className)}>
      <Image src={item.image} alt="" fill unoptimized referrerPolicy="no-referrer" sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />
    </span>
  );
}

/** The edition's top story: the biggest type on the page, its photo beside it. */
export function LeadStory({ item }: { item: NewsItem }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-signal-orange text-text-primary shadow-[0_30px_70px_-40px_var(--color-signal-orange)]">
      <Out item={item} className="grid h-full md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <span className="flex flex-col gap-3 p-5 sm:p-7">
          <span className="flex flex-wrap items-center gap-2">
            <CategoryChip category={item.category} tone="ink" />
            <span className="text-xs font-bold">প্রধান খবর</span>
          </span>
          <span lang={item.lang} className="text-2xl leading-snug font-bold text-balance sm:text-[2rem] sm:leading-tight">{item.title}</span>
          {item.summary && <span lang={item.lang} className="text-[15px] leading-relaxed font-medium text-text-primary/85">{item.summary}</span>}
          <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <Byline item={item} light />
            <span className="inline-flex items-center gap-1 text-sm font-bold">পুরো খবর <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden /></span>
          </span>
        </span>
        {item.image ? <Photo item={item} sizes="(min-width: 768px) 480px, 100vw" className="aspect-16/10 md:aspect-auto md:min-h-full" /> : null}
      </Out>
    </article>
  );
}

/** A headline in the front-page column: thumbnail, title, byline. */
export function HeadlineRow({ item, n }: { item: NewsItem; n: number }) {
  return (
    <li>
      <Out item={item} className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-white/6">
        {item.image ? (
          <Photo item={item} sizes="96px" className="size-20 shrink-0 rounded-xl sm:size-24" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-bd-green text-2xl font-bold text-signal-orange sm:size-24" aria-hidden>{n}</span>
        )}
        <span className="min-w-0 space-y-1">
          <CategoryChip category={item.category} />
          <span lang={item.lang} className="line-clamp-3 block leading-snug font-bold text-white group-hover:text-signal-orange">{item.title}</span>
          <Byline item={item} />
        </span>
      </Out>
    </li>
  );
}

/** A short-news line: number, headline, source and time — the "এক নজরে" list. */
export function BriefRow({ item, n }: { item: NewsItem; n: React.ReactNode }) {
  return (
    <li className="border-b border-white/8 last:border-0">
      <Out item={item} className="group flex items-start gap-3 py-3">
        <span className="w-7 shrink-0 pt-0.5 text-right text-lg leading-none font-bold text-signal-orange tabular-nums">{n}</span>
        <span className="min-w-0 flex-1">
          <span lang={item.lang} className="block leading-snug font-semibold text-white group-hover:text-signal-orange group-hover:underline group-hover:decoration-signal-orange/50">{item.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <Byline item={item} />
            <span className="text-[11px] text-white/45">{CATEGORIES[item.category].bn}</span>
          </span>
        </span>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-white/30 transition-colors group-hover:text-signal-orange" aria-hidden />
      </Out>
    </li>
  );
}

/** A story card for the category sections: title, summary, byline. */
export function StoryCard({ item }: { item: NewsItem }) {
  return (
    <li className="story-reveal">
      <Out item={item} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/10 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-26px_var(--color-signal-orange)] hover:ring-white/25 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        {item.image && <Photo item={item} sizes="(min-width: 1024px) 320px, 50vw" className="aspect-16/9" />}
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span lang={item.lang} className="line-clamp-3 leading-snug font-bold text-white group-hover:text-signal-orange">{item.title}</span>
          {item.summary && <span lang={item.lang} className="line-clamp-3 text-sm leading-relaxed text-white/70">{item.summary}</span>}
          <span className="mt-auto flex items-center justify-between gap-2 pt-1">
            <Byline item={item} />
            <ArrowUpRight className="size-4 shrink-0 text-white/35 transition-colors group-hover:text-signal-orange" aria-hidden />
          </span>
        </span>
      </Out>
    </li>
  );
}

/** Entertainment: image-led cards in one swipeable row. */
export function ShowRow({ items }: { items: NewsItem[] }) {
  return (
    <ul className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scrollbar-gold sm:mx-0 sm:px-0">
      {items.map((item) => (
        <li key={item.id} className="w-[72%] shrink-0 snap-start sm:w-64">
          <Out item={item} className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl bg-bd-green p-4 ring-1 ring-white/12">
            {item.image && (
              <>
                <Image src={item.image} alt="" fill unoptimized referrerPolicy="no-referrer" sizes="256px" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
                <span className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" aria-hidden />
              </>
            )}
            {!item.image && <Clapperboard className="absolute top-4 right-4 size-16 text-white/10" aria-hidden />}
            <span lang={item.lang} className="relative line-clamp-4 text-lg leading-snug font-bold text-white">{item.title}</span>
            <span className="relative mt-2"><Byline item={item} /></span>
          </Out>
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ id, Icon, title, hint, action }: { id: string; Icon: LucideIcon; title: string; hint?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-signal-orange pb-2">
      <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
        <Icon className="size-5 text-signal-orange" aria-hidden /> {title}
        {hint && <span className="text-sm font-medium text-white/55">{hint}</span>}
      </h2>
      {action}
    </div>
  );
}

export function chipLink(on: boolean) {
  return cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold whitespace-nowrap transition-colors", on ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/80 ring-1 ring-white/12 hover:bg-white/12 hover:text-white");
}
