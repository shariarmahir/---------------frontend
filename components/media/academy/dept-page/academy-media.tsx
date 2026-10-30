"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ImageUp, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { AcademyMedia, Department } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { secondaryBtn } from "../catalogue/buttons";
import { updateAcademy } from "../use-academy";

/** Pictures bigger than this are not read at all. */
const MAX_INPUT = 12 * 1024 * 1024;

/**
 * A picture made small enough to keep in the browser: the team photo at
 * 1600 px wide, the logo at 320 px, both as WebP (PNG where WebP is missing).
 */
async function shrink(file: File, longest: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, longest / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.8);
}

/** For the academy's own members: put up or change the team photo behind the hero, and the logo. */
export function AcademyMediaEditor({ dept, hasPhoto, hasLogo }: { dept: Department; hasPhoto: boolean; hasLogo: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"photo" | "logo" | null>(null);
  const panelId = useId();

  function save(change: (m: AcademyMedia) => AcademyMedia) {
    return updateAcademy((a) => {
      const next = change(a.academyMedia[dept.id] ?? {});
      const media = { ...a.academyMedia };
      if (next.photo || next.logo) media[dept.id] = next;
      else delete media[dept.id];
      return { ...a, academyMedia: media };
    });
  }

  async function pick(kind: "photo" | "logo", file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("ছবির ফাইল দিন — জেপিজি, পিএনজি বা ওয়েবপি");
      return;
    }
    if (file.size > MAX_INPUT) {
      toast.error("ছবিটা ১২ এমবির বেশি", { description: "ছোট একটা ছবি দিন।" });
      return;
    }
    setBusy(kind);
    try {
      const url = await shrink(file, kind === "photo" ? 1600 : 320);
      if (save((m) => ({ ...m, [kind]: url }))) toast.success(kind === "photo" ? "দলের ছবি বসল" : "লোগো বসল");
      else toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "এই ভিজিটে দেখা যাবে; রাখতে চাইলে ছোট ছবি দিন।" });
    } catch {
      toast.error(`${file.name} পড়া গেল না`);
    }
    setBusy(null);
  }

  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} className={cn(secondaryBtn, "h-10 px-4")}>
        <Camera className="size-4" aria-hidden /> ছবি ও লোগো
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-0 z-40 mb-2 w-76 border border-(--c-line) bg-(--c-bg-raised) p-4 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)] lg:right-0 lg:left-auto"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="display text-base text-(--c-ink-strong)">{dept.academy.name}</p>
              <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
                <X className="size-4.5" aria-hidden />
                <span className="sr-only">বন্ধ করুন</span>
              </button>
            </div>
            <p className="mt-1 text-xs leading-snug text-(--c-muted)">দলের ছবি হিরোর পেছনে বসে, লোগো নামের পাশে। এখন শুধু এই ব্রাউজারে থাকে।</p>
            <div className="mt-4 space-y-3">
              <Slot label="দলের ছবি" hint="সবাই একসাথে, পাশাপাশি — চওড়া ছবি" has={hasPhoto} busy={busy === "photo"} onPick={(f) => pick("photo", f)} onClear={() => save((m) => ({ ...m, photo: undefined }))} />
              <Slot label="লোগো" hint="চারকোনা, সাদা বা স্বচ্ছ পটভূমি" has={hasLogo} busy={busy === "logo"} onPick={(f) => pick("logo", f)} onClear={() => save((m) => ({ ...m, logo: undefined }))} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slot({ label, hint, has, busy, onPick, onClear }: { label: string; hint: string; has: boolean; busy: boolean; onPick: (f: File | undefined) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className={cn("flex min-w-0 flex-1 items-center gap-2.5 border px-3 py-2.5 text-left transition-colors duration-150", has ? "border-(--c-accent-ink) bg-(--c-bg)" : "border-(--c-line) bg-(--c-bg) hover:border-(--c-line-strong)")}
      >
        <ImageUp className="size-4.5 shrink-0 text-(--c-accent-ink)" aria-hidden />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-(--c-ink-strong)">{busy ? "বসানো হচ্ছে…" : has ? `${label} বদলান` : `${label} দিন`}</span>
          <span className="block truncate text-[11px] text-(--c-faint)">{hint}</span>
        </span>
      </button>
      {has && (
        <button
          type="button"
          onClick={onClear}
          className="grid size-10 shrink-0 place-items-center border border-(--c-line) text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
          aria-label={`${label} সরান`}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => onPick(e.target.files?.[0])} />
    </div>
  );
}
