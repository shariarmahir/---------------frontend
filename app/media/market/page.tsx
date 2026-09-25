import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Percent, Search, ShieldCheck } from "lucide-react";
import { ListingCard } from "@/components/media/market/listing-card";
import { MyListings } from "@/components/media/market/my-listings";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { PageHeader } from "@/components/media/ui/layout";
import { categories, isCategoryId } from "@/data/media/categories";
import { listings } from "@/data/media/market";
import { personOrThrow, verifiedRatingFor } from "@/data/media/users";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "বাজার" };

const sorts = [
  { key: "trust", label: "সবচেয়ে যাচাইকৃত" },
  { key: "low", label: "দাম: কম থেকে" },
  { key: "high", label: "দাম: বেশি থেকে" },
] as const;

type Params = { q?: string; c?: string; sort?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/market?${s}` : "/media/market";
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const cat = sp.c && isCategoryId(sp.c) ? sp.c : undefined;
  const sort = sorts.find((s) => s.key === sp.sort)?.key ?? "trust";

  const needle = q.toLowerCase();
  const shown = listings
    .map((l) => ({ l, seller: personOrThrow(l.seller) }))
    .filter(({ l }) => !cat || l.category === cat)
    .filter(({ l, seller }) => !needle || [l.title, l.description, l.skill, seller.nameBn, seller.name, l.location].some((f) => f.toLowerCase().includes(needle)))
    .sort((a, b) => {
      if (sort === "low") return a.l.price - b.l.price;
      if (sort === "high") return b.l.price - a.l.price;
      const ra = verifiedRatingFor(a.seller, a.l.skill);
      const rb = verifiedRatingFor(b.seller, b.l.skill);
      return rb.communityAvg * Math.log10(rb.raters + 1) - ra.communityAvg * Math.log10(ra.raters + 1);
    });

  const usedCats = categories.filter((c) => listings.some((l) => l.category === c.id));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="বাজার"
        subtitle="যাঁর দক্ষতা কমিউনিটি যাচাই করেছে, তাঁর কাছ থেকে সরাসরি কিনুন — হাতের কাজ, রান্না, নকশা, গান, সেবা।"
        actions={
          <Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>
            বিক্রি করুন
          </Link>
        }
      />

      <form action="/media/market" role="search" className="mb-4">
        {cat && <input type="hidden" name="c" value={cat} />}
        <label className="relative block">
          <span className="sr-only">বাজারে খুঁজুন</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="যেমন: নকশিকাঁথা, মেহেদি, বাড়ির নকশা…"
            className="h-12 w-full rounded-2xl border border-card-border bg-white pr-4 pl-12 text-[15px] focus:border-bd-green focus:ring-3 focus:ring-bd-green/15 focus:outline-none"
          />
        </label>
      </form>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-3 max-w-full overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2">
            {[{ id: undefined, bn: "সব" }, ...usedCats].map((c) => {
              const on = (c.id ?? null) === (cat ?? null);
              return (
                <li key={c.id ?? "all"}>
                  <Link
                    href={href({ q, c: c.id, sort: sort === "trust" ? undefined : sort })}
                    scroll={false}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                      on ? "border-bd-green bg-bd-green text-white" : "border-card-border bg-white text-text-secondary hover:border-bd-green/40 hover:text-bd-green",
                    )}
                  >
                    {c.bn}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <nav aria-label="সাজান" className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {sorts.map((s) => (
            <Link
              key={s.key}
              href={href({ q, c: cat, sort: s.key === "trust" ? undefined : s.key })}
              scroll={false}
              aria-current={sort === s.key ? "true" : undefined}
              className={cn(
                "inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap",
                sort === s.key ? "bg-white text-bd-green shadow-[0_1px_2px_rgb(15_23_42/0.08)]" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>

      <ul className="mb-6 grid gap-2 text-sm sm:grid-cols-3">
        <li className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2.5 text-text-secondary"><ShieldCheck className="size-4.5 shrink-0 text-bd-green" aria-hidden />প্রতিটি বিক্রেতা এনআইডি যাচাইকৃত</li>
        <li className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2.5 text-text-secondary"><Lock className="size-4.5 shrink-0 text-bd-green" aria-hidden />টাকা এসক্রোতে, বুঝে পেলে ছাড়</li>
        <li className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2.5 text-text-secondary"><Percent className="size-4.5 shrink-0 text-bd-green" aria-hidden />ফি খোলাখুলি: বিক্রেতা ৫%, ক্রেতা ৫%</li>
      </ul>

      {!q && !cat && <MyListings />}

      {shown.length === 0 ? (
        <EmptyState
          icon="search"
          title={q ? `“${q}” পাওয়া যায়নি` : "এই বিভাগে এখনো কিছু নেই"}
          body="অন্য শব্দে খুঁজুন বা সব বিভাগ দেখুন।"
          action={<Link href="/media/market" className={mediaButton({ variant: "outline" })}>সব দেখুন</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ l, seller }) => (
            <ListingCard key={l.id} listing={l} seller={seller} />
          ))}
        </div>
      )}
    </div>
  );
}
