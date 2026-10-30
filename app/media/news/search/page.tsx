import type { Metadata } from "next";
import { Search } from "lucide-react";
import { EmptyDesk, StoryList, StoryRow } from "@/components/media/news/paper/story";
import { PaperPageHead, SectionChips } from "@/components/media/news/paper/story-page";
import { Num } from "@/components/media/ui/numerals";
import { btn } from "@/components/ui/section-kit";
import { loadPaper } from "@/lib/media/news-paper";
import { newsHref, searchNews } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ q?: string | string[] }>;

/** Enough for a reader to scan; a broader word says how many more there are. */
const SHOWN = 60;

const queryOf = (q?: string | string[]) => (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 120) ?? "";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const q = queryOf((await searchParams).q);
  return { title: q ? `“${q}” — খবর খুঁজুন — নাগরিক জীবন` : "খবর খুঁজুন — নাগরিক জীবন" };
}

/**
 * খবর খুঁজুন: every word of `?q=` must appear in a story's headline,
 * summary or the feed's own section names (searchNews). A plain GET form,
 * so it works before any script loads and the address can be shared.
 */
export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const q = queryOf((await searchParams).q);
  const paper = await loadPaper();
  const results = q ? searchNews(paper.items, q) : [];

  return (
    <div className="mx-auto max-w-[84rem] space-y-10">
      <PaperPageHead title="খবর খুঁজুন">গত দেড় দিনের সব খবরের শিরোনাম আর সারাংশে খোঁজে। একাধিক শব্দ দিলে সবগুলো মেলে এমন খবর আসে।</PaperPageHead>

      <form action={newsHref.search()} role="search" className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="np-search-page" className="sr-only">
          খবর খুঁজুন
        </label>
        <span className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-signal-orange" aria-hidden />
          <input
            id="np-search-page"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="শিরোনাম, বিষয় বা নাম লিখুন"
            autoComplete="off"
            enterKeyHint="search"
            className="h-16 w-full rounded-2xl bg-bdnavy-900 pr-5 pl-14 font-grotesk text-lg text-white ring-1 ring-white/15 placeholder:text-white/45 focus:ring-2 focus:ring-signal-orange focus:outline-none sm:text-xl"
          />
        </span>
        <button type="submit" className={cn(btn.gold, "h-16 sm:px-8")}>
          খুঁজুন
        </button>
      </form>

      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="search-results" className="min-w-0">
          {!q ? (
            <EmptyDesk title="কী খুঁজছেন?">ওপরের ঘরে একটি শব্দ লিখুন, যেমন কোনো জায়গা, মানুষ বা বিষয়ের নাম। অথবা বিভাগগুলো ঘুরে দেখুন।</EmptyDesk>
          ) : (
            <>
              <h2 id="search-results" className="border-t border-white/12 pt-4 font-grotesk text-xl font-bold text-white sm:text-2xl">
                <span className="text-signal-orange">“{q}”</span> — <Num value={results.length} />টি খবর
              </h2>
              {results.length === 0 ? (
                <div className="mt-6">
                  <EmptyDesk title="মেলে এমন কোনো খবর নেই">অন্য বা কম শব্দে খুঁজে দেখুন; বাংলা আর ইংরেজি দুই ভাষাতেই খোঁজা যায়। অথবা বিভাগ ধরে দেখুন।</EmptyDesk>
                </div>
              ) : (
                <>
                  <StoryList className="mt-6">
                    {results.slice(0, SHOWN).map((n) => (
                      <StoryRow key={n.id} item={n} size="md" />
                    ))}
                  </StoryList>
                  {results.length > SHOWN ? (
                    <p className="mt-6 border-t border-white/12 pt-4 text-sm text-white/65">
                      প্রথম <Num value={SHOWN} />টি দেখানো হলো; আরও নির্দিষ্ট শব্দ দিয়ে খুঁজলে বাকিগুলো পাবেন।
                    </p>
                  ) : null}
                </>
              )}
            </>
          )}
        </section>

        <aside aria-labelledby="search-sections" className="lg:sticky lg:top-32">
          <h2 id="search-sections" className="border-t-2 border-signal-orange pt-3 pb-5 font-grotesk text-xl font-bold text-signal-orange">
            বিভাগ ধরে দেখুন
          </h2>
          <SectionChips />
        </aside>
      </div>
    </div>
  );
}
