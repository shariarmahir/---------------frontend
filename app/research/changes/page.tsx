import type { Metadata } from "next";
import Link from "next/link";
import { articleHref, bnDate, KindChip } from "@/components/research/ui";
import { libraryArticles } from "@/data/research/library";
import { recentChanges } from "@/lib/research/core";

export const metadata: Metadata = { title: "সাম্প্রতিক পরিবর্তন — গবেষণাকোষ" };

/** সাম্প্রতিক পরিবর্তন: every edit across the library, newest first, as a timeline. */
export default function ResearchChangesPage() {
  const changes = recentChanges(libraryArticles, 50);
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold text-signal-orange">কে কোন নিবন্ধে কী যোগ করলেন</p>
        <h1 className="font-wiki mt-1 text-[clamp(2.2rem,5vw,3.4rem)] leading-tight font-bold text-white">সাম্প্রতিক পরিবর্তন</h1>
      </header>
      <ol className="relative space-y-3 border-l-2 border-white/10 pl-6 sm:pl-8">
        {changes.map(({ article, rev }) => (
          <li key={article.slug + rev.at} className="relative">
            <span aria-hidden className="absolute top-5 -left-[1.95rem] size-3 rounded-full bg-signal-orange ring-4 ring-black sm:-left-[2.45rem]" />
            <Link href={articleHref(article)} className="group block rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.07] sm:p-5">
              <span className="flex flex-wrap items-center gap-2 text-xs text-white/50"><span className="font-bold text-white/70">{bnDate(rev.at)}</span> <KindChip article={article} /></span>
              <span className="font-wiki mt-2 block text-lg leading-snug font-bold text-white group-hover:text-signal-orange">{article.title}</span>
              <span className="mt-1 block text-sm text-white/60"><strong className="text-white/85">{rev.by}</strong> — {rev.note}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
