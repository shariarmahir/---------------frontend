"use client";

import { useState } from "react";
import { Check, Highlighter, Pin } from "lucide-react";
import { NOTE_COLORS, type NoteColor } from "@/lib/media/notices";
import { cn } from "@/lib/utils";
import { PAPER } from "../notice-board";

/**
 * Under each message in the Discussion Room: pin it as important, and mark
 * it with a colour like a highlighter. On a mouse the buttons appear when
 * you hover or tab to the message; on touch they are always there. A message
 * that is pinned or marked keeps its buttons visible.
 */
export function MessageTools({ pinned, mark, onPin, onMark }: { pinned: boolean; mark?: NoteColor; onPin: () => void; onMark: (c: NoteColor | null) => void }) {
  const [picking, setPicking] = useState(false);
  const quiet = !pinned && !mark && !picking;

  return (
    <div className={cn("flex flex-wrap items-center gap-0.5 px-0.5", quiet && "transition-opacity duration-150 group-focus-within/msg:opacity-100 group-hover/msg:opacity-100 [@media(hover:hover)]:opacity-0")}>
      <button
        type="button"
        onClick={onPin}
        aria-pressed={pinned}
        title={pinned ? "পিন সরান" : "গুরুত্বপূর্ণ হিসেবে পিন করুন"}
        className={cn("grid size-7 place-items-center rounded-md transition-colors hover:bg-m-ink/6", pinned ? "text-m-blue" : "text-m-ink/55 hover:text-m-ink")}
      >
        <Pin className={cn("size-3.5", pinned && "fill-current")} aria-hidden />
        <span className="sr-only">{pinned ? "পিন সরান" : "গুরুত্বপূর্ণ হিসেবে পিন করুন"}</span>
      </button>
      <button
        type="button"
        onClick={() => setPicking((p) => !p)}
        aria-expanded={picking}
        title="রং দিয়ে মার্ক করুন"
        className={cn("grid size-7 place-items-center rounded-md transition-colors hover:bg-m-ink/6", mark ? "text-m-blue" : "text-m-ink/55 hover:text-m-ink")}
      >
        <Highlighter className="size-3.5" aria-hidden />
        <span className="sr-only">রং দিয়ে মার্ক করুন</span>
      </button>
      {picking && (
        <div role="group" aria-label="মার্কারের রং" className="live-in ml-1 flex items-center gap-1">
          {NOTE_COLORS.map((c) => {
            const on = mark === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onMark(c);
                  setPicking(false);
                }}
                aria-pressed={on}
                title={PAPER[c].bn}
                className={cn("grid size-6 place-items-center rounded-full ring-2 transition-[scale,box-shadow] active:scale-90", PAPER[c].paper, on ? "ring-white" : "ring-transparent hover:ring-m-ink/43")}
              >
                {on && <Check className="size-3" aria-hidden />}
                <span className="sr-only">{PAPER[c].bn}</span>
              </button>
            );
          })}
          {mark && (
            <button
              type="button"
              onClick={() => {
                onMark(null);
                setPicking(false);
              }}
              className="ml-0.5 rounded-md px-1.5 py-1 text-[11px] font-semibold text-m-ink/70 hover:bg-m-ink/6 hover:text-m-ink"
            >
              মুছুন
            </button>
          )}
        </div>
      )}
    </div>
  );
}
