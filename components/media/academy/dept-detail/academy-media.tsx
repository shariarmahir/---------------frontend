"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ImageUp, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { AcademyMedia, Department } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
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
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} className={mediaButton({ variant: "quiet", size: "sm", className: "bg-white/75" })}>
        <Camera aria-hidden /> ছবি ও লোগো
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-2xl bg-m-card p-4 shadow-[0_24px_48px_-16px_rgb(16_24_40/0.29)] ring-1 ring-m-ink/13 lg:right-0 lg:left-auto"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-m-ink">{dept.academy.name}</p>
              <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full text-m-ink/75 hover:bg-m-ink/6 hover:text-m-ink">
                <X className="size-4.5" aria-hidden />
                <span className="sr-only">বন্ধ করুন</span>
              </button>
            </div>
            <p className="mt-1 text-xs leading-snug text-m-ink/65">দলের ছবি হিরোর পেছনে বসে, লোগো নামের পাশে। এখন শুধু এই ব্রাউজারে থাকে।</p>
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
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left ring-1 transition-colors", has ? "bg-m-blue/13 ring-m-blue" : "bg-white/65 ring-m-ink/13 hover:ring-m-blue/60")}>
        <ImageUp className="size-4.5 shrink-0 text-m-blue" aria-hidden />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-m-ink">{busy ? "বসানো হচ্ছে…" : has ? `${label} বদলান` : `${label} দিন`}</span>
          <span className="block truncate text-[11px] text-m-ink/60">{hint}</span>
        </span>
      </button>
      {has && (
        <button type="button" onClick={onClear} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label={`${label} সরান`}>
          <Trash2 aria-hidden />
        </button>
      )}
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => onPick(e.target.files?.[0])} />
    </div>
  );
}
