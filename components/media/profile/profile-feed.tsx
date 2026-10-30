"use client";

import Link from "next/link";
import { Earth, Lock, UsersRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Person } from "@/data/media/types";
import { updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { PostCard } from "../feed/post-card";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Num } from "../ui/numerals";

export interface FeedItem {
  id: string;
  audience: "public" | "followers" | "private";
  node: React.ReactNode;
}

/**
 * The viewer's own profile feed: everything they posted, the posts made in
 * this browser first. Each post keeps the audience it was shared with; one
 * switch closes the whole feed to everyone but the viewer.
 */
export function OwnProfileFeed({ author, items }: { author: Person; items: FeedItem[] }) {
  const hydrated = useHydrated();
  const mine = useMediaState((s) => s.posts);
  const listings = useMediaState((s) => s.listings);
  const closed = useMediaState((s) => s.privacy.profileFeed === "private");
  const all: FeedItem[] = [
    ...(hydrated ? mine : []).map((p) => ({
      id: p.id,
      audience: p.audience ?? "public",
      node: <PostCard live post={p} author={author} listing={listings.find((l) => l.id === p.listingId)} />,
    })),
    ...items,
  ];
  const count = (a: FeedItem["audience"]) => all.filter((i) => i.audience === a).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-m-ink/10 bg-m-ink/4 px-4 py-3">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-m-ink/70">
          <span className="inline-flex items-center gap-1">
            <Earth className="size-3.5" aria-hidden /> সবাই <Num value={count("public")} />
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersRound className="size-3.5" aria-hidden /> অনুসারী <Num value={count("followers")} />
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="size-3.5" aria-hidden /> শুধু আমি <Num value={count("private")} />
          </span>
        </p>
        <label className="flex items-center gap-2 text-sm font-semibold text-m-ink">
          ফিড শুধু আমি দেখব
          <Switch checked={closed} onCheckedChange={(on) => updateMedia((s) => ({ ...s, privacy: { ...s.privacy, profileFeed: on ? "private" : "open" } }))} />
        </label>
      </div>
      {closed && <p className="text-xs text-m-ink/60">ফিড বন্ধ — অন্যরা আপনার প্রোফাইলে কোনো পোস্ট দেখবেন না।</p>}

      {all.length === 0 ? (
        <EmptyState
          icon="posts"
          title="এখনো কোনো পোস্ট নেই"
          body="ফিডে যা পোস্ট করবেন, এখানেও ঠিক তেমনই দেখাবে।"
          action={
            <Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>
              পোস্ট করুন
            </Link>
          }
        />
      ) : (
        all.map((i) => (
          <div key={i.id} className="fade-in">
            {i.node}
          </div>
        ))
      )}
    </div>
  );
}
