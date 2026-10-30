import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { EDITION_ICON } from "@/components/media/news/news-ui";
import { Ago, DateText, Num } from "@/components/media/ui/numerals";
import { btn } from "@/components/ui/section-kit";
import { sourceName } from "@/data/media/news-sources";
import { EDITIONS, headlines, type Edition, type NewsItem } from "@/lib/media/news";
import { NEWS_SECTIONS, newsHref, placeStory, storiesIn, type NewsSection } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";
import { HEAD, SectionHead, StoryList, StoryNumbered, StoryRow, StoryTile, Thumb } from "./story";
import { ShareBar } from "./share-bar";

/*
 * The paper's inner pages (নাগরিক জীবন, after The Daily Star): the story
 * page, and the pieces today's news, the e-paper and search share. The
 * story page shows only what the feed gave us (headline, summary, photo)
 * and says so; its single way out is the publisher's own page.
 */

const focusRing = "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none";

/* ---------- Picking the story page's company ---------- */

export interface StoryCompany {
  /** Right rail: the same sub-section first, then the section. */
  related: NewsItem[];
  /** Under the article: more of the section, photos first. */
  more: NewsItem[];
  /** Left rail: headlines from the other sections. */
  picks: NewsItem[];
}

/** The stories around one story, none of them shown twice. */
export function storyCompany(item: NewsItem, items: NewsItem[]): StoryCompany {
  const { section, sub } = placeStory(item);
  const others = items.filter((n) => n.id !== item.id);
  const sameSub = sub ? storiesIn(others, section, sub) : [];
  // The section's own stories first (filed here by placeStory), then those it only shares.
  const inSection = storiesIn(others, section);
  const sameSection = [...inSection.filter((n) => placeStory(n).section === section), ...inSection.filter((n) => placeStory(n).section !== section)];
  const related = [...new Set([...sameSub, ...sameSection])].slice(0, 6);
  const used = new Set([item.id, ...related.map((n) => n.id)]);
  const rest = sameSection.filter((n) => !used.has(n.id));
  const more = [...rest.filter((n) => n.image), ...rest.filter((n) => !n.image)].slice(0, 3);
  more.forEach((n) => used.add(n.id));
  const picks = headlines(
    others.filter((n) => !used.has(n.id) && placeStory(n).section.slug !== section.slug),
    5,
  );
  return { related, more, picks };
}

/* ---------- The story page ---------- */

function RailHead({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="border-t-2 border-signal-orange pt-3 pb-5 font-grotesk text-xl leading-tight font-bold text-signal-orange">
      {children}
    </h2>
  );
}

export function StoryDetail({ item, company }: { item: NewsItem; company: StoryCompany }) {
  const { section, sub } = placeStory(item);
  const publisher = sourceName(item.source);
  const { related, more, picks } = company;

  return (
    <div className="mx-auto grid max-w-[84rem] grid-cols-1 items-start gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[14rem_minmax(0,1fr)_18rem] 2xl:grid-cols-[16rem_minmax(0,1fr)_20rem] 2xl:gap-x-12">
      <article className="mx-auto w-full max-w-[46rem] min-w-0 lg:col-start-1 lg:row-start-1 xl:col-start-2">
        {/* Where it's filed: section › sub-section. */}
        <nav aria-label="খবরের অবস্থান">
          <ol className="flex flex-wrap items-center gap-x-1 text-sm font-bold">
            <li>
              <Link href={newsHref.section(section.slug)} className={cn("inline-flex min-h-11 items-center rounded-sm font-grotesk text-signal-orange transition-colors hover:text-white", focusRing)}>
                {section.bn}
              </Link>
            </li>
            {sub ? (
              <>
                <li aria-hidden>
                  <ChevronRight className="size-4 text-white/40" />
                </li>
                <li>
                  <Link href={newsHref.sub(section.slug, sub.slug)} className={cn("inline-flex min-h-11 items-center rounded-sm font-grotesk text-signal-orange transition-colors hover:text-white", focusRing)}>
                    {sub.bn}
                  </Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        <h1 lang={item.lang} className="mt-2 font-grotesk text-[1.75rem] leading-[1.3] font-bold tracking-[-0.01em] text-balance text-white sm:text-4xl sm:leading-[1.22] xl:text-[2.6rem]">
          {item.title}
        </h1>

        {/* Who, when, and the way to pass it on. */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-y border-white/12 py-4">
          <div className="min-w-0 text-sm">
            <p className="font-grotesk font-bold text-white">{publisher}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-white/60">
              <Ago iso={item.at} live />
              <span aria-hidden>·</span>
              <DateText iso={item.at} time weekday />
            </p>
          </div>
          <ShareBar url={item.url} title={item.title} />
        </div>

        {item.image ? (
          <figure className="mt-7">
            <Thumb item={item} ratio="aspect-[16/9]" sizes="(min-width: 1280px) 736px, (min-width: 1024px) 60vw, 100vw" priority />
            <figcaption className="mt-2 text-xs font-semibold text-white/55">ছবি: {publisher}</figcaption>
          </figure>
        ) : null}

        {item.summary ? (
          <p lang={item.lang} className="mt-7 text-lg leading-[1.75] text-white/85 sm:text-xl sm:leading-[1.7]">
            {item.summary}
          </p>
        ) : (
          <p className="mt-7 text-base leading-relaxed text-white/65">{publisher} এই খবরের সঙ্গে কোনো সারাংশ দেয়নি। পুরো খবর তাদের পাতায়।</p>
        )}

        {/* Whose story this is, and the one way out to it. */}
        <aside aria-label="মূল খবর" className="mt-9 rounded-2xl bg-bdnavy-900 p-6 ring-1 ring-white/12 sm:p-7">
          <p className="text-[15px] leading-relaxed text-white/85">
            এটি <span className="font-bold text-white">{publisher}</span>-এর খবরের সারাংশ। পুরো খবর, ছবি আর স্বত্ব তাদের।
          </p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={cn(btn.gold, "mt-5 w-full sm:w-auto")}>
            পুরো খবর পড়ুন {publisher}-এ
            <ExternalLink className="size-4" aria-hidden />
            <span className="sr-only">(নতুন ট্যাবে খোলে)</span>
          </a>
        </aside>

        {more.length > 0 ? (
          <section aria-labelledby="story-more" className="mt-14">
            <SectionHead id="story-more" title="এই বিভাগের আরও" href={sub ? newsHref.sub(section.slug, sub.slug) : newsHref.section(section.slug)} more={(sub ?? section).bn} />
            <div className="-mx-3 mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              {more.map((n) => (
                <div key={n.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
                  <StoryTile item={n} size="sm" sizes="(min-width: 640px) 240px, 80vw" />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {/* Right rail: related stories, held in view on wide screens. */}
      {related.length > 0 ? (
        <aside aria-labelledby="story-related" className="w-full min-w-0 lg:sticky lg:top-32 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3">
          <RailHead id="story-related">সম্পর্কিত খবর</RailHead>
          <StoryList>
            {related.map((n) => (
              <StoryRow key={n.id} item={n} />
            ))}
          </StoryList>
        </aside>
      ) : null}

      {/* Left rail: the editor's pick from the other desks. */}
      {picks.length > 0 ? (
        <aside aria-labelledby="story-picks" className="w-full min-w-0 lg:col-start-1 lg:row-start-2 xl:row-start-1">
          <RailHead id="story-picks">সম্পাদকের বাছাই</RailHead>
          <StoryList>
            {picks.map((n, i) => (
              <StoryNumbered key={n.id} item={n} n={<Num value={i + 1} />} />
            ))}
          </StoryList>
        </aside>
      ) : null}
    </div>
  );
}

/* ---------- Shared by today's news, the e-paper and search ---------- */

/** A page's own title under the masthead: gold, with a line saying what it is. */
export function PaperPageHead({ title, children, aside }: { title: string; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        <h1 className="font-grotesk text-4xl leading-tight font-extrabold tracking-tight text-signal-orange sm:text-5xl">{title}</h1>
        {children ? <div className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-white/70">{children}</div> : null}
      </div>
      {aside}
    </header>
  );
}

/** The paper's sections as pills: a way onward from search and from a missing story. */
export function SectionChips({ sections = NEWS_SECTIONS, counts, href = (s) => newsHref.section(s.slug), className }: { sections?: NewsSection[]; counts?: Record<string, number>; href?: (s: NewsSection) => string; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {sections.map((s) => (
        <li key={s.slug}>
          <Link
            href={href(s)}
            className={cn("inline-flex min-h-11 items-center gap-2 rounded-full bg-bdnavy-900 px-4 font-grotesk text-sm font-bold text-white ring-1 ring-white/12 transition-colors hover:bg-signal-orange hover:text-text-primary motion-reduce:transition-none", focusRing)}
          >
            {s.bn}
            {counts?.[s.slug] ? (
              <span className="text-xs font-semibold opacity-70">
                <Num value={counts[s.slug]} />
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Stories filed by the paper's sections (each story once, where its kicker says it is), empty sections left out. */
export function bySection(items: NewsItem[]): [NewsSection, NewsItem[]][] {
  const groups = new Map<string, NewsItem[]>();
  for (const n of items) {
    const slug = placeStory(n).section.slug;
    groups.set(slug, [...(groups.get(slug) ?? []), n]);
  }
  return NEWS_SECTIONS.filter((s) => groups.has(s.slug)).map((s) => [s, groups.get(s.slug)!]);
}

/* ---------- Today's news: the edition switcher ---------- */

export interface EditionTab {
  edition: Edition;
  href?: string;
  count: number;
  on: boolean;
  now: boolean;
}

export function EditionSwitcher({ tabs, days }: { tabs: EditionTab[]; days: { label: string; href: string; on: boolean }[] }) {
  return (
    <nav aria-label="সংস্করণ" className="space-y-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {tabs.map((t) => {
          const Icon = EDITION_ICON[t.edition];
          const ed = EDITIONS[t.edition];
          const body = (
            <>
              <Icon className={cn("size-6 shrink-0", t.on ? "text-text-primary" : "text-signal-orange")} aria-hidden />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-1.5 font-grotesk text-[15px] font-bold">
                  {ed.bn}
                  {t.now ? (
                    <span className={cn("rounded-full px-2 py-px text-xs font-bold", t.on ? "bg-text-primary text-signal-orange" : "bg-signal-orange text-text-primary")}>এখন</span>
                  ) : null}
                </span>
                <span className={cn("mt-0.5 block text-xs font-semibold", t.on ? "text-text-primary/80" : "text-white/60")}>
                  {t.href ? (
                    <>
                      <Num value={t.count} />টি খবর
                    </>
                  ) : (
                    `আসবে ${ed.span.split(" – ")[0]}`
                  )}
                </span>
              </span>
            </>
          );
          const cls = cn(
            "flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200 motion-reduce:transition-none",
            t.on ? "bg-signal-orange text-text-primary" : "bg-bdnavy-900 text-white ring-1 ring-white/12",
            t.href && !t.on && "hover:ring-signal-orange",
            !t.href && "opacity-50",
          );
          return (
            <li key={t.edition}>
              {t.href ? (
                <Link href={t.href} scroll={false} aria-current={t.on ? "page" : undefined} className={cn(cls, focusRing)}>
                  {body}
                </Link>
              ) : (
                <span aria-disabled className={cls}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <ul className="flex gap-2">
        {days.map((d) => (
          <li key={d.label}>
            <Link
              href={d.href}
              scroll={false}
              aria-current={d.on ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-5 font-grotesk text-sm font-bold transition-colors motion-reduce:transition-none",
                d.on ? "bg-signal-orange text-text-primary" : "bg-bdnavy-900 text-white ring-1 ring-white/12 hover:ring-signal-orange",
                focusRing,
              )}
            >
              {d.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- The e-paper sheet ---------- */

/** A text-only story for the e-paper's columns: headline, summary, kicker. */
export function PaperColumnStory({ item }: { item: NewsItem }) {
  const { section, sub } = placeStory(item);
  return (
    <article className="break-inside-avoid border-t border-white/12 pt-3 pb-5 print:border-black/30">
      <Link href={newsHref.story(item.id)} className={cn("group block rounded-sm", focusRing)}>
        <h3 lang={item.lang} className={cn("font-grotesk font-bold tracking-[-0.01em] text-white transition-colors group-hover:text-signal-orange", HEAD.sm)}>
          {item.title}
        </h3>
      </Link>
      {item.summary ? (
        <p lang={item.lang} className="mt-1.5 text-sm leading-relaxed text-white/70 [hyphens:auto]">
          {item.summary}
        </p>
      ) : null}
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-white/55">
        <span>{sourceName(item.source)}</span>
        <span aria-hidden>·</span>
        <span className="text-signal-orange">{(sub ?? section).bn}</span>
      </p>
    </article>
  );
}
