"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { search } from "@/lib/research/core";
import { useLibrary } from "@/lib/research/store";
import { ArticleItem, bn } from "./ui";

/** Search results: chips, title, a line of the text, who and when. */
export function SearchView() {
  const q = (useSearchParams().get("q") ?? "").trim().slice(0, 120);
  const list = useLibrary();
  const hits = q ? search(list, q) : [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-bold text-signal-orange">অনুসন্ধান</p>
        <h1 className="font-wiki mt-1 text-[clamp(2rem,4.5vw,3rem)] leading-tight font-bold text-white">{q ? <>“{q}”</> : "কী খুঁজছেন?"}</h1>
        {q && hits.length > 0 && <p className="mt-2 text-sm text-white/55">{bn(hits.length)}টি নিবন্ধ পাওয়া গেছে</p>}
      </header>
      {!q ? (
        <p className="text-[15px] text-white/65">ওপরের ঘরে বিষয়, লেখক, প্রতিষ্ঠান বা জেলার নাম লিখুন।</p>
      ) : hits.length === 0 ? (
        <div className="space-y-4 rounded-[1.75rem] bg-white/[0.04] p-6 text-[15px] text-white/70 ring-1 ring-white/10">
          <p>“<strong className="text-white">{q}</strong>” দিয়ে কোনো নিবন্ধ পাওয়া যায়নি। অন্য বানানে বা ছোট শব্দে চেষ্টা করুন — অথবা এ নিয়ে আপনিই প্রথম লিখুন।</p>
          <Link href="/research/submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-4 text-sm font-bold text-text-primary"><Icon name="upload_file" className="text-[18px]" /> গবেষণা প্রকাশ করুন</Link>
        </div>
      ) : (
        <ol className="divide-y divide-white/8 rounded-[1.75rem] bg-white/[0.03] ring-1 ring-white/10">
          {hits.map((a) => <li key={a.slug}><ArticleItem a={a} note={a.status === "review" ? " · আপনার জমা, পর্যালোচনায়" : undefined} /></li>)}
        </ol>
      )}
    </div>
  );
}
