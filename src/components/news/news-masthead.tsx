import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { FEED_POLICY, newsItems, watchedSources } from "@/data/news-feed";

/**
 * Today as "১৯ সেপ্টেম্বর ২০২৬" in Bengali digits.
 *
 * Takes the date rather than reading the clock so the caller resolves it
 * once. This is a server component, so the value is fixed in the HTML and
 * never re-derived in the browser.
 */
function todayBengali(now: Date): string {
  const D = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const M = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const bn = (n: number) =>
    String(n)
      .split("")
      .map((d) => D[Number(d)])
      .join("");
  return `${bn(now.getDate())} ${M[now.getMonth()]} ${bn(now.getFullYear())}`;
}

/**
 * Page masthead: the wordmark, today's date, and what the feed is watching.
 *
 * The source counts are what make the page honest — it says up front that
 * this is an index across outlets, not original reporting.
 */
export function NewsMasthead() {
  // Resolved once, in this server component, and baked into the HTML.
  // The timezone is pinned to Dhaka: an unpinned locale format renders in
  // the server's zone and would disagree with a reader's browser.
  const now = new Date();
  const englishDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });

  return (
    <section className="w-full border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-space-md px-gutter py-space-lg">
        <div className="flex flex-wrap items-end justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <Image
              src="/icons/map.png"
              alt=""
              aria-hidden
              width={512}
              height={512}
              className="size-10 shrink-0 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="font-display text-[1.75rem] leading-none font-extrabold tracking-tight sm:text-[2.25rem]">
                <span className="text-primary">আজকের </span>
                <span className="text-crimson">বাংলাদেশ</span>
              </h1>
              <span className="mt-1 font-sans text-[0.8125rem] text-slate-500">
                National news index · {englishDate}
              </span>
            </div>
          </div>

          <span className="font-display text-[0.9375rem] font-bold text-slate-900">
            {todayBengali(now)}
          </span>
        </div>

        {/* What the feed watches. */}
        <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xs border-t border-border pt-space-md">
          <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-slate-500 uppercase">
            Watching
          </span>
          {watchedSources.map((s) => (
            <span
              key={s.name}
              className="flex items-center gap-1 font-sans text-[0.8125rem] text-slate-600"
            >
              <Icon name="check_circle" className="text-[13px] text-primary" />
              {s.name}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-50 px-space-sm py-1 font-sans text-[0.8125rem] font-semibold text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {newsItems.length} reports today
          </span>
        </div>

        <p className="max-w-3xl font-sans text-[0.8125rem] leading-relaxed text-slate-500">
          {FEED_POLICY}
        </p>

        {/* Said plainly, on the page. A reader should never have to work out
            whether a cover photo documents the report next to it. */}
        <p className="flex max-w-3xl items-start gap-1.5 font-sans text-[0.75rem] leading-relaxed text-slate-500">
          <Icon
            name="info"
            className="mt-px shrink-0 text-[14px] text-slate-400"
          />
          <span>
            Cover photographs are licensed stock images that illustrate the
            subject area. They are not photographs of the events described, and
            each is credited to its photographer.
          </span>
        </p>
      </div>
    </section>
  );
}
