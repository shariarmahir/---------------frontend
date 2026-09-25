import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCategory } from "@/data/media/categories";
import type { Listing, Person } from "@/data/media/types";
import { verifiedRatingFor } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { MediaFrame } from "../ui/media-frame";
import { Compact, Num, Taka } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { IdSeal, Stars, StatusBadge } from "../ui/trust";
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-card-border bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-[border-color,box-shadow] duration-200 hover:border-bd-green/30 hover:shadow-[0_10px_28px_-16px_rgb(15_23_42/0.3)]">
      <div className="relative">
        <MediaFrame slot={{ ...listing.media, ratio: "4/3" }} rounded={false} sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw" />
        <span className="absolute top-2.5 left-2.5 rounded-full shadow-sm">
          <StatusBadge status={status} size="sm" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <span className="font-semibold text-bd-green">{cat.bn}</span>
          <span className="inline-flex items-center gap-0.5"><MapPin className="size-3.5" aria-hidden />{listing.location.split(",")[0]}</span>
        </p>
        <h3 className="text-[15px] leading-snug font-bold text-text-primary">
          <Link href={`/media/market/${listing.id}`} className="after:absolute after:inset-0 group-hover:text-bd-green focus-visible:outline-none">
            {listing.title}
          </Link>
        </h3>
        <p className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-text-primary"><Taka amount={listing.price} /></span>
          <span className="text-xs text-text-muted">/ {listing.unit}</span>
        </p>
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
          <PersonAvatar person={seller} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-text-primary">
              <span className="truncate">{seller.nameBn}</span>
              {seller.idVerified && <IdSeal size={14} />}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] whitespace-nowrap text-text-muted">
              {rating.raters > 0 ? (
                <>
                  <Stars value={rating.communityAvg} size={11} />
                  <span className="font-semibold text-text-secondary"><Num value={rating.communityAvg} decimals={1} /></span>
                  <span>(<Num value={rating.raters} /> জন যাচাই)</span>
                </>
              ) : (
                "এখনো যাচাই হয়নি"
              )}
            </span>
          </span>
        </div>
        <p className="text-[11px] text-text-muted">
          <Compact n={listing.sold} /> বার বিক্রি {listing.negotiable ? "· দরদাম চলে" : "· নির্ধারিত দাম"}
        </p>
        <div className="mt-auto">
          <TradeButtons listing={listing} band={cat.band} />
        </div>
      </div>
    </article>
  );
}
