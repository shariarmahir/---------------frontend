import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Hash, Laptop, PackageSearch, Rocket, Search, Sprout, Store, type LucideIcon } from "lucide-react";
import { SectionNav } from "@/components/media/market/section-nav";
import { BoardCard } from "@/components/media/market/board-card";
import { BoostBand, LogisticsBand } from "@/components/media/market/logistics";
import { ListingCard } from "@/components/media/market/listing-card";
import { MatchPanel } from "@/components/media/market/match-panel";
import { buyersFor, listingPick, modesOf, offersFrom, placeOf, postHit, postOffer, postPick, searchHit, sellersFor, trendingTags } from "@/components/media/market/matching";
import { MyListings } from "@/components/media/market/my-listings";
import { mediaButton } from "@/components/media/ui/button-styles";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { Num } from "@/components/media/ui/numerals";
import { PixelMark } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { boardPosts, MODES, SIDES, STAGES } from "@/data/media/bazaar";
import { isCategoryId } from "@/data/media/categories";
import { inPick, PICKS, SECTIONS, sectionById, type PickKey } from "@/data/media/market-sections";
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

type Params = { q?: string; c?: string; m?: string; s?: string; sort?: string; view?: string; side?: string; sec?: string; sub?: string; pick?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/market?${s}` : "/media/market";
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const sec = sp.sec && sectionById(sp.sec) ? sp.sec : undefined;
  const subId = sp.sub && (sectionById(sp.sec ?? "")?.subs.some((x) => x.id === sp.sub) ?? false) ? sp.sub : undefined;
  const pick = sp.pick && sp.pick in PICKS ? (sp.pick as PickKey) : undefined;
  const cat = sp.c && isCategoryId(sp.c) ? sp.c : undefined;
  const mode = sp.m && sp.m in MODES ? (sp.m as TradeMode) : undefined;
  const stage = sp.s && sp.s in STAGES ? (sp.s as SellerStage) : undefined;
  const sort = sorts.find((s) => s.key === sp.sort)?.key ?? "trust";
  const board = sp.view === "board";
  const side = sp.side && sp.side in SIDES ? (sp.side as BoardPost["side"]) : undefined;
  const keep = { q, c: cat, m: mode, s: stage, sort: sort === "trust" ? undefined : sort, view: board ? "board" : undefined, side, sec, sub: subId, pick };
  const browseKeep = { q, m: mode, s: stage, sort: sort === "trust" ? undefined : sort, view: board ? "board" : undefined, side, pick };
  // Boost only lifts a listing for someone already searching for it.
  const searching = Boolean(q || cat);

  const shown = listings
    .map((l) => ({ l, seller: personOrThrow(l.seller) }))
    .filter(({ l }) => (!cat || l.category === cat) && (!mode || modesOf(l).includes(mode)) && (!stage || l.stage === stage))
    .filter(({ l }) => !sec || placeOf(l).section.id === sec)
    .filter(({ l }) => !subId || placeOf(l).sub.id === subId)
    .filter(({ l }) => !pick || inPick(listingPick(l), pick))
    .filter(({ l, seller }) => searchHit(l, q, [seller.nameBn, seller.name, placeOf(l).sub.bn]))
    .sort((a, b) => {
      if (sort === "trust" && searching && Boolean(a.l.featured) !== Boolean(b.l.featured)) return a.l.featured ? -1 : 1;
      if (sort === "low") return a.l.price - b.l.price;
      if (sort === "high") return b.l.price - a.l.price;
      const ra = verifiedRatingFor(a.seller, a.l.skill);
      const rb = verifiedRatingFor(b.seller, b.l.skill);
      return rb.communityAvg * Math.log10(rb.raters + 1) - ra.communityAvg * Math.log10(ra.raters + 1);
    });

  const offers = offersFrom(listings, boardPosts);
  const posts = boardPosts
    .filter((p) => (!cat || p.category === cat) && (!mode || p.mode === mode))
    .filter((p) => !sec || placeOf(p).section.id === sec)
    .filter((p) => !subId || placeOf(p).sub.id === subId)
    .filter((p) => !pick || inPick(postPick(p), pick))
    .filter((p) => postHit(p, q, [placeOf(p).sub.bn]));
  const shownPosts = posts.filter((p) => !side || p.side === side);
  const stages = Object.keys(STAGES) as SellerStage[];
  const section = sec ? sectionById(sec) : undefined;
  // Sub-section counts for the open section (listings + board), so the chips and the browser agree.
  const subCount = (id: string) => listings.filter((l) => placeOf(l).sub.id === id).length + boardPosts.filter((p) => placeOf(p).sub.id === id).length;
  const sectionCount = (id: string) => listings.filter((l) => placeOf(l).section.id === id).length + boardPosts.filter((p) => placeOf(p).section.id === id).length;
  const allCounts = Object.fromEntries(SECTIONS.flatMap((s) => s.subs).map((x) => [x.id, subCount(x.id)]));
  const sectionCounts = Object.fromEntries(SECTIONS.map((s) => [s.id, sectionCount(s.id)]));
  const picks = (["direct", "organic", "export", "wholesale", "heritage", "brand"] as PickKey[]).filter((k) => listings.some((l) => inPick(listingPick(l), k)) || boardPosts.some((p) => inPick(postPick(p), k)));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero: the claim left, the four kinds of seller as colour fields right. */}
      <section className="live-in overflow-hidden rounded-3xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <h1 className="text-3xl font-bold tracking-tight text-balance text-m-ink sm:text-5xl sm:leading-[1.1]">
              যা আছে বিক্রি করুন, <span className="text-m-blue">যা দরকার চেয়ে নিন।</span>
            </h1>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-m-ink/80">
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
      </section>

      <MatchPanel />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="বাজারের দিক" className="flex gap-1 rounded-2xl bg-m-ink/6 p-1">
            {[
              { v: undefined, label: "বিক্রি হচ্ছে", n: shown.length },
              { v: "board", label: "চাহিদা বোর্ড", n: posts.length },
            ].map((t) => {
              const on = (t.v === "board") === board;
              return (
                <Link key={t.label} href={href({ ...keep, view: t.v, side: undefined })} scroll={false} aria-current={on ? "page" : undefined} className={cn("inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors", on ? "bg-m-yellow text-m-ink shadow-m-tile" : "text-m-ink/80 hover:text-m-ink")}>
                  {t.label}
                  <span className={cn("rounded-md px-1.5 text-xs", on ? "bg-m-card text-m-blue" : "bg-m-ink/6")}><Num value={t.n} /></span>
                </Link>
              );
            })}
          </nav>
          <nav aria-label="কেনাবেচার ধরন" className="flex gap-1 overflow-x-auto rounded-xl bg-m-ink/6 p-1 scrollbar-none">
            {[{ key: undefined, bn: "সব" }, ...(Object.keys(MODES) as TradeMode[]).map((key) => ({ key, bn: MODES[key].bn }))].map((m) => (
              <Link key={m.bn} href={href({ ...keep, m: m.key })} scroll={false} aria-current={mode === m.key ? "true" : undefined} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap", mode === m.key ? "bg-m-blue-soft text-m-ink" : "text-m-ink/80 hover:text-m-ink")}>
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
          {sec && <input type="hidden" name="sec" value={sec} />}
          {subId && <input type="hidden" name="sub" value={subId} />}
          {pick && <input type="hidden" name="pick" value={pick} />}
          <label className="relative block">
            <span className="sr-only">বাজারে খুঁজুন</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-m-ink/65" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="নাম বা হ্যাশট্যাগ: #নারকেল, coconut, জামদানি…"
              className="h-12 w-full rounded-2xl border border-m-ink/10 bg-m-card pr-4 pl-12 text-[15px] focus:border-m-blue focus:ring-3 focus:ring-m-blue/15 focus:outline-none shadow-m-tile"
            />
          </label>
        </form>

        <p className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-m-ink/65"><Hash className="size-3.5" aria-hidden />চলছে</span>
          {trendingTags(listings, boardPosts).map((t) => (
            <Link key={t} href={href({ ...keep, q: `#${t}` })} scroll={false} className={cn("rounded-full px-2.5 py-1 font-medium transition-colors", q === `#${t}` ? "bg-m-yellow text-m-ink" : "bg-m-ink/6 text-m-ink/80 hover:bg-m-ink/11 hover:text-m-ink")}>
              #{t}
            </Link>
          ))}
        </p>

        <SectionNav
          baseParams={{ ...keep, sec: undefined, sub: undefined }}
          sec={sec}
          sectionCounts={sectionCounts}
          browseQuery={new URLSearchParams(Object.entries(browseKeep).filter(([, v]) => v) as [string, string][]).toString()}
          counts={allCounts}
          current={subId}
        />

        {section && (
          <div className="-mx-3 max-w-full overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              {section.subs.map((x) => (
                <li key={x.id}>
                  <Link href={href({ ...keep, sub: subId === x.id ? undefined : x.id })} scroll={false} aria-current={subId === x.id ? "page" : undefined} className={chipClass(subId === x.id)}>
                    {x.bn}
                    {subCount(x.id) > 0 && <span className="text-[10px] opacity-70">(<Num value={subCount(x.id)} />)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {picks.length > 0 && (
          <div className="-mx-3 max-w-full overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
            <ul className="flex w-max gap-2">
              {picks.map((k) => (
                <li key={k}>
                  <Link href={href({ ...keep, pick: pick === k ? undefined : k })} scroll={false} aria-current={pick === k ? "page" : undefined} title={PICKS[k].hint} className={chipClass(pick === k)}>
                    {PICKS[k].bn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!board && (
          <nav aria-label="সাজান" className="flex gap-1 self-start rounded-xl bg-m-ink/6 p-1">
            {sorts.map((s) => (
              <Link key={s.key} href={href({ ...keep, sort: s.key === "trust" ? undefined : s.key })} scroll={false} aria-current={sort === s.key ? "true" : undefined} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap", sort === s.key ? "bg-m-yellow text-m-ink shadow-m-tile" : "text-m-ink/80 hover:text-m-ink")}>
                {s.label}
              </Link>
            ))}
          </nav>
        )}

        {board ? (
          <>
            {/* The board's two sides. */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(["sell", "buy"] as const).map((k) => {
                const on = side === k;
                const n = posts.filter((p) => p.side === k).length;
                return (
                  <div key={k} className={cn("flex items-center gap-3 rounded-2xl p-4 ring-2 transition-colors", on ? (k === "sell" ? "bg-m-blue-soft ring-m-blue" : "bg-m-yellow ring-m-blue") : "bg-m-card ring-m-ink/10")}>
                    <Link href={href({ ...keep, side: on ? undefined : k })} scroll={false} aria-current={on ? "true" : undefined} className={cn("min-w-0 flex-1", on && k === "buy" ? "text-m-ink" : "text-m-ink")}>
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
            {!q && !cat && !mode && !stage && !sec && !subId && !pick && <MyListings />}
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
