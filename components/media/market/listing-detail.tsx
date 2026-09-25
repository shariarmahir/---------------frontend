import Link from "next/link";
import { CircleCheck, Lock, MapPin, Truck } from "lucide-react";
import { getCategory } from "@/data/media/categories";
import type { Listing, Person, SkillRating } from "@/data/media/types";
import { PageHeader, Panel } from "../ui/layout";
import { MediaFrame } from "../ui/media-frame";
import { Compact, Num, Taka } from "../ui/numerals";
import { PersonLine } from "../ui/person";
import { RatingPair } from "../ui/trust";
import { BuyerFees, TradeButtons } from "./trade";

const deliveryBn = { home: "বাসায় ডেলিভারি", courier: "কুরিয়ার", pickup: "নিজে নিয়ে যান", digital: "ডিজিটাল", onsite: "বাসায় এসে সেবা" } as const;

/** A listing's page body — shared by seeded listings and ones made in this browser. */
export function ListingDetail({
  listing,
  seller,
  rating,
  proofHref,
  children,
}: {
  listing: Listing;
  seller: Person;
  rating: Pick<SkillRating, "self" | "communityAvg" | "raters">;
  proofHref?: string;
  /** Extra sections below the main grid. */
  children?: React.ReactNode;
}) {
  const cat = getCategory(listing.category);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={listing.title} back={{ href: "/media/market", label: "বাজার" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <MediaFrame slot={{ ...listing.media, ratio: "16/9" }} priority sizes="(min-width: 1024px) 720px, 100vw" />
          <Panel>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              <span className="font-semibold text-bd-green">{cat.bn}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{listing.location}</span>
              <span><Compact n={listing.sold} /> বার বিক্রি</span>
            </p>
            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-text-primary">{listing.description}</p>
            {listing.highlights.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {listing.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1.5 text-sm text-text-secondary">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-bd-green" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex flex-wrap gap-2">
              {listing.delivery.map((d) => (
                <span key={d} className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-2.5 py-1 text-xs font-medium text-text-secondary">
                  <Truck className="size-3.5" aria-hidden />
                  {deliveryBn[d]}
                </span>
              ))}
            </p>
          </Panel>
          <Panel title="বিক্রেতার দক্ষতা — কেন বিশ্বাস করবেন">
            <PersonLine person={seller} size="lg" meta={seller.headline} />
            <p className="mt-4 mb-2 text-sm font-semibold text-text-primary">{listing.skill}</p>
            <RatingPair self={rating.self} communityAvg={rating.communityAvg} raters={rating.raters} />
            {proofHref && (
              <Link href={proofHref} className="mt-4 inline-flex text-sm font-semibold text-bd-green hover:underline">
                এই কাজের প্রমাণ-পোস্ট ও আলোচনা দেখুন →
              </Link>
            )}
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel>
            <p className="text-3xl font-bold text-text-primary">
              <Taka amount={listing.price} />
            </p>
            <p className="text-sm text-text-muted">
              {listing.unit} · {listing.negotiable ? "দরদাম চলে" : "নির্ধারিত দাম"}
            </p>
            <BuyerFees price={listing.price} className="mt-4" />
            <div className="mt-4">
              <TradeButtons listing={listing} band={cat.band} size="lg" stacked />
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs text-text-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                টাকা এসক্রোতে থাকে; পণ্য বা সেবা বুঝে পেয়ে নিশ্চিত করলে বিক্রেতা পান। <Num value={7} /> দিনের মধ্যে সমস্যা জানালে মধ্যস্থতা।
              </span>
            </p>
          </Panel>
        </aside>
      </div>
      {children}
    </div>
  );
}
