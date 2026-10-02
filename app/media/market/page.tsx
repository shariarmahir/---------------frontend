import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Hash, Laptop, PackageSearch, Rocket, Search, ShieldCheck, Sprout, Store, type LucideIcon } from "lucide-react";
import { BoardCard } from "@/components/media/market/board-card";
import { BoostBand, LogisticsBand } from "@/components/media/market/logistics";
import { ListingCard } from "@/components/media/market/listing-card";
import { MatchPanel } from "@/components/media/market/match-panel";
import { buyersFor, districtOf, modesOf, offersFrom, postHit, postOffer, searchHit, sellersFor, trendingTags } from "@/components/media/market/matching";
import { MyListings } from "@/components/media/market/my-listings";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { Num } from "@/components/media/ui/numerals";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { boardPosts, MODES, SIDES, STAGES } from "@/data/media/bazaar";
import { categories, isCategoryId } from "@/data/media/categories";
import { listings } from "@/data/media/market";
import type { BoardPost } from "@/data/media/types";
import { personOrThrow, verifiedRatingFor } from "@/data/media/users";
import type { SellerStage, TradeMode } from "@/lib/media/bazaar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "বাজার" };

const STAGE_ICON: Record<SellerStage, LucideIcon> = { solo: Sprout, new: Rocket, freelance: Laptop, running: Building2 };

const sorts = [
  { key: "trust", label: "সবচেয়ে যাচাইকৃত" },
  { key: "low", label: "দাম: কম থেকে" },
  { key: "high", label: "দাম: বেশি থেকে" },
] as const;

type Params = { q?: string; c?: string; m?: string; s?: string; sort?: string; view?: string; side?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/market?${s}` : "/media/market";
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const cat = sp.c && isCategoryId(sp.c) ? sp.c : undefined;
  const mode = sp.m && sp.m in MODES ? (sp.m as TradeMode) : undefined;
  const stage = sp.s && sp.s in STAGES ? (sp.s as SellerStage) : undefined;
  const sort = sorts.find((s) => s.key === sp.sort)?.key ?? "trust";
  const board = sp.view === "board";
  const side = sp.side && sp.side in SIDES ? (sp.side as BoardPost["side"]) : undefined;
  const keep = { q, c: cat, m: mode, s: stage, sort: sort === "trust" ? undefined : sort, view: board ? "board" : undefined, side };
  // Boost only lifts a listing for someone already searching for it.
  const searching = Boolean(q || cat);

  const shown = listings
    .map((l) => ({ l, seller: personOrThrow(l.seller) }))
    .filter(({ l }) => (!cat || l.category === cat) && (!mode || modesOf(l).includes(mode)) && (!stage || l.stage === stage))
    .filter(({ l, seller }) => searchHit(l, q, [seller.nameBn, seller.name]))
    .sort((a, b) => {
      if (sort === "trust" && searching && Boolean(a.l.featured) !== Boolean(b.l.featured)) return a.l.featured ? -1 : 1;
      if (sort === "low") return a.l.price - b.l.price;
      if (sort === "high") return b.l.price - a.l.price;
      const ra = verifiedRatingFor(a.seller, a.l.skill);
      const rb = verifiedRatingFor(b.seller, b.l.skill);
      return rb.communityAvg * Math.log10(rb.raters + 1) - ra.communityAvg * Math.log10(ra.raters + 1);
    });

  const offers = offersFrom(listings, boardPosts);
  const posts = boardPosts.filter((p) => (!cat || p.category === cat) && (!mode || p.mode === mode) && postHit(p, q));
  const shownPosts = posts.filter((p) => !side || p.side === side);
  const matchCount = boardPosts.filter((p) => p.side === "buy").reduce((n, p) => n + sellersFor(p, offers).length, 0);
  const usedCats = categories.filter((c) => listings.some((l) => l.category === c.id) || boardPosts.some((p) => p.category === c.id));
  const stages = Object.keys(STAGES) as SellerStage[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero: the claim left, the four kinds of seller as colour fields right. */}
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <p className="inline-flex items-center gap-2 rounded-full bg-signal-orange px-3 py-1 text-xs font-bold text-text-primary">
              <ShieldCheck className="size-4" aria-hidden /> বাজার · শুধু বৈধ পণ্য ও সেবা
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
              যা আছে বিক্রি করুন, <span className="text-signal-orange">যা দরকার চেয়ে নিন।</span>
            </h1>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-white/80">
              কৃষকের ২০টি নারকেল থেকে আড়তের টনের চালান, নকশিকাঁথা থেকে আইনি পরামর্শ। হ্যাশট্যাগ দিন — ক্রেতা আর বিক্রেতা নিজেরাই মিলে যায়, বিজ্ঞাপন লাগে না।
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/media/market/new" className={mediaButton({ variant: "primary", size: "lg" })}><Store aria-hidden /> সরাসরি বিক্রি</Link>
              <Link href="/media/market/board/new" className={mediaButton({ variant: "outline", size: "lg" })}><PackageSearch aria-hidden /> চাহিদা বোর্ডে পোস্ট</Link>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {stages.map((key, i) => {
              const s = surfaceAt(i);
              const Icon = STAGE_ICON[key];
              return (
                <li key={key}>
                  <Link href={href({ ...keep, s: stage === key ? undefined : key, view: undefined, side: undefined })} scroll={false} style={glowStyle(s.glow)} aria-current={stage === key ? "page" : undefined} className={cn("flex h-full flex-col gap-3 rounded-2xl p-4", s.card, LIFT, stage === key && "ring-2 ring-white")}>
                    <span className={cn("flex size-10 items-center justify-center rounded-xl", s.tile)}><Icon className="size-5" aria-hidden /></span>
                    <span>
                      <span className="block font-bold">{STAGES[key].bn}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed opacity-80">{STAGES[key].hint}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {[
              { label: "পণ্য ও সেবা", value: listings.length },
              { label: "বোর্ডে পোস্ট", value: boardPosts.length },
              { label: "জেলা", value: new Set(listings.map(districtOf)).size },
              { label: "এখনকার অটো-মিল", value: matchCount },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-4 text-center">
                <dt className="text-xs text-white/65">{s.label}</dt>
                <dd className="text-2xl font-bold text-signal-orange"><Num value={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <MatchPanel />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="বাজারের দিক" className="flex gap-1 rounded-2xl bg-white/10 p-1">
            {[
              { v: undefined, label: "বিক্রি হচ্ছে", n: shown.length },
              { v: "board", label: "চাহিদা বোর্ড", n: posts.length },
            ].map((t) => {
              const on = (t.v === "board") === board;
              return (
                <Link key={t.label} href={href({ ...keep, view: t.v, side: undefined })} scroll={false} aria-current={on ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors", on ? "bg-signal-orange text-text-primary shadow-tile" : "text-white/80 hover:text-white")}>
                  {t.label}
                  <span className={cn("rounded-md px-1.5 text-xs", on ? "bg-text-primary text-signal-orange" : "bg-white/10")}><Num value={t.n} /></span>
                </Link>
              );
            })}
          </nav>
          <nav aria-label="কেনাবেচার ধরন" className="flex gap-1 overflow-x-auto rounded-xl bg-white/10 p-1 scrollbar-none">
            {[{ key: undefined, bn: "সব" }, ...(Object.keys(MODES) as TradeMode[]).map((key) => ({ key, bn: MODES[key].bn }))].map((m) => (
              <Link key={m.bn} href={href({ ...keep, m: m.key })} scroll={false} aria-current={mode === m.key ? "true" : undefined} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap", mode === m.key ? "bg-bd-green text-white" : "text-white/80 hover:text-white")}>
                {m.bn}
              </Link>
            ))}
          </nav>
        </div>

        <form action="/media/market" role="search">
          {cat && <input type="hidden" name="c" value={cat} />}
          {mode && <input type="hidden" name="m" value={mode} />}
          {board && <input type="hidden" name="view" value="board" />}
          {side && <input type="hidden" name="side" value={side} />}
          <label className="relative block">
            <span className="sr-only">বাজারে খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/65" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="নাম বা হ্যাশট্যাগ: #নারকেল, coconut, জামদানি…"
              className="h-12 w-full rounded-2xl border border-white/12 bg-text-primary pr-4 pl-12 text-[15px] focus:border-signal-orange focus:ring-3 focus:ring-signal-orange/15 focus:outline-none"
            />
          </label>
        </form>

        <p className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-white/65"><Hash className="size-3.5" aria-hidden />চলছে</span>
          {trendingTags(listings, boardPosts).map((t) => (
            <Link key={t} href={href({ ...keep, q: `#${t}` })} scroll={false} className={cn("rounded-full px-2.5 py-1 font-medium transition-colors", q === `#${t}` ? "bg-signal-orange text-text-primary" : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white")}>
              #{t}
            </Link>
          ))}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="-mx-3 max-w-full overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              {[{ id: undefined, bn: "সব বিভাগ" }, ...usedCats].map((c) => (
                <li key={c.id ?? "all"}>
                  <Link href={href({ ...keep, c: c.id })} scroll={false} aria-current={cat === c.id ? "page" : undefined} className={chipClass(cat === c.id)}>
                    {c.bn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {!board && (
            <nav aria-label="সাজান" className="flex gap-1 rounded-xl bg-white/10 p-1">
              {sorts.map((s) => (
                <Link key={s.key} href={href({ ...keep, sort: s.key === "trust" ? undefined : s.key })} scroll={false} aria-current={sort === s.key ? "true" : undefined} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap", sort === s.key ? "bg-signal-orange text-text-primary shadow-tile" : "text-white/80 hover:text-white")}>
                  {s.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {board ? (
          <>
            {/* The board's two sides. */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(["sell", "buy"] as const).map((k) => {
                const on = side === k;
                const n = posts.filter((p) => p.side === k).length;
                return (
                  <div key={k} className={cn("flex items-center gap-3 rounded-2xl p-4 ring-2 transition-colors", on ? (k === "sell" ? "bg-bd-green ring-bd-green" : "bg-signal-orange ring-signal-orange") : "bg-text-primary ring-white/12")}>
                    <Link href={href({ ...keep, side: on ? undefined : k })} scroll={false} aria-current={on ? "true" : undefined} className={cn("min-w-0 flex-1", on && k === "buy" ? "text-text-primary" : "text-white")}>
                      <span className="block text-lg font-bold">{SIDES[k].bn} <span className="text-sm font-semibold opacity-75">(<Num value={n} />)</span></span>
                      <span className="text-xs opacity-80">{SIDES[k].hint}</span>
                    </Link>
                    <Link href={`/media/market/board/new?side=${k}`} className={mediaButton({ variant: on ? "quiet" : k === "sell" ? "green" : "primary", size: "sm" })}>
                      পোস্ট দিন
                    </Link>
                  </div>
                );
              })}
            </div>
            {shownPosts.length === 0 ? (
              <EmptyState icon="search" title="এমন পোস্ট এখনো নেই" body="যা বিক্রি করতে চান বা কিনতে চান, বোর্ডে দিন — মিলে গেলে অন্য পক্ষ নিজেই আসবে।" action={<Link href="/media/market/board/new" className={mediaButton({ variant: "primary" })}>বোর্ডে পোস্ট দিন</Link>} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shownPosts.map((p) => (
                  <div key={p.id} id={p.id} className="scroll-mt-24">
                    <BoardCard post={p} author={personOrThrow(p.author)} sellers={p.side === "buy" ? sellersFor(p, offers) : []} buyers={p.side === "sell" ? buyersFor(postOffer(p), boardPosts) : []} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {!q && !cat && !mode && !stage && <MyListings />}
            {shown.length === 0 ? (
              <EmptyState
                icon="search"
                title={q ? `“${q}” পাওয়া যায়নি` : "এখানে এখনো কিছু নেই"}
                body="অন্য শব্দ বা হ্যাশট্যাগে খুঁজুন, নয়তো চাহিদা বোর্ডে পোস্ট দিন — বিক্রেতা এলে অটো-মিল জানাবে।"
                action={<Link href="/media/market/board/new" className={mediaButton({ variant: "outline" })}>চাহিদা বোর্ডে পোস্ট</Link>}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map(({ l, seller }) => (
                  <ListingCard key={l.id} listing={l} seller={seller} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <LogisticsBand />
      <BoostBand />
    </div>
  );
}
