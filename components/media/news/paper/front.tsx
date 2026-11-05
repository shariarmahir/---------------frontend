import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FrontTabs } from "@/components/media/news/paper/front-tabs";
import { EmptyDesk, LeadStory, MoreButton, SectionHead, StoryFeature, StoryList, StoryNumbered, StoryRow, StoryText, StoryTile } from "@/components/media/news/paper/story";
import { Num } from "@/components/media/ui/numerals";
import { btn } from "@/components/ui/section-kit";
import { headlines, type NewsItem } from "@/lib/media/news";
import { findSection, findSub, NEWS_SECTIONS, newsHref, storiesIn, type NewsSection, type NewsSub } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

/*
 * নাগরিক জীবন's front page, laid out after The Daily Star's home page:
 * a three-column top band (latest | lead | two tiles), a row of more news,
 * four section columns, a feature row, a tabbed box beside a big world (or
 * sports) block, then a 4-up block for every other section with stories.
 *
 * The page is planned first (planFront), in the order the blocks are most
 * constrained, so no story is placed twice: every pick comes out of one
 * shared "used" set.
 */

const hasPhoto = (n: NewsItem) => Boolean(n.image);

/** A desk that hands out stories once each. */
function desk(items: NewsItem[], skip: NewsItem[] = []) {
  const used = new Set<string>(skip.map((n) => n.id));
  const free = (list: NewsItem[]) => list.filter((n) => !used.has(n.id));
  const mark = (list: NewsItem[]) => {
    for (const n of list) used.add(n.id);
    return list;
  };
  return {
    free,
    /** Up to `n` unused stories from `list`, photos first when `photo` is asked (order kept otherwise). */
    take(list: NewsItem[], n: number, photo = false): NewsItem[] {
      const open = free(list);
      const pool = photo ? [...open.filter(hasPhoto), ...open.filter((x) => !hasPhoto(x))] : open;
      return mark(pool.slice(0, n));
    },
    /** One unused story, preferring one with a photo. */
    one(list: NewsItem[]): NewsItem | undefined {
      const open = free(list);
      const pick = open.find(hasPhoto) ?? open[0];
      return pick ? mark([pick])[0] : undefined;
    },
    mark,
  };
}

export interface SectionBlock {
  key: string;
  title: string;
  href: string;
  tile: NewsItem;
  texts: NewsItem[];
}

export interface FrontPlan {
  lead?: NewsItem;
  underLead: NewsItem[];
  side: NewsItem[];
  latest: NewsItem[];
  more: NewsItem[];
  columns: SectionBlock[];
  features: NewsItem[];
  picks: NewsItem[];
  slow: NewsItem[];
  big?: SectionBlock;
  blocks: SectionBlock[];
}

const sec = (slug: string) => findSection(slug) as NewsSection;

function block(d: ReturnType<typeof desk>, items: NewsItem[], key: string, title: string, href: string, section: NewsSection, sub: NewsSub | undefined, texts: number): SectionBlock | undefined {
  const list = storiesIn(items, section, sub);
  const tile = d.one(list);
  if (!tile) return undefined;
  return { key, title, href, tile, texts: d.take(list, texts) };
}

/** Lays out the whole front page from the paper's stories (newest first), each story once. `skip`: stories already on screen (the masthead's teasers). */
export function planFront(items: NewsItem[], skip: NewsItem[] = []): FrontPlan {
  const d = desk(items, skip);

  // 1. The top band. The lead is the first headline with a photo.
  const top = headlines(d.free(items), 12);
  const lead = d.one(top);
  const underLead = d.take(top, 2);
  const side = d.take(top.length > 0 ? top : items, 2, true);
  const sideFill = side.length < 2 ? d.take(items, 2 - side.length, true) : [];
  const latest = d.take(items, 5);

  // 2. More news: the next four, photos first.
  const more = d.take(items, 4, true);

  // 3. The four DS columns: opinion, business, sports, culture.
  const columns = (["opinion", "business", "sports", "culture"] as const)
    .map((slug) => block(d, items, slug, sec(slug).bn, newsHref.section(slug), sec(slug), undefined, 3))
    .filter((b): b is SectionBlock => Boolean(b));

  // 5 (before 4: the big block has one section to draw from). World, else sports.
  const news = sec("news");
  const world = findSub(news, "world");
  const big = block(d, items, "world", "বিশ্ব", newsHref.sub("news", "world"), news, world, 4) ?? block(d, items, "sports", "খেলা", newsHref.section("sports"), sec("sports"), undefined, 4);

  // 4. Features: tall photos from lifestyle, culture, slow reads, then any.
  const photoOf = (slug: string) => storiesIn(items, sec(slug)).filter(hasPhoto);
  const features: NewsItem[] = [];
  for (const list of [photoOf("lifestyle"), photoOf("culture"), photoOf("slow-reads"), items.filter(hasPhoto)]) {
    features.push(...d.take(list, 4 - features.length));
    if (features.length >= 4) break;
  }

  // 5. The tabbed box: slow reads from their own section, the editor's pick across sections.
  const slow = d.take(storiesIn(items, sec("slow-reads")), 5);
  const picks = d.mark(headlines(d.free(items), 5));

  // 6. Every other section with stories, after the bottom of DS /news.
  const wanted: [string, string | undefined][] = [
    ...news.subs.filter((s) => s.slug !== "world" || big?.key !== "world").map((s) => ["news", s.slug] as [string, string]),
    ["lifestyle", undefined],
    ["youth", undefined],
    ["plus", undefined],
  ];
  const blocks = wanted
    .map(([slug, subSlug]) => {
      const section = sec(slug);
      const sub = subSlug ? findSub(section, subSlug) : undefined;
      const href = sub ? newsHref.sub(slug, sub.slug) : newsHref.section(slug);
      return block(d, items, `${slug}/${subSlug ?? ""}`, (sub ?? section).bn, href, section, sub, 2);
    })
    .filter((b): b is SectionBlock => Boolean(b));

  return {
    lead,
    underLead,
    side: [...side, ...sideFill],
    latest,
    more,
    columns,
    features,
    picks,
    slow,
    big,
    blocks,
  };
}

/* ---------- The page ---------- */

/** lg column counts, spelled out so Tailwind sees every class. */
const LG_COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"];

/** A row of similar tiles: a snap carousel on phones, 2 columns on tablets, `cols` from lg. */
function TileRow({ count, children, label, className }: { count: number; children: React.ReactNode; label: string; className?: string }) {
  return (
    <div
      role="list"
      aria-label={label}
      className={cn(
        "no-scrollbar -mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 scroll-px-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0",
        "[&>*]:w-[80%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto",
        LG_COLS[Math.min(count, 4)],
        className,
      )}
    >
      {children}
    </div>
  );
}

function ColumnBlock({ b, more }: { b: SectionBlock; more?: boolean }) {
  return (
    <section aria-labelledby={`front-${b.key}`} className="flex h-full flex-col">
      <SectionHead id={`front-${b.key}`} title={b.title} href={b.href} as="h2" />
      <div className="mt-5">
        <StoryTile item={b.tile} size="lg" />
      </div>
      {b.texts.length > 0 ? (
        <StoryList className="mt-5 border-t border-white/10 pt-4">
          {b.texts.map((n) => (
            <StoryText key={n.id} item={n} summary={false} />
          ))}
        </StoryList>
      ) : null}
      {more ? (
        <div className="mt-auto pt-6">
          <MoreButton href={b.href}>আরও {b.title}</MoreButton>
        </div>
      ) : null}
    </section>
  );
}

export function FrontPage({ items, skip }: { items: NewsItem[]; skip: NewsItem[] }) {
  const p = planFront(items, skip);

  if (!p.lead) {
    return (
      <>
        <h1 className="sr-only">নাগরিক জীবন — প্রথম পাতা</h1>
        <EmptyDesk title="এই মুহূর্তে কোনো খবর নেই">সংবাদপত্রের ফিড থেকে এখনো কোনো খবর আসেনি। একটু পরে আবার দেখুন।</EmptyDesk>
      </>
    );
  }

  return (
    <div className="space-y-14 lg:space-y-16">
      <h1 className="sr-only">নাগরিক জীবন — প্রথম পাতা</h1>

      {/* 1. The top band: latest | lead | two tiles, hairlines between. */}
      <section aria-label="প্রধান খবর" className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-0">
        <div className="md:col-span-2 lg:order-2 lg:col-span-1 lg:border-x lg:border-white/12 lg:px-6">
          <LeadStory item={p.lead} priority />
          {p.underLead.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-white/12 pt-5 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/12 sm:[&>*]:px-5 sm:[&>*:first-child]:pl-0 sm:[&>*:last-child]:pr-0">
              {p.underLead.map((n) => (
                <StoryText key={n.id} item={n} size="md" />
              ))}
            </div>
          ) : null}
        </div>

        {p.latest.length > 0 ? (
          <div className="lg:order-1 lg:pr-6">
            <SectionHead title="সর্বশেষ" href={newsHref.today} more="আজকের খবর" className="border-t-0 pt-0 md:border-t md:pt-4 lg:border-t-0 lg:pt-0" />
            {/* 1024–1279: the column is too narrow for thumbnails, so the list runs as headlines; photos return from xl. */}
            <StoryList className="mt-4 lg:max-xl:[&_article>a:first-child]:hidden">
              {/* The masthead shows its teasers from lg only; below that they lead this list, so phones don't lose them. */}
              {skip.map((n) => (
                <div key={`m-${n.id}`} className="lg:hidden">
                  <StoryRow item={n} />
                </div>
              ))}
              {p.latest.map((n) => (
                <StoryRow key={n.id} item={n} />
              ))}
            </StoryList>
          </div>
        ) : null}

        {p.side.length > 0 ? (
          <div className="border-t border-white/12 pt-6 md:pt-4 lg:order-3 lg:border-t-0 lg:pt-0 lg:pl-6">
            <StoryList>
              {p.side.map((n) => (
                <StoryTile key={n.id} item={n} size="md" summary ratio="aspect-[4/3]" sizes="(min-width: 1024px) 340px, (min-width: 768px) 50vw, 100vw" />
              ))}
            </StoryList>
          </div>
        ) : null}
      </section>

      {/* 2. More news, then onward to the whole day. */}
      {p.more.length > 0 ? (
        <section aria-labelledby="front-more">
          <SectionHead id="front-more" title="আরও খবর" href={newsHref.today} more="আজকের সব খবর" />
          <div className="mt-6">
            <TileRow count={p.more.length} label="আরও খবর">
              {p.more.map((n) => (
                <div role="listitem" key={n.id}>
                  <StoryTile item={n} />
                </div>
              ))}
            </TileRow>
          </div>
          <Link
            href={newsHref.today}
            className="group mt-8 flex min-h-12 items-center justify-between gap-4 border-y border-white/12 py-3 font-grotesk text-base font-bold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          >
            আজকের সব খবর এক পাতায়
            <ArrowRight className="size-5 text-signal-orange transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </section>
      ) : null}

      {/* 3. Opinion, business, sports, culture: the DS four columns. */}
      {p.columns.length > 0 ? (
        <TileRow count={p.columns.length} label="বিভাগের খবর" className="sm:gap-y-12">
          {p.columns.map((b) => (
            <div role="listitem" key={b.key}>
              <ColumnBlock b={b} />
            </div>
          ))}
        </TileRow>
      ) : null}

      {/* 4. Features: tall photos, headline on a navy band. */}
      {p.features.length > 0 ? (
        <section aria-labelledby="front-feature">
          <SectionHead id="front-feature" title="ফিচার" href={newsHref.section("lifestyle")} more="আরও জীবনধারা" />
          <div className="mt-6">
            <TileRow count={p.features.length} label="ফিচার">
              {p.features.map((n) => (
                <div role="listitem" key={n.id}>
                  <StoryFeature item={n} />
                </div>
              ))}
            </TileRow>
          </div>
        </section>
      ) : null}

      {/* 5. The tabbed box beside a big world (or sports) block. */}
      {p.picks.length > 0 || p.slow.length > 0 || p.big ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          {p.picks.length > 0 || p.slow.length > 0 ? (
            <div className="lg:pt-4">
              <FrontTabs
                tabs={[
                  {
                    label: "সম্পাদকের বাছাই",
                    panel: <Ranked list={p.picks} empty="এই মুহূর্তে বাছাই করার মতো খবর বাকি নেই।" />,
                  },
                  {
                    label: "ধীরে পড়ুন",
                    panel: <Ranked list={p.slow} empty="এই মুহূর্তে লম্বা লেখা নেই।" more={newsHref.section("slow-reads")} />,
                  },
                ]}
              />
            </div>
          ) : null}
          {p.big ? (
            <section aria-labelledby="front-big">
              <SectionHead id="front-big" title={p.big.title} href={p.big.href} more={`আরও ${p.big.title}`} />
              <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6">
                <StoryTile item={p.big.tile} size="xl" summary ratio="aspect-[4/3]" sizes="(min-width: 1024px) 460px, (min-width: 768px) 60vw, 100vw" />
                {p.big.texts.length > 0 ? (
                  <StoryList className="border-t border-white/10 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                    {p.big.texts.map((n) => (
                      <StoryRow key={n.id} item={n} />
                    ))}
                  </StoryList>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {/* 6. Every other section with stories, 4-up. */}
      {p.blocks.length > 0 ? (
        <TileRow count={4} label="আরও বিভাগ" className="sm:gap-y-14">
          {p.blocks.map((b) => (
            <div role="listitem" key={b.key}>
              <ColumnBlock b={b} more />
            </div>
          ))}
          <Onward count={p.blocks.length} />
        </TileRow>
      ) : null}
    </div>
  );
}

/** lg spans for the box that closes an unfinished last row of blocks. */
const LG_SPAN = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3"];

/**
 * When the section blocks don't fill their last row, the gap holds the way
 * onward instead: every section of the paper and the whole day's news. Real
 * links, no filler stories.
 */
function Onward({ count }: { count: number }) {
  const rest = (4 - (count % 4)) % 4;
  if (rest === 0) return null;
  return (
    <div role="listitem" className={cn(count % 2 === 0 && "sm:col-span-2", LG_SPAN[rest])}>
      <nav aria-labelledby="front-onward" className="flex h-full flex-col rounded-2xl bg-bdnavy-900 p-6 ring-1 ring-white/12">
        <h2 id="front-onward" className="font-grotesk text-2xl leading-tight font-bold text-signal-orange">
          আরও পড়ুন
        </h2>
        <ul className={cn("mt-4 grid grid-cols-2 gap-x-4", count % 2 === 0 && "sm:grid-cols-3", rest === 1 ? "lg:grid-cols-1 lg:divide-y lg:divide-white/10" : "lg:grid-cols-3")}>
          {NEWS_SECTIONS.map((s) => (
            <li key={s.slug}>
              <Link
                href={newsHref.section(s.slug)}
                className="flex min-h-11 items-center rounded-sm font-grotesk text-base font-bold text-white transition-colors hover:text-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                {s.bn}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">
          <Link href={newsHref.today} className={cn(btn.gold, "w-full")}>
            আজকের সব খবর
          </Link>
        </div>
      </nav>
    </div>
  );
}

function Ranked({ list, empty, more }: { list: NewsItem[]; empty: string; more?: string }) {
  if (list.length === 0) return <p className="text-sm leading-relaxed text-white/70">{empty}</p>;
  return (
    <>
      <StoryList>
        {list.map((n, i) => (
          <StoryNumbered key={n.id} item={n} n={<Num value={i + 1} />} />
        ))}
      </StoryList>
      {more ? (
        <Link
          href={more}
          className="group mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-bold text-signal-orange hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
        >
          সব লম্বা লেখা
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </Link>
      ) : null}
    </>
  );
}
