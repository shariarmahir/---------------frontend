"use client";

import { useRef, useState } from "react";
import { AudioLines, ImagePlus, Loader2, Play, Video, X } from "lucide-react";
import { toast } from "sonner";
import type { ProductForm, UploadKind } from "@/data/media/bazaar";
import type { MediaSlot } from "@/data/media/types";
import { PLAY_MAX, readAudio, readDataUrl, readPhoto, readVideo } from "../post/read-media";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";

const KIND = {
  image: { label: "ছবি", accept: "image/jpeg,image/png,image/webp", Icon: ImagePlus, bad: "JPG, PNG বা WebP ছবি দিন।" },
  video: { label: "ভিডিও", accept: "video/mp4,video/webm,video/quicktime", Icon: Video, bad: "MP4 বা WebM ভিডিও দিন।" },
  audio: { label: "অডিও", accept: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/aac", Icon: AudioLines, bad: "MP3, M4A, WAV বা OGG দিন।" },
} as const;

async function read(kind: UploadKind, file: File): Promise<MediaSlot> {
  const label = file.name.replace(/\.[^.]+$/, "").slice(0, 40) || KIND[kind].label;
  if (kind === "image") return { kind, label, ratio: "4/3", src: await readPhoto(file) };
  if (kind === "audio") {
    const a = await readAudio(file);
    return { kind, label, ratio: "16/9", duration: a.duration, play: a.play };
  }
  const v = await readVideo(file);
  return { kind, label, ratio: "16/9", src: v.poster, duration: v.duration, play: file.size <= PLAY_MAX ? await readDataUrl(file) : undefined };
}

/** One uploaded item: photo, video with its poster, or a playable audio sample. */
function Item({ m, onRemove }: { m: MediaSlot; onRemove: () => void }) {
  return (
    <li className="live-in relative overflow-hidden rounded-2xl bg-white/65 ring-1 ring-m-ink/10">
      {m.kind === "audio" ? (
        <div className="flex aspect-4/3 flex-col justify-end gap-2 bg-m-red-soft p-3 text-m-ink">
          <AudioLines className="size-7" aria-hidden />
          <p className="truncate text-xs font-bold">{m.label}</p>
          {m.play ? <audio controls src={m.play} className="h-8 w-full" /> : <p className="text-[11px]">শুধু দৈর্ঘ্য রাখা হলো — ফাইল বড়</p>}
        </div>
      ) : m.kind === "video" && m.play ? (
        <video controls poster={m.src} src={m.play} className="aspect-4/3 w-full bg-m-canvas object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a local data URL
        <img src={m.src} alt="" className="aspect-4/3 w-full object-cover" />
      )}
      {m.kind === "video" && !m.play && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-m-blue"><Play className="ml-0.5 size-5 fill-current" /></span>
        </span>
      )}
      {m.duration && m.kind === "video" && <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-m-ink">{m.duration}</span>}
      <button type="button" onClick={onRemove} aria-label={`${m.label} সরান`} className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-m-ink hover:bg-m-canvas">
        <X className="size-4" aria-hidden />
      </button>
    </li>
  );
}

/** Upload proof the way the category needs it: crops and crafts by photo, music by audio, rent by photo set and video tour. */
export function MediaPicker({ spec, items, error, onChange }: { spec: ProductForm["media"]; items: MediaSlot[]; error?: string; onChange: (next: MediaSlot[]) => void }) {
  const inputs = useRef<Partial<Record<UploadKind, HTMLInputElement | null>>>({});
  const [reading, setReading] = useState(0);
  const room = spec.max - items.length;

  async function add(kind: UploadKind, files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, room);
    if (!picked.length) return;
    setReading((n) => n + picked.length);
    const next = [...items];
    for (const file of picked) {
      try {
        next.push(await read(kind, file));
        onChange([...next]);
      } catch {
        toast.error(`${file.name} খোলা গেল না`, { description: KIND[kind].bad });
      } finally {
        setReading((n) => n - 1);
      }
    }
  }

  return (
    <fieldset className="space-y-3" aria-describedby={error ? "media-error" : "media-hint"}>
      <legend className="text-sm font-semibold text-m-ink">{spec.label}{spec.need && " *"}</legend>
      <p id="media-hint" className="text-xs leading-relaxed text-m-ink/65">{spec.hint}</p>
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m, i) => <Item key={i} m={m} onRemove={() => onChange(items.filter((_, j) => j !== i))} />)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {spec.kinds.map((k) => {
          const { Icon, label, accept } = KIND[k];
          return (
            <span key={k}>
              <input ref={(el) => { inputs.current[k] = el; }} id={k === spec.kinds[0] ? "media" : undefined} type="file" accept={accept} multiple={k === "image"} className="sr-only" tabIndex={-1} onChange={(e) => { add(k, e.target.files); e.target.value = ""; }} />
              <button type="button" disabled={room <= 0 || reading > 0} onClick={() => inputs.current[k]?.click()} className={mediaButton({ variant: k === spec.need ? "primary" : "quiet", size: "sm" })}>
                <Icon aria-hidden /> {label} দিন
              </button>
            </span>
          );
        })}
        <span className="text-xs text-m-ink/55">
          {reading > 0 ? <span className="inline-flex items-center gap-1"><Loader2 className="size-3.5 animate-spin" aria-hidden />প্রস্তুত হচ্ছে…</span> : <><Num value={items.length} />/<Num value={spec.max} /></>}
        </span>
      </div>
      <p className="text-[11px] text-m-ink/50">অডিও-ভিডিও ১.৫ এমবি পর্যন্ত চালানো যায়; বড় ফাইলের দৈর্ঘ্য আর পোস্টার রাখা হয় (সার্ভার এলে পুরো ফাইল)।</p>
      {error && <p id="media-error" className="text-xs font-medium text-m-red">{error}</p>}
    </fieldset>
  );
}
