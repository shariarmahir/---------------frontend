"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import { useResearch } from "@/lib/research/store";
import { ArticleView } from "./article-view";

/** An article that is not a sample: the viewer's own submission, read from this browser. */
export function OwnArticle({ slug }: { slug: string }) {
  const { ready } = useAuth();
  const article = useResearch((s) => s.mine.find((a) => a.slug === slug));
  if (article) return <ArticleView a={article} />;
  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-white/5" aria-label="লোড হচ্ছে" />;
  return (
    <div className="rounded-3xl bg-paper p-8 text-text-primary">
      <h1 className="font-wiki text-3xl font-bold">এই নামে কোনো নিবন্ধ নেই</h1>
      <p className="mt-3 text-[15px] text-text-secondary">লিংকটি ভুল হতে পারে, অথবা নিবন্ধটি এখনো পর্যালোচনায় আছে — পর্যালোচনার আগে শুধু লেখক নিজে দেখতে পান।</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/research/search?q=${encodeURIComponent(decodeURIComponent(slug).replace(/-/g, " "))}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-text-primary px-4 text-sm font-bold text-signal-orange"><Icon name="search" className="text-[18px]" /> এই নামে খুঁজুন</Link>
        <Link href="/research/submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-signal-orange px-4 text-sm font-bold text-text-primary"><Icon name="upload_file" className="text-[18px]" /> এ নিয়ে লিখুন</Link>
      </div>
    </div>
  );
}
