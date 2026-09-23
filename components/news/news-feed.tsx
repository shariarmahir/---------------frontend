"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CategoryScroller } from "@/components/news/category-scroller";
import { NewsCard } from "@/components/news/news-card";
import { newsCategories, newsItems, type NewsCategory } from "@/data/news-feed";
import { cn } from "@/lib/utils";

/**
 * The main feed: category filter, lead stories, then the dense grid.
 *
 * Filtering happens client-side over the placeholder set. Once the
 * aggregation API exists this becomes a query parameter instead.
 */
/**
 * Hash views the section nav links to, mapped onto the feed's own
 * categories. `crime-accused` and `crime-place` are the intended cuts by
 * accused person and by incident location; the placeholder records carry
 * neither field yet, so for now all three resolve to the crime set rather
 * than to an empty feed that would look broken.
 */
const HASH_VIEWS: Record<string, NewsCategory> = {
  crime: "crime",
  "crime-accused": "crime",
  "crime-place": "crime",
};

function viewFromHash(): NewsCategory | null {
  if (typeof window === "undefined") return null;
  const view = window.location.hash.match(/^#feed=(.+)$/)?.[1];
  return view ? (HASH_VIEWS[view] ?? null) : null;
}

export function NewsFeed() {
  const [active, setActive] = useState<NewsCategory | "all">("all");

  // The section nav drives the filter through the hash, so the same link
  // works from another page as well as from this one. `hashchange` covers
  // clicks made while already here, where no navigation occurs.
  useEffect(() => {
    const sync = () => {
      const view = viewFromHash();
      if (view) setActive(view);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const items = useMemo(
    () =>
      [...newsItems]
        .filter((n) => active === "all" || n.category === active)
        .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [active],
  );

  const leads = items.filter((n) => n.lead).slice(0, 3);
  const rest = items.filter((n) => !leads.includes(n));

  const countFor = (id: NewsCategory) =>
    newsItems.filter((n) => n.category === id).length;

  return (
    <section
      id="feed"
      className="w-full border-b border-border bg-white px-gutter py-space-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-lg">
        {/* Category filter. */}
        <CategoryScroller label="Filter by category" activeKey={active}>
          <button
            type="button"
            onClick={() => setActive("all")}
            aria-pressed={active === "all"}
            className={cn(
              "shrink-0 rounded-lg border px-space-md py-1.5 font-sans text-[0.8125rem] font-semibold transition-colors",
              active === "all"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
            )}
          >
            All news
            <span className="ml-1.5 text-[0.75rem] opacity-70">
              {newsItems.length}
            </span>
          </button>

          {newsCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              aria-pressed={active === c.id}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg border px-space-md py-1.5 font-sans text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                active === c.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-border bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
              )}
            >
              <Icon name={c.icon} className="text-[14px]" />
              {c.label}
              <span className="text-[0.75rem] opacity-70">
                {countFor(c.id)}
              </span>
            </button>
          ))}
        </CategoryScroller>

        {items.length === 0 ? (
          <p className="py-space-xl text-center font-sans text-body-md text-slate-500">
            No reports in this category yet.
          </p>
        ) : null}

        {/* Lead stories. */}
        {leads.length > 0 ? (
          <div className="grid grid-cols-1 gap-space-lg border-b border-border pb-space-lg lg:grid-cols-12">
            <div className="lg:col-span-7 lg:border-r lg:border-border lg:pr-space-lg">
              <NewsCard item={leads[0]} size="lead" />
            </div>
            <div className="flex flex-col gap-space-md lg:col-span-5">
              {leads.slice(1).map((n) => (
                <NewsCard key={n.id} item={n} size="standard" />
              ))}
            </div>
          </div>
        ) : null}

        {/* Dense grid. */}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-gutter gap-y-space-md sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((n) => (
              <NewsCard key={n.id} item={n} size="standard" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
