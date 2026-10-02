import Link from "next/link";
import { Leaf, MapPin } from "lucide-react";
import { STAGES } from "@/data/media/bazaar";
import { getCategory } from "@/data/media/categories";
import type { Listing, Person } from "@/data/media/types";
import { verifiedRatingFor } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { MediaFrame } from "../ui/media-frame";
import { Compact, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { IdSeal, Stars, StatusBadge } from "../ui/trust";
import { tagsOf } from "./matching";
import { TradeButtons } from "./trade";

/**
 * Listing card: thumbnail, price, and the seller's community-verified
 * rating for the skill behind the listing — the reason to trust the buy.
 */
export function ListingCard({ listing, seller }: { listing: Listing; seller: Person }) {
  const cat = getCategory(listing.category);
  const rating = verifiedRatingFor(seller, listing.skill);
  const status = skillStatus(rating.self, rating.communityAvg, rating.raters);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-text-primary story-reveal transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_44px_-26px_var(--color-signal-orange)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative">
        <MediaFrame slot={{ ...listing.media, ratio: "4/3" }} rounded={false} sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw" />
        <span className="absolute top-2.5 left-2.5 rounded-full shadow-sm">
          <StatusBadge status={status} size="sm" />
        </span>
        <span className="absolute top-2.5 right-2.5 flex gap-1.5">
          {listing.organic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bd-green px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"><Leaf className="size-3" aria-hidden />বিষমুক্ত</span>
          )}
          {listing.featured && (
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-signal-orange shadow-sm" title="ম্যাচ বুস্ট: যাঁরা এটাই খুঁজছেন, তাঁদের আগে দেখায়">
              বুস্টেড
            </span>
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="flex items-center justify-between gap-2 text-xs text-white/65">
          <span className="truncate font-semibold text-signal-orange">
            {listing.customCategory ?? cat.bn}
            {listing.stage && <span className="font-normal text-white/65"> · {STAGES[listing.stage].bn}</span>}
          </span>
          <span className="inline-flex items-center gap-0.5"><MapPin className="size-3.5" aria-hidden />{listing.location.split(",")[0]}</span>
        </p>
        <h3 className="text-[15px] leading-snug font-bold text-white">
          <Link href={`/media/market/${listing.id}`} className="after:absolute after:inset-0 group-hover:text-signal-orange focus-visible:outline-none">
            {listing.title}
          </Link>
        </h3>
        <p className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white"><Taka amount={listing.price} /></span>
          <span className="text-xs text-white/65">/ {listing.unit}</span>
          {listing.tiers?.length ? (
            <span className="ml-auto rounded-md bg-bd-green px-1.5 py-0.5 text-[11px] font-semibold text-white">
              পাইকারি <Taka amount={Math.min(...listing.tiers.map((t) => t.price))} /> থেকে
            </span>
          ) : null}
        </p>
        <ul className="relative z-10 flex flex-wrap gap-1.5">
          {tagsOf(listing).slice(0, 3).map((t) => (
            <li key={t}>
              <Link href={`/media/market?q=%23${encodeURIComponent(t)}`} className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/80 hover:bg-signal-orange hover:text-text-primary">
                #{t}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
          <PersonAvatar person={seller} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-white">
              <span className="truncate">{seller.nameBn}</span>
              {seller.idVerified && <IdSeal size={14} />}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] whitespace-nowrap text-white/65">
              {rating.raters > 0 ? (
                <>
                  <Stars value={rating.communityAvg} size={11} />
                  <span className="font-semibold text-white/80"><Num value={rating.communityAvg} decimals={1} /></span>
                  <span>(<Num value={rating.raters} /> জন যাচাই)</span>
                </>
              ) : (
                "এখনো যাচাই হয়নি"
              )}
            </span>
          </span>
        </div>
        <p className="text-[11px] text-white/65">
          <Compact n={listing.sold} /> বার বিক্রি
          {listing.stock !== undefined && <> · <Num value={listing.stock} /> {listing.unit} আছে</>}
          {listing.negotiable ? " · দরদাম চলে" : " · নির্ধারিত দাম"}
        </p>
        <div className="mt-auto">
          <TradeButtons listing={listing} band={cat.band} />
        </div>
      </div>
    </article>
  );
}
