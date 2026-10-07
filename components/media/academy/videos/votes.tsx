"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { Vote } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Compact } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

/** The viewer's like or dislike on a video or comment; casting the same again takes it back. */
export function useVote(id: string): [Vote | undefined, (v: Vote) => void] {
  const hydrated = useHydrated();
  const mine = useAcademy((a) => a.votes[id]);
  const cast = (v: Vote) =>
    updateAcademy((a) => {
      const votes = { ...a.votes };
      if (votes[id] === v) delete votes[id];
      else votes[id] = v;
      return { ...a, votes };
    });
  return [hydrated ? mine : undefined, cast];
}

/** A thumb that pops when it turns on. */
function Thumb({ on, down, className }: { on: boolean; down?: boolean; className: string }) {
  const reduce = useReducedMotion();
  const Icon = down ? ThumbsDown : ThumbsUp;
  return (
    <motion.span
      key={String(on)}
      className="inline-grid"
      animate={on && !reduce ? { scale: [1, 1.35, 1], rotate: [0, down ? 12 : -12, 0] } : undefined}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Icon className={cn(className, on && "fill-current")} aria-hidden />
    </motion.span>
  );
}

/** The like | dislike pill under the player. Likes show a count; dislikes stay private, as on video sites. */
export function VideoLikes({ id, base }: { id: string; base: number }) {
  const [mine, cast] = useVote(id);
  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-full bg-m-ink/6 text-sm font-semibold text-m-ink">
      <button type="button" aria-pressed={mine === "up"} onClick={() => cast("up")} className="inline-flex h-full items-center gap-2 pr-3 pl-4 transition-colors hover:bg-m-ink/8">
        <Thumb on={mine === "up"} className="size-5" />
        <Compact n={base + (mine === "up" ? 1 : 0)} />
        <span className="sr-only">জন পছন্দ করেছেন — আপনিও করুন</span>
      </button>
      <span className="h-6 w-px bg-m-ink/14" aria-hidden />
      <button type="button" aria-pressed={mine === "down"} onClick={() => cast("down")} className="inline-flex h-full items-center pr-4 pl-3 transition-colors hover:bg-m-ink/8">
        <Thumb on={mine === "down"} down className="size-5" />
        <span className="sr-only">ভালো লাগেনি</span>
      </button>
    </div>
  );
}

/** Small thumbs under a comment. */
export function CommentVotes({ id, base, disabled }: { id: string; base: number; disabled?: boolean }) {
  const [mine, cast] = useVote(id);
  const likes = base + (mine === "up" ? 1 : 0);
  const btn = "grid size-8 place-items-center rounded-full text-m-ink/80 transition-colors hover:bg-m-ink/6 hover:text-m-ink disabled:pointer-events-none disabled:opacity-50";
  return (
    <span className="inline-flex items-center">
      <button type="button" disabled={disabled} aria-pressed={mine === "up"} onClick={() => cast("up")} className={btn}>
        <Thumb on={mine === "up"} className="size-4" />
        <span className="sr-only">পছন্দ</span>
      </button>
      {likes > 0 && (
        <span className="mr-1 text-xs text-m-ink/65">
          <Compact n={likes} />
        </span>
      )}
      <button type="button" disabled={disabled} aria-pressed={mine === "down"} onClick={() => cast("down")} className={btn}>
        <Thumb on={mine === "down"} down className="size-4" />
        <span className="sr-only">অপছন্দ</span>
      </button>
    </span>
  );
}
