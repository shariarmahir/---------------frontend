import Link from "next/link";
import { SectionChips } from "@/components/media/news/paper/story-page";
import { btn } from "@/components/ui/section-kit";
import { newsHref } from "@/lib/media/news-sections";
import { cn } from "@/lib/utils";

/**
 * A story that isn't in the paper any more (the feeds keep about a day and a
 * half of news) or a link that was never right: said plainly, with the way
 * back to the front page, today's news and the sections.
 */
export default function StoryNotFound() {
  return (
    <div className="mx-auto max-w-3xl border-t-2 border-signal-orange pt-8 text-center sm:pt-10">
      <h1 className="font-grotesk text-3xl leading-tight font-extrabold text-signal-orange sm:text-5xl">খবরটি পাওয়া যায়নি</h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-white/75">
        নাগরিক জীবনে খবর থাকে প্রায় দেড় দিন। খবরটি হয়তো পুরোনো হয়ে সরে গেছে, বা লিংকটিতে ভুল আছে।
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={newsHref.home} className={btn.gold}>
          প্রথম পাতায় ফিরুন
        </Link>
        <Link href={newsHref.today} className={cn(btn.goldOutline, "bg-bdnavy-900")}>
          আজকের খবর
        </Link>
      </div>
      <div className="mt-12 border-t border-white/12 pt-6">
        <h2 className="font-grotesk text-lg font-bold text-white">বিভাগ ধরে দেখুন</h2>
        <SectionChips className="mt-4 justify-center" />
      </div>
    </div>
  );
}
