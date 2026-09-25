import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { FollowButton } from "@/components/media/feed/post-actions";
import { ListingCard } from "@/components/media/market/listing-card";
import { EmptyState } from "@/components/media/ui/empty-state";
import { PageHeader } from "@/components/media/ui/layout";
import { MediaFrame } from "@/components/media/ui/media-frame";
import { Num } from "@/components/media/ui/numerals";
import { PersonLine } from "@/components/media/ui/person";
import { RatingPair, StatusBadge } from "@/components/media/ui/trust";
import { categories, getCategory } from "@/data/media/categories";
import { listings } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import type { Person } from "@/data/media/types";
import { people, personOrThrow } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "খুঁজুন" };

const tabs = [
  { key: "all", bn: "সব" },
  { key: "people", bn: "মানুষ" },
  { key: "posts", bn: "পোস্ট" },
  { key: "market", bn: "বাজার" },
] as const;
type Tab = (typeof tabs)[number]["key"];

function matches(needle: string, ...fields: (string | undefined)[]) {
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

/** A person's best-verified skill, for the result line. */
function topSkill(p: Person) {
  return [...p.skills].sort((a, b) => b.communityAvg * Math.log10(b.raters + 1) - a.communityAvg * Math.log10(a.raters + 1))[0];
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const tab: Tab = tabs.find((t) => t.key === sp.tab)?.key ?? "all";
  const needle = q.toLowerCase();

  const cats = categories.filter((c) => matches(needle, c.bn, c.en)).map((c) => c.id);
  const foundPeople = q
    ? people.filter((p) => matches(needle, p.nameBn, p.name, p.handle, p.headline, p.district, p.area, ...p.skills.map((s) => s.skill)) || p.categories.some((c) => cats.includes(c)))
    : [];
  const foundPosts = q ? posts.filter((p) => matches(needle, p.caption, p.skill.name, ...p.tags) || cats.includes(p.category)) : [];
  const foundListings = q ? listings.filter((l) => matches(needle, l.title, l.description, l.skill, l.location) || cats.includes(l.category)) : [];
  const counts: Record<Tab, number> = {
    all: foundPeople.length + foundPosts.length + foundListings.length,
    people: foundPeople.length,
    posts: foundPosts.length,
    market: foundListings.length,
  };
  const show = (t: Tab) => tab === "all" || tab === t;
  const href = (t: Tab) => `/media/search?${new URLSearchParams({ q, ...(t === "all" ? {} : { tab: t }) })}`;
  const suggestions = Array.from(new Set(posts.map((p) => p.skill.name))).slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="খুঁজুন" subtitle="দক্ষতা, মানুষ বা বিক্রির জিনিস — যাচাই করা দক্ষতা আগে দেখায়।" />

      <form action="/media/search" role="search" className="mb-5">
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <label className="relative block">
          <span className="sr-only">খুঁজুন</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            key={q}
            type="search"
            name="q"
            defaultValue={q}
            autoFocus={!q}
            enterKeyHint="search"
            placeholder="যেমন: নকশিকাঁথা, রান্না, আর্কিটেক্ট, জামালপুর…"
            className="h-12 w-full rounded-2xl border border-card-border bg-white pr-4 pl-12 text-[15px] focus:border-bd-green focus:ring-3 focus:ring-bd-green/15 focus:outline-none"
          />
        </label>
      </form>

      {!q ? (
        <section aria-labelledby="popular" className="rounded-2xl border border-card-border bg-white p-4 sm:p-6">
          <h2 id="popular" className="mb-3 text-base font-bold text-text-primary">জনপ্রিয় দক্ষতা</h2>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <Link
                  href={`/media/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-card-border px-3.5 text-sm font-medium text-text-secondary transition-colors hover:border-bd-green/40 hover:text-bd-green"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <nav aria-label="ফলাফলের ধরন" className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none]">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={href(t.key)}
                scroll={false}
                aria-current={tab === t.key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold whitespace-nowrap",
                  tab === t.key ? "bg-white text-bd-green shadow-[0_1px_2px_rgb(15_23_42/0.08)]" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t.bn}
                <span className="text-xs font-medium text-text-muted"><Num value={counts[t.key]} /></span>
              </Link>
            ))}
          </nav>

          {counts[tab] === 0 ? (
            <EmptyState
              icon="search"
              title={`“${q}” পাওয়া যায়নি`}
              body="বানান বদলে বা আরও সাধারণ শব্দে খুঁজুন — যেমন ‘রান্না’, ‘ডিজাইন’।"
              action={<Link href="/media/search" className="text-sm font-semibold text-bd-green hover:underline">নতুন করে খুঁজুন</Link>}
            />
          ) : (
            <div className="space-y-8">
              {show("people") && foundPeople.length > 0 && (
                <section aria-labelledby="r-people">
                  <h2 id="r-people" className="mb-3 text-base font-bold text-text-primary">মানুষ</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {foundPeople.map((p) => {
                      const s = topSkill(p);
                      return (
                        <li key={p.handle} className="flex items-center justify-between gap-3 rounded-2xl border border-card-border bg-white p-4">
                          <div className="min-w-0 space-y-2">
                            <PersonLine person={p} size="lg" meta={p.headline} />
                            {s && (
                              <p className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                <span className="font-semibold">{s.skill}</span>
                                <StatusBadge status={skillStatus(s.self, s.communityAvg, s.raters)} size="sm" />
                              </p>
                            )}
                          </div>
                          <FollowButton handle={p.handle} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {show("posts") && foundPosts.length > 0 && (
                <section aria-labelledby="r-posts">
                  <h2 id="r-posts" className="mb-3 text-base font-bold text-text-primary">দক্ষতার পোস্ট</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {foundPosts.map((p) => {
                      const a = personOrThrow(p.author);
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/media/post/${p.id}`}
                            className="flex gap-3 rounded-2xl border border-card-border bg-white p-3 transition-[border-color,box-shadow] hover:border-bd-green/35 hover:shadow-[0_6px_18px_-10px_rgb(15_23_42/0.25)]"
                          >
                            <MediaFrame bare slot={{ ...p.media[0], ratio: "1/1" }} className="w-24 shrink-0 self-start sm:w-28" sizes="112px" />
                            <span className="min-w-0 flex-1 space-y-1.5">
                              <span className="block text-sm font-bold text-text-primary">{p.skill.name}</span>
                              <span className="block truncate text-xs text-text-muted">{a.nameBn} · {getCategory(p.category).bn}</span>
                              <RatingPair self={p.skill.self} communityAvg={p.skill.communityAvg} raters={p.skill.raters} compact />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {show("market") && foundListings.length > 0 && (
                <section aria-labelledby="r-market">
                  <h2 id="r-market" className="mb-3 text-base font-bold text-text-primary">বাজার</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {foundListings.map((l) => (
                      <ListingCard key={l.id} listing={l} seller={personOrThrow(l.seller)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
