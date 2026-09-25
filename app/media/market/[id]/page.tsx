import type { Metadata } from "next";
import { ListingCard } from "@/components/media/market/listing-card";
import { ListingDetail } from "@/components/media/market/listing-detail";
import { LocalListing } from "@/components/media/market/local-listing";
import { getListing, listings } from "@/data/media/market";
import { posts } from "@/data/media/posts";
import { personOrThrow, verifiedRatingFor } from "@/data/media/users";

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const l = getListing((await params).id);
  return l ? { title: l.title, description: l.description } : { title: "বাজার" };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListing(id);
  // Not seeded: a listing the viewer made in this browser (or a dead link).
  if (!listing) return <LocalListing id={id} />;

  const seller = personOrThrow(listing.seller);
  const proof = posts.find((p) => p.listingId === listing.id);
  const more = listings.filter((l) => l.id !== listing.id && l.category === listing.category).slice(0, 3);

  return (
    <ListingDetail listing={listing} seller={seller} rating={verifiedRatingFor(seller, listing.skill)} proofHref={proof ? `/media/post/${proof.id}` : undefined}>
      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-text-primary">একই বিভাগে আরও</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {more.map((l) => (
              <ListingCard key={l.id} listing={l} seller={personOrThrow(l.seller)} />
            ))}
          </div>
        </section>
      )}
    </ListingDetail>
  );
}
