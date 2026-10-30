"use client";

import Link from "next/link";
import { currentUser } from "@/data/media/users";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingDetail } from "./listing-detail";

/** A listing created in this browser (not in the seeded data). */
export function LocalListing({ id }: { id: string }) {
  const hydrated = useHydrated();
  const listing = useMediaState((s) => s.listings.find((l) => l.id === id));
  const post = useMediaState((s) => s.posts.find((p) => p.listingId === id));
  if (!hydrated) return <Skeleton className="mx-auto h-[32rem] max-w-6xl rounded-2xl" />;
  if (!listing)
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon="market"
          title="তালিকাটি পাওয়া যায়নি"
          body="হয়তো সরিয়ে নেওয়া হয়েছে, অথবা অন্য ব্রাউজারে তৈরি।"
          action={<Link href="/media/market" className={mediaButton({ variant: "outline" })}>বাজারে ফিরুন</Link>}
        />
      </div>
    );
  return (
    <ListingDetail
      listing={listing}
      seller={currentUser}
      rating={{ self: post?.skill?.self ?? 0, communityAvg: 0, raters: 0 }}
      proofHref={post ? `/media/post/${post.id}` : undefined}
    />
  );
}
