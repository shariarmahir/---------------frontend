import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clapperboard, Info, Newspaper, Rss, Zap } from "lucide-react";
import {
  BriefRow, CATEGORY_ICON, chipLink, EDITION_ICON, HeadlineRow, LeadStory, SectionTitle, ShowRow, StoryCard,
} from "@/components/media/news/news-ui";
import { Ago, DateText, Num } from "@/components/media/ui/numerals";
import { NEWS_SOURCES, sourceName } from "@/data/media/news-sources";
import { byCategory, CATEGORIES, EDITION_ORDER, EDITIONS, editionAt, headlines, inEdition, newsDay, type Edition, type NewsCategory } from "@/lib/media/news";
import { loadNews } from "@/lib/media/news-fetch";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "নাগরিক জীবন — আজকের খবর" };

const isEdition = (v?: string): v is Edition => v === "morning" || v === "noon" || v === "evening" || v === "night";
const isCategory = (v?: string): v is NewsCategory => Boolean(v && v in CATEGORIES);

/**
 * নাগরিক জীবন: the day's news in four editions. `?e=` picks the edition,
 * `?d=y` yesterday's, `?c=` one category. Feeds are read on the server and
 * cached for 15 minutes (see news-fetch.ts).
 */
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ e?: string; d?: string; c?: string }> }) {
  const { e, d, c } = await searchParams;
  const now = new Date();
  const desk = await loadNews(now);
  const yesterday = d === "y";
  const today = newsDay(now);
  const day = yesterday ? newsDay(new Date(now.getTime() - 24 * 3_600_000)) : today;
  const current = editionAt(now);
  const reached = (ed: Edition) => yesterday || EDITION_ORDER.indexOf(ed) <= EDITION_ORDER.indexOf(current);
  const edition: Edition = isEdition(e) && reached(e) ? e : yesterday ? "night" : current;
  const category = isCategory(c) ? c : undefined;

  const all = desk.sample ? desk.items : inEdition(desk.items, day, edition);
  const counts = Object.fromEntries(EDITION_ORDER.map((ed) => [ed, desk.sample ? 0 : inEdition(desk.items, day, ed).length])) as Record<Edition, number>;
  const front = headlines(all, 5);
  const [lead, ...side] = front;
  const rest = all.filter((n) => !front.includes(n));
  const brief = rest.slice(0, 12);
  const shows = all.filter((n) => n.category === "entertainment");
  const groups = byCategory(all).filter(([cat]) => !category || cat === category);
  const href = (q: { e?: Edition; d?: boolean; c?: NewsCategory }) => {
    const p = new URLSearchParams();
    if (q.d) p.set("d", "y");
    if (q.e) p.set("e", q.e);
    if (q.c) p.set("c", q.c);
    const s = p.toString();
    return s ? `/media/news?${s}` : "/media/news";
  };
  const EdIcon = EDITION_ICON[edition];
  const live = NEWS_SOURCES.filter((s) => !desk.failed.includes(s.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Masthead: a newspaper's top band — date line, the name, the edition. */}
      <header className="live-in overflow-hidden rounded-3xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-m-ink/9 px-5 py-2.5 text-xs font-semibold text-m-ink/65 sm:px-8">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden /><DateText iso={`${day}`} weekday /></span>
          <span className="inline-flex items-center gap-1.5"><Rss className="size-3.5 text-m-blue" aria-hidden />হালনাগাদ <Ago iso={desk.at} live /> · প্রতি ১৫ মিনিটে</span>
        </div>
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-sm font-bold text-m-blue">শিক্ষিতদের মিডিয়া · দৈনিক সারাংশ</p>
            <h1 className="mt-2 text-5xl leading-none font-bold tracking-tight text-m-ink sm:text-7xl">নাগরিক জীবন</h1>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-m-ink/75">দেশ-বিদেশের খবর এক নজরে — সকাল, দুপুর, সন্ধ্যা আর রাতে। প্রতিটি খবরের শিরোনাম আর ছোট সারাংশ, পুরোটা পড়তে এক চাপে সংবাদপত্রের পাতায়।</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-m-yellow px-5 py-4 text-m-ink">
            <EdIcon className="size-9 shrink-0" aria-hidden />
            <span>
              <span className="block text-xl font-bold">{yesterday ? "গতকালের " : ""}{EDITIONS[edition].bn}</span>
              <span className="block text-xs font-semibold text-m-ink/75">{EDITIONS[edition].span} · <Num value={all.length} />টি খবর</span>
            </span>
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-m-ink/9 px-5 py-3 text-xs text-m-ink/55 sm:px-8">
          <span className="font-semibold text-m-ink/70">সূত্র:</span>
          {live.map((s) => (
            <a key={s.id} href={s.home} target="_blank" rel="noopener noreferrer" className="font-semibold text-m-ink/75 hover:text-m-blue">{s.bn}</a>
          ))}
        </p>
      </header>

      {desk.sample && (
        <p role="status" className="flex items-start gap-2 rounded-2xl bg-m-card p-4 text-sm font-semibold text-m-ink ring-2 ring-m-blue">
          <Info className="mt-0.5 size-4.5 shrink-0 text-m-blue" aria-hidden />
          এই মুহূর্তে কোনো সংবাদপত্রের ফিড পাওয়া যায়নি — নিচের খবরগুলো নমুনা, আসল নয়। একটু পরে আবার দেখুন।
        </p>
      )}

      {/* Edition switcher: four times of day, today or yesterday. */}
      {!desk.sample && (
        <nav aria-label="সংস্করণ" className="space-y-3">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {EDITION_ORDER.map((ed) => {
              const Icon = EDITION_ICON[ed];
              const on = ed === edition;
              const open = reached(ed);
              const body = (
                <>
                  <Icon className="size-6 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-bold">
                      {EDITIONS[ed].bn}
                      {!yesterday && ed === current && <span className={cn("rounded-full px-1.5 py-px text-[10px]", on ? "bg-m-card text-m-blue" : "bg-m-yellow text-m-ink")}>এখন</span>}
                    </span>
                    <span className={cn("block text-[11px] font-medium", on ? "text-m-ink/75" : "text-m-ink/55")}>{open ? <><Num value={counts[ed]} />টি খবর</> : `আসবে ${EDITIONS[ed].span.split(" – ")[0]}`}</span>
                  </span>
                </>
              );
              const cls = cn("flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 transition-[background-color,translate] duration-200", on ? "bg-m-yellow text-m-ink shadow-[0_14px_30px_-18px_var(--color-signal-orange)]" : "bg-m-card text-m-ink ring-1 ring-m-ink/10", open && !on && "hover:-translate-y-0.5 hover:bg-m-ink/4", !open && "opacity-45");
              return (
                <li key={ed}>
                  {open ? (
                    <Link href={href({ e: ed, d: yesterday, c: category })} scroll={false} aria-current={on ? "page" : undefined} className={cls}>{body}</Link>
                  ) : (
                    <span aria-disabled className={cls}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href={href({ e: yesterday ? undefined : edition, c: category })} scroll={false} aria-current={!yesterday ? "page" : undefined} className={chipLink(!yesterday)}>আজ</Link>
            <Link href={href({ d: true, e: "night", c: category })} scroll={false} aria-current={yesterday ? "page" : undefined} className={chipLink(yesterday)}>গতকাল</Link>
          </div>
        </nav>
      )}

      {!lead ? (
        <div className="rounded-3xl border border-dashed border-m-ink/13 bg-m-card p-10 text-center shadow-m-tile">
          <EdIcon className="mx-auto size-12 text-m-blue" aria-hidden />
          <p className="mt-3 text-lg font-bold text-m-ink">এই বেলায় এখনো খবর আসেনি</p>
          <p className="mt-1 text-sm text-m-ink/65">সংবাদপত্রগুলো নতুন খবর দিলেই এখানে উঠবে — অথবা আগের বেলার খবর দেখুন।</p>
        </div>
      ) : (
        <>
          {/* Front page: the lead, then four headlines from other desks. */}
          <section aria-labelledby="front-title" className="space-y-4">
            <SectionTitle id="front-title" Icon={Newspaper} title="এই বেলার শিরোনাম" />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <LeadStory item={lead} />
              {side.length > 0 && (
                <ol className="rounded-3xl bg-m-card p-2 ring-1 ring-m-ink/10 shadow-m-tile">
                  {side.map((n, i) => <HeadlineRow key={n.id} item={n} n={i + 2} />)}
                </ol>
              )}
            </div>
          </section>

          {/* At a glance: short news, one line each. */}
          {brief.length > 0 && (
            <section aria-labelledby="brief-title" className="space-y-3">
              <SectionTitle id="brief-title" Icon={Zap} title="এক নজরে" hint="ছোট খবর, এক লাইনে" />
              <ol className="grid gap-x-8 rounded-3xl bg-m-card px-5 py-2 ring-1 ring-m-ink/10 md:grid-cols-2 shadow-m-tile">
                {brief.map((n, i) => <BriefRow key={n.id} item={n} n={<Num value={i + 1} />} />)}
              </ol>
            </section>
          )}

          {shows.length > 0 && !category && (
            <section aria-labelledby="show-title" className="space-y-3">
              <SectionTitle id="show-title" Icon={Clapperboard} title="বিনোদন" hint="সিনেমা, নাটক, গান, তারকা" action={<Link href={href({ e: edition, d: yesterday, c: "entertainment" })} scroll={false} className="text-sm font-bold text-m-blue hover:underline">সব বিনোদন</Link>} />
              <ShowRow items={shows.slice(0, 10)} />
            </section>
          )}

          {/* Every desk, by category. */}
          <section aria-labelledby="desks-title" className="space-y-5">
            <SectionTitle id="desks-title" Icon={Newspaper} title="বিভাগ অনুযায়ী" />
            <nav aria-label="বিভাগ" className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-2">
                <li><Link href={href({ e: edition, d: yesterday })} scroll={false} aria-current={!category ? "page" : undefined} className={chipLink(!category)}>সব</Link></li>
                {byCategory(all).map(([cat, list]) => {
                  const Icon = CATEGORY_ICON[cat];
                  return (
                    <li key={cat}>
                      <Link href={href({ e: edition, d: yesterday, c: cat })} scroll={false} aria-current={category === cat ? "page" : undefined} className={chipLink(category === cat)}>
                        <Icon className="size-4" aria-hidden /> {CATEGORIES[cat].bn} <span className="opacity-70"><Num value={list.length} /></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {groups.map(([cat, list]) => {
              const Icon = CATEGORY_ICON[cat];
              const shown = category ? list : list.slice(0, 6);
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-m-ink">
                    <span className="grid size-8 place-items-center rounded-lg bg-m-yellow text-m-ink"><Icon className="size-4.5" aria-hidden /></span>
                    {CATEGORIES[cat].bn}
                    <span className="text-sm font-medium text-m-ink/50"><Num value={list.length} />টি</span>
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shown.map((n) => <StoryCard key={n.id} item={n} />)}</ul>
                  {!category && list.length > shown.length && (
                    <Link href={href({ e: edition, d: yesterday, c: cat })} scroll={false} className="inline-block text-sm font-bold text-m-blue hover:underline">
                      {CATEGORIES[cat].bn}-এর আরও <Num value={list.length - shown.length} />টি খবর
                    </Link>
                  )}
                </div>
              );
            })}
          </section>
        </>
      )}

      <footer className="space-y-1 border-t border-m-ink/9 pt-4 text-xs leading-relaxed text-m-ink/50">
        <p>শিরোনাম আর সারাংশ সংবাদপত্রগুলোর নিজস্ব আরএসএস ফিড থেকে নেওয়া; পুরো খবর, ছবি আর স্বত্ব তাদেরই। কোনো খবর ভুল মনে হলে মূল সংবাদপত্রে মিলিয়ে নিন।</p>
        {desk.failed.length > 0 && !desk.sample && <p>এই মুহূর্তে পাওয়া যায়নি: {desk.failed.map(sourceName).join(", ")}।</p>}
      </footer>
    </div>
  );
}
