"use client";

import Link from "next/link";
import { useState } from "react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { Check, Heart, MessageCircle, Share2, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import type { Comment, Post } from "@/data/media/types";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { toggleKey, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Compact, Num } from "../ui/numerals";
import { VerifyDialog } from "./verify-dialog";
import { useRequireAccount } from "@/components/auth/use-require-account";

export function FollowButton({ handle, size = "sm" }: { handle: string; size?: "sm" | "md" }) {
  const on = useMediaState((s) => Boolean(s.following[handle]));
  const ensure = useRequireAccount();
  if (handle === CURRENT_USER_HANDLE) return null;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => ensure("অনুসরণ করতে") && toggleKey("following", handle)}
      className={mediaButton({ variant: on ? "quiet" : "outline", size })}
    >
      {on ? <UserCheck aria-hidden /> : <UserPlus aria-hidden />}
      {on ? "অনুসরণ করছেন" : "অনুসরণ"}
    </button>
  );
}

/**
 * The action row under a post. "Verify this rating" is the loop's key
 * action, so it is the one filled button; the rest are quiet.
 */
export function PostActions({
  post,
  authorName,
  commentCount,
  seedVerdict,
}: {
  post: Pick<Post, "id" | "author" | "stats" | "skill">;
  authorName: string;
  commentCount: number;
  /** The viewer's rating already in the seeded discussion, if any. */
  seedVerdict?: Comment["verdict"];
}) {
  const liked = useMediaState((s) => Boolean(s.liked[post.id]));
  const ensure = useRequireAccount();
  const hideCounts = useMediaState((s) => s.privacy.hideCounts);
  const rated = useMediaState((s) => s.ratings[post.id]);
  const mine = rated ? { stars: rated.stars, verdict: rated.verdict } : seedVerdict ? { stars: seedVerdict.stars, verdict: seedVerdict.kind } : undefined;
  const myComments = useMediaState((s) => {
    let n = s.comments[post.id]?.length ?? 0;
    for (const [key, list] of Object.entries(s.replies)) if (key.startsWith(`${post.id}:`)) n += list.length;
    return n;
  });
  const [open, setOpen] = useState(false);
  const own = post.author === CURRENT_USER_HANDLE;

  async function share() {
    const url = `${window.location.origin}/media/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `${authorName} — ${post.skill?.name ?? "শিক্ষিতদের মিডিয়া"}` });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("লিংক কপি হয়েছে");
      }
    } catch {
      // Share sheet dismissed or clipboard blocked.
    }
  }

  const quiet = "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-white/80 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-1 border-t border-white/12 pt-3">
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => ensure("লাইক দিতে") && toggleKey("liked", post.id)}
        className={cn(quiet, liked ? "text-crimson-bright" : "hover:bg-national-crimson hover:text-white")}
      >
        <Heart className={cn("size-5", liked && "like-pop fill-current")} aria-hidden />
        {!hideCounts && <Compact n={post.stats.likes + (liked ? 1 : 0)} />}
        <span className="sr-only">{liked ? "পছন্দ তুলে নিন" : "পছন্দ"}</span>
      </button>
      <Link href={`/media/post/${post.id}#discussion`} className={cn(quiet, "hover:bg-white/10 hover:text-white")}>
        <MessageCircle className="size-5" aria-hidden />
        <Num value={commentCount + myComments} />
        <span className="sr-only">মন্তব্য</span>
      </Link>
      <button type="button" onClick={share} className={cn(quiet, "hover:bg-white/10 hover:text-white")}>
        <Share2 className="size-5" aria-hidden />
        <span className="hidden sm:inline">শেয়ার</span>
        <span className="sr-only sm:hidden">শেয়ার</span>
      </button>

      <span className="ml-auto">
        {!post.skill ? null : own ? (
          <span className="text-xs text-white/65">নিজের দক্ষতা নিজে যাচাই করা যায় না</span>
        ) : mine ? (
          <span
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold",
              mine.verdict === "verify" ? "bg-white/10 text-signal-orange" : "bg-national-crimson text-white",
            )}
          >
            <Check className="size-4" aria-hidden />
            আপনি দিয়েছেন <Num value={mine.stars} />★
          </span>
        ) : (
          <button type="button" onClick={() => ensure("রেটিং যাচাই করতে") && setOpen(true)} className={mediaButton({ variant: "green", size: "sm" })}>
            <SealCheck size={18} weight="duotone" aria-hidden />
            রেটিং যাচাই করুন
          </button>
        )}
      </span>
      {post.skill && !own && !mine && <VerifyDialog open={open} onOpenChange={setOpen} postId={post.id} authorName={authorName} skill={post.skill} />}
    </div>
  );
}
