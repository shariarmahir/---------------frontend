"use client";

import { currentUser } from "@/data/media/users";
import { useMediaState } from "@/lib/media/store";
import { ListingCard } from "./listing-card";

/** Listings the viewer created from sellable posts, shown first. */
export function MyListings() {
  const mine = useMediaState((s) => s.listings);
  if (mine.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-bold text-text-primary">আপনার বিক্রির তালিকা</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mine.map((l) => (
          <ListingCard key={l.id} listing={l} seller={currentUser} />
        ))}
      </div>
    </section>
  );
}
