"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { MediaSlot } from "@/data/media/types";
import { cn } from "@/lib/utils";
import { MediaFrame, kindStyle } from "./media-frame";
import { Num } from "./numerals";

/**
 * One to four pieces of proof laid out as a gallery. Each opens a
 * full-screen viewer — judging a skill means looking closely.
 */
export function MediaGallery({ media, className }: { media: MediaSlot[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (media.length === 0) return null;
  const shown = media.slice(0, 4);
  const square = shown.length > 2;
  const tile = "group relative block w-full cursor-zoom-in rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bd-green";

  return (
    <>
      <div className={cn(shown.length > 1 && "grid grid-cols-2 gap-1.5", className)}>
        {shown.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            className={cn(tile, shown.length === 3 && i === 0 && "col-span-2")}
            aria-label={`${m.label} — বড় করে দেখুন`}
          >
            <MediaFrame
              slot={square ? { ...m, ratio: shown.length === 3 && i === 0 ? "16/9" : "1/1" } : m}
              sizes={shown.length === 1 ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 320px, 50vw"}
            />
            <span className="pointer-events-none absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden>
              <Maximize2 className="size-4" />
            </span>
          </button>
        ))}
      </div>
      <MediaViewer media={shown} index={open} onIndex={setOpen} />
    </>
  );
}

function MediaViewer({ media, index, onIndex }: { media: MediaSlot[]; index: number | null; onIndex: (i: number | null) => void }) {
  const m = index === null ? undefined : media[index];
  const many = media.length > 1;
  const go = (d: number) => index !== null && onIndex((index + d + media.length) % media.length);
  const nav = "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-text-primary shadow-lg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-white";

  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogContent
        className="max-w-[min(64rem,calc(100vw-1.5rem))] gap-0 overflow-hidden border-0 bg-slate-950 p-0 font-sans text-white sm:max-w-[min(64rem,calc(100vw-3rem))] [&>button:last-child]:z-10 [&>button:last-child]:bg-white/90 [&>button:last-child]:text-text-primary"
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        {m && (
          <>
            <div className="relative h-[min(72dvh,42rem)] w-full">
              <MediaFrame key={index} bare slot={{ ...m, ratio: "16/9" }} rounded={false} fit="contain" sizes="(min-width: 1024px) 1024px, 100vw" className="aspect-auto! h-full w-full" />
              {many && (
                <>
                  <button type="button" onClick={() => go(-1)} className={cn(nav, "left-3")}>
                    <ChevronLeft className="size-5" aria-hidden />
                    <span className="sr-only">আগেরটি</span>
                  </button>
                  <button type="button" onClick={() => go(1)} className={cn(nav, "right-3")}>
                    <ChevronRight className="size-5" aria-hidden />
                    <span className="sr-only">পরেরটি</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <DialogTitle className="truncate text-sm font-semibold text-white">{m.label}</DialogTitle>
                <DialogDescription className="text-xs text-white/70">
                  {kindStyle[m.kind].tag}
                  {m.kind === "video" || m.kind === "audio" ? " · ডেমো প্রিভিউ — আসল ফাইল আপলোড হলে এখানেই চলবে" : ""}
                </DialogDescription>
              </div>
              {many && index !== null && (
                <p className="shrink-0 text-xs font-semibold text-white/75 tabular-nums">
                  <Num value={index + 1} /> / <Num value={media.length} />
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
