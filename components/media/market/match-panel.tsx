"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { boardPosts } from "@/data/media/bazaar";
import { listings } from "@/data/media/market";
import { currentUser, personOrThrow } from "@/data/media/users";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { Num } from "../ui/numerals";
import { BoardCard } from "./board-card";
import { buyersFor, listingOffer, offersFrom, postOffer, sellersFor } from "./matching";

/**
 * The viewer's side of auto-match: buyers on the board for their listings,
 * and the other side of the board for their own posts.
 */
export function MatchPanel() {
  const hydrated = useHydrated();
  const mine = useMediaState((s) => s.listings);
  const myPosts = useMediaState((s) => s.board);
  if (!hydrated || (mine.length === 0 && myPosts.length === 0)) return null;

  const posts = [...boardPosts, ...myPosts];
  const offers = offersFrom([...listings, ...mine], posts);
  const buyers = mine.flatMap((l) => buyersFor(listingOffer(l), posts).map((m) => ({ ...m, listing: l })));

  return (
    <section className="live-in space-y-4 rounded-3xl bg-m-blue-soft p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-m-ink">
        <Sparkles className="size-5 text-m-blue" aria-hidden /> আপনার জন্য অটো-মিল
      </h2>
      {mine.length > 0 &&
        (buyers.length === 0 ? (
          <p className="text-sm text-m-ink/85">আপনার পণ্যের সাথে বোর্ডের কোনো ক্রেতা এখনো মেলেনি। হ্যাশট্যাগ বাড়ালে মিলের সম্ভাবনা বাড়ে।</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {buyers.map((m) => (
              <li key={m.post.id + m.listing.id} className="flex items-center gap-3 rounded-2xl bg-m-card p-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-m-yellow text-sm font-bold text-m-ink"><Num value={m.score} />%</span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-semibold text-m-ink">{personOrThrow(m.post.author).nameBn} কিনতে চান: {m.post.title}</span>
                  <span className="block truncate text-xs text-m-ink/65">আপনার “{m.listing.title}” · {m.why.join(" · ")}</span>
                </span>
                <Link href={`/media/market?view=board#${m.post.id}`} className="shrink-0 text-xs font-bold text-m-blue hover:underline">দেখুন</Link>
              </li>
            ))}
          </ul>
        ))}
      {myPosts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {myPosts.map((p) => (
            <BoardCard key={p.id} post={p} author={currentUser} mine sellers={p.side === "buy" ? sellersFor(p, offers) : []} buyers={p.side === "sell" ? buyersFor(postOffer(p), posts) : []} />
          ))}
        </div>
      )}
    </section>
  );
}
