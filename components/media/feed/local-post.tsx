"use client";

import Link from "next/link";
import { currentUser } from "@/data/media/users";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { PostSkeleton } from "../ui/skeletons";
import { PostCard } from "./post-card";

/** A post created in this browser (not in the seeded data). */
export function LocalPost({ id }: { id: string }) {
  const hydrated = useHydrated();
  const post = useMediaState((s) => s.posts.find((p) => p.id === id));
  const listings = useMediaState((s) => s.listings);
  if (!hydrated) return <PostSkeleton />;
  if (!post)
    return (
      <EmptyState
        icon="posts"
        title="পোস্টটি পাওয়া যায়নি"
        body="হয়তো মুছে ফেলা হয়েছে, অথবা অন্য ব্রাউজারে তৈরি।"
        action={<Link href="/media" className={mediaButton({ variant: "outline" })}>ফিডে ফিরুন</Link>}
      />
    );
  return <PostCard live post={post} author={currentUser} listing={listings.find((l) => l.id === post.listingId)} full />;
}
