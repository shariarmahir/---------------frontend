"use client";

import Link from "next/link";
import { ArrowUpRight, Wallet } from "lucide-react";
import { isRated, type RatedPost } from "@/data/media/topics";
import type { WalletSeed } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import { skillStatus } from "@/lib/media/skill";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "../market/listing-card";
import { mediaButton } from "../ui/button-styles";
import { MediaFrame } from "../ui/media-frame";
import { Compact, Num, Taka } from "../ui/numerals";
import { StatusBadge } from "../ui/trust";
import { useWallet } from "../wallet/use-wallet";

/** One portfolio tile: the proof thumbnail, the skill, its status. */
export function PortfolioTile({ post }: { post: RatedPost }) {
  const status = skillStatus(post.skill.self, post.skill.communityAvg, post.skill.raters);
  return (
    <Link href={`/media/post/${post.id}`} className="group block overflow-hidden rounded-xl border border-card-border bg-white transition-[border-color,box-shadow] hover:border-bd-green/35 hover:shadow-[0_6px_18px_-10px_rgb(15_23_42/0.25)]">
      <MediaFrame slot={{ ...post.media[0], ratio: "1/1" }} rounded={false} sizes="(min-width: 1024px) 220px, 45vw" />
      <span className="block space-y-1.5 p-3">
        <span className="block truncate text-sm font-bold text-text-primary group-hover:text-bd-green">{post.skill.name}</span>
        <StatusBadge status={status} size="sm" />
      </span>
    </Link>
  );
}

/** The viewer's own new posts at the front of their portfolio grid. */
export function MyPortfolioTiles() {
  const posts = useMediaState((s) => s.posts);
  return (
    <>
      {posts.filter(isRated).map((p) => (
        <PortfolioTile key={p.id} post={p} />
      ))}
    </>
  );
}

/** The viewer's own new listings at the front of their shop tab. */
export function MyShopCards() {
  const listings = useMediaState((s) => s.listings);
  return (
    <>
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} seller={currentUser} />
      ))}
    </>
  );
}

/** Follower count that includes the viewer's own follow (hidden if the viewer turned counts off). */
export function FollowerCount({ handle, base }: { handle: string; base: number }) {
  const on = useMediaState((s) => Boolean(s.following[handle]));
  const hide = useMediaState((s) => s.privacy.hideCounts);
  if (hide) return <>—</>;
  return <Compact n={base + (on ? 1 : 0)} />;
}

/** The owner's own location line, honouring "district only". */
export function OwnLocation({ area, district }: { area: string; district: string }) {
  const districtOnly = useMediaState((s) => s.privacy.districtOnly);
  return <>{districtOnly ? district : `${area}, ${district}`}</>;
}

/** Own-profile wallet card: balance and the way out (bKash / Nagad / BanglaQR). */
export function WalletCard({ seed }: { seed: WalletSeed }) {
  const hydrated = useHydrated();
  const w = useWallet(seed);
  return (
    <div className="rounded-2xl bg-bd-green p-5 text-white">
      <p className="flex items-center gap-2 text-sm text-white/85">
        <Wallet className="size-4" aria-hidden /> ওয়ালেট ব্যালান্স
      </p>
      {hydrated ? (
        <p className="mt-1 text-3xl font-bold">
          <Taka amount={w.available} />
        </p>
      ) : (
        <Skeleton className="mt-2 h-8 w-36 bg-white/25" />
      )}
      <p className="mt-1 text-xs text-white/80">
        এসক্রোতে <Taka amount={w.escrow} /> · মোট আয় <Taka amount={w.lifetime} />
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href="/media/wallet?withdraw=1" className={mediaButton({ variant: "primary", size: "sm" })}>
          টাকা তুলুন
        </Link>
        <Link href="/media/wallet" className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-white/30 text-sm font-semibold text-white transition-colors hover:bg-white/10">
          লেনদেন <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-white/70">
        বিকাশ · নগদ · বাংলা কিউআর — উত্তোলনে ফি <Num value={0} />
      </p>
    </div>
  );
}
