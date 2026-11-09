import Link from "next/link";
import { CalendarDays, Rss } from "lucide-react";
import { Ago, DateText } from "@/components/media/ui/numerals";
import type { NewsItem } from "@/lib/media/news";
import { newsHref } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";
import { HEAD, Thumb } from "./story";

/**
 * The paper's masthead, after The Daily Star's: the name large at the left
 * with the date and the last update under it; at the right three teasers,
 * each a small photo and a headline (from lg). The name is the paper's own,
 * set in the landing page's display face and gold.
 */
export function Masthead({ teasers, at, now }: { teasers: NewsItem[]; at: string; now: string }) {
  return (
    <div className="grid grid-cols-1 items-end gap-6 py-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12 lg:py-8">
      <div>
        <Link href={newsHref.home} className="inline-block rounded-md focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:outline-none">
          <span className="block font-grotesk text-5xl leading-none font-extrabold tracking-tight text-signal-orange sm:text-6xl xl:text-7xl">নাগরিক জীবন</span>
        </Link>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-white/65 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-signal-orange" aria-hidden />
            <DateText iso={now} weekday />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Rss className="size-4 text-signal-orange" aria-hidden />
            হালনাগাদ <Ago iso={at} live /> · প্রতি ১৫ মিনিটে
          </span>
        </p>
      </div>

      {teasers.length > 0 ? (
        <ul className="hidden grid-cols-3 gap-6 lg:grid">
          {teasers.slice(0, 3).map((item) => (
            <li key={item.id}>
              <Link href={newsHref.story(item.id)} className="group flex items-start gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none">
                <Thumb item={item} ratio="aspect-square" sizes="64px" className="w-16 shrink-0" />
                <span lang={item.lang} className={cn("line-clamp-3 font-grotesk font-bold text-white transition-colors group-hover:text-signal-orange", HEAD.sm, "text-sm")}>
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
