"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth/client";
import type { Article } from "@/lib/research/core";
import { useLibrary, useResearch } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { ArticleView } from "./article-view";
import { ContentView } from "./content-view";
import { BTN, BTN_GOLD, COLUMN, H1, PANEL } from "./kit";

function Missing({ slug }: { slug: string }) {
  return (
    <div className={cn(COLUMN, "py-14")}>
      <div className={cn(PANEL, "hero-rise max-w-2xl p-8")}>
        <h1 className={H1}>This item is not available</h1>
        <p className="mt-4 text-base leading-relaxed text-white/80">The link may be wrong, or the work may still be in review. Until reviewers publish it, only its author can see it.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/research/search?q=${encodeURIComponent(slug.replace(/-/g, " "))}`} className={BTN}><Icon name="search" className="text-xl" /> Search for it</Link>
          <Link href="/research/submit" className={BTN_GOLD}><Icon name="upload_file" className="text-xl" /> Upload research on it</Link>
        </div>
      </div>
    </div>
  );
}

/** A work that is not in the shipped library: the viewer's own submission, read from this browser. */
function Own({ slug, render }: { slug: string; render: (a: Article) => React.ReactNode }) {
  const { ready } = useAuth();
  // Through the library list, so the work comes with its tracking number.
  const mine = useResearch((s) => s.mine);
  const list = useLibrary();
  const article = mine.some((a) => a.slug === slug) ? list.find((a) => a.slug === slug) : undefined;
  if (article) return render(article);
  if (!ready) return <div className={cn(COLUMN, "py-10")}><div className="h-96 animate-pulse rounded-3xl bg-bdnavy-900 motion-reduce:animate-none" aria-label="Loading" /></div>;
  return <Missing slug={slug} />;
}

export const OwnArticle = ({ slug }: { slug: string }) => <Own slug={slug} render={(a) => <ArticleView a={a} />} />;

export const OwnContent = ({ slug }: { slug: string }) => <Own slug={slug} render={(a) => <ContentView a={a} />} />;
