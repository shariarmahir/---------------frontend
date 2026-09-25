"use client";

import { useMediaState } from "@/lib/media/store";
import { currentUser } from "@/data/media/users";
import { PostCard } from "./post-card";

/** Posts the viewer created in this browser, newest first, above the feed. */
export function MyPosts() {
  const posts = useMediaState((s) => s.posts);
  const listings = useMediaState((s) => s.listings);
  if (posts.length === 0) return null;
  return (
    <>
      {posts.map((p) => (
        <div key={p.id} className="fade-in">
          <PostCard live post={p} author={currentUser} listing={listings.find((l) => l.id === p.listingId)} />
        </div>
      ))}
    </>
  );
}
