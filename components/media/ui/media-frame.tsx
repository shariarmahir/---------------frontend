import Image from "next/image";
import { AudioLines, FolderKanban, ImageIcon, Play } from "lucide-react";
import type { MediaSlot } from "@/data/media/types";
import { cn } from "@/lib/utils";

export const ratioClass: Record<MediaSlot["ratio"], string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-4/3",
  "1/1": "aspect-square",
  "4/5": "aspect-4/5",
};

export const kindStyle: Record<MediaSlot["kind"], { surface: string; ink: string; Icon: typeof ImageIcon; tag: string }> = {
  image: { surface: "bg-m-ink/6", ink: "text-m-blue/70", Icon: ImageIcon, tag: "ছবি" },
  video: { surface: "bg-m-blue-soft", ink: "text-m-ink/85", Icon: Play, tag: "ভিডিও" },
  project: { surface: "bg-m-ink/6", ink: "text-m-ink/80", Icon: FolderKanban, tag: "প্রজেক্ট ডেমো" },
  audio: { surface: "bg-m-red-soft", ink: "text-m-ink", Icon: AudioLines, tag: "অডিও" },
};

/** Deterministic bar heights so server and client draw the same waveform. */
function bars(seed: string, n: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Array.from({ length: n }, (_, i) => {
    h = Math.imul(h ^ (i + 1), 2246822507);
    return 20 + (Math.abs(h) % 75);
  });
}

/**
 * One piece of proof: a photo, a video poster, a project screen or an audio
 * waveform. Without `src` it draws a labelled placeholder per media kind, so
 * a fresh upload (or a post made before media exists) keeps its layout.
 */
export function MediaFrame({
  slot,
  className,
  sizes = "(min-width: 1024px) 640px, 100vw",
  priority,
  rounded = true,
  fit = "cover",
  bare,
}: {
  slot: MediaSlot;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
  fit?: "cover" | "contain";
  /** No caption or scrim — for a viewer that captions the media itself. */
  bare?: boolean;
}) {
  const k = kindStyle[slot.kind];
  const Icon = k.Icon;
  const photo = Boolean(slot.src);
  const playable = slot.kind === "video" || slot.kind === "audio";
  return (
    <figure className={cn("@container relative overflow-hidden", rounded && "rounded-xl", ratioClass[slot.ratio], photo ? "bg-slate-900" : k.surface, className)}>
      {photo ? (
        <>
          <Image src={slot.src!} alt={slot.label} fill sizes={sizes} priority={priority} className={fit === "cover" ? "object-cover" : "object-contain"} />
          {/* Scrim so the caption and play button read on any photo. */}
          {!bare && <span className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/45 to-transparent" aria-hidden />}
        </>
      ) : slot.kind === "audio" ? (
        <span className="absolute inset-x-6 top-1/2 flex h-2/5 -translate-y-1/2 items-center gap-0.75" aria-hidden>
          {bars(slot.label, 40).map((v, i) => (
            <span key={i} className="w-full rounded-full bg-orange-400/70" style={{ height: `${v}%` }} />
          ))}
        </span>
      ) : slot.kind !== "video" ? (
        <span className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2", k.ink)}>
          <Icon className="size-9" strokeWidth={1.5} aria-hidden />
          <span className="px-4 text-center text-xs font-semibold">{slot.label}</span>
        </span>
      ) : null}

      {playable && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className={cn("flex size-10 items-center justify-center rounded-full shadow-lg ring-1 ring-white/5 @xs:size-14", slot.kind === "video" ? "bg-white/90 text-m-blue" : "bg-m-yellow text-m-ink")}>
            <Play className="ml-0.5 size-4.5 fill-current @xs:size-6" aria-hidden />
          </span>
        </span>
      )}

      <figcaption className={cn("absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-2", bare && "sr-only")}>
        <span
          className={cn(
            "inline-flex max-w-full min-w-0 items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
            photo || slot.kind === "video" ? "bg-white/80 text-m-ink" : "bg-white/90 text-m-ink/80",
          )}
        >
          <Icon className="size-3 shrink-0" aria-hidden />
          <span className="truncate">{photo || playable ? slot.label : k.tag}</span>
        </span>
        {slot.duration && <span className="shrink-0 rounded-md bg-white/85 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-m-ink">{slot.duration}</span>}
      </figcaption>
    </figure>
  );
}
