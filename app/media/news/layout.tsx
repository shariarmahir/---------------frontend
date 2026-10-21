import Link from "next/link";
import { Info } from "lucide-react";
import { Masthead } from "@/components/media/news/paper/masthead";
import { SectionNav } from "@/components/media/news/paper/section-nav";
import { NEWS_SOURCES, sourceName } from "@/data/media/news-sources";
import { headlines } from "@/lib/media/news";
import { loadPaper } from "@/lib/media/news-paper";
import { NEWS_SECTIONS, newsHref } from "@/lib/media/news-sections";

/**
 * নাগরিক জীবন as a newspaper (Mahir, 2026-10-21, after The Daily Star):
 * every page under /media/news shares the masthead, the sticky section menu
 * and the footer, on the landing page's pitch-black palette (`.np`, see
 * globals.css). The platform's side menu steps aside on these pages, so the
 * paper runs the full width.
 */
export default async function NewsLayout({ children }: { children: React.ReactNode }) {
  const paper = await loadPaper();
  const withPhoto = paper.items.filter((n) => n.image);
  const teasers = headlines(withPhoto.length >= 3 ? withPhoto : paper.items, 3);
  const live = NEWS_SOURCES.filter((s) => !paper.failed.includes(s.id));

  return (
    <div className="np -mx-3 -mt-6 px-3 pb-6 lg:-mx-6 lg:px-6">
      <Masthead teasers={teasers} at={paper.at} now={new Date().toISOString()} />
      <SectionNav lang={paper.lang} />

      {paper.sample ? (
        <p role="status" className="mt-6 flex items-start gap-2 rounded-2xl bg-cobalt p-4 text-sm font-semibold text-white ring-1 ring-white/12">
          <Info className="mt-0.5 size-4.5 shrink-0 text-signal-orange" aria-hidden />
          এই মুহূর্তে কোনো সংবাদপত্রের ফিড পাওয়া যায়নি — খবরগুলো নমুনা, আসল নয়। একটু পরে আবার দেখুন।
        </p>
      ) : null}

      <div className="pt-8 lg:pt-10">{children}</div>

      {/* The paper's foot: every section, the sources, whose stories these are. */}
      <footer className="mt-16 border-t border-white/12 pt-10 print:hidden">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(9,minmax(0,1fr))]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href={newsHref.home} className="font-grotesk text-3xl font-extrabold text-signal-orange">
              নাগরিক জীবন
            </Link>
            <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/65">দেশ-বিদেশের খবরের শিরোনাম আর ছোট সারাংশ, এক জায়গায়। পুরো খবর পড়ুন মূল সংবাদপত্রে।</p>
          </div>
          {NEWS_SECTIONS.map((s) => (
            <div key={s.slug}>
              <Link href={newsHref.section(s.slug)} className="font-grotesk text-sm font-bold text-signal-orange hover:text-white">
                {s.bn}
              </Link>
              <ul className="mt-2 space-y-1.5">
                {s.subs.slice(0, 4).map((sub) => (
                  <li key={sub.slug}>
                    <Link href={newsHref.sub(s.slug, sub.slug)} className="text-xs text-white/65 hover:text-white">
                      {sub.bn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-1.5 border-t border-white/12 pt-5 text-xs leading-relaxed text-white/55">
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-white/70">সূত্র:</span>
            {live.map((s) => (
              <a key={s.id} href={s.home} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/75 hover:text-signal-orange">
                {s.bn}
              </a>
            ))}
          </p>
          <p>শিরোনাম আর সারাংশ সংবাদপত্রগুলোর নিজস্ব আরএসএস ফিড থেকে নেওয়া; পুরো খবর, ছবি আর স্বত্ব তাদেরই। কোনো খবর ভুল মনে হলে মূল সংবাদপত্রে মিলিয়ে নিন।</p>
          {paper.failed.length > 0 && !paper.sample ? <p>এই মুহূর্তে পাওয়া যায়নি: {paper.failed.map(sourceName).join(", ")}।</p> : null}
        </div>
      </footer>
    </div>
  );
}
