"use client";

import { useRef } from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { RESUME_MAX_BYTES, RESUME_TYPES, type ResumeFile } from "@/lib/media/cv";
import { updateMedia, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { DateText } from "../ui/numerals";

const kb = (n: number) => `${Math.max(1, Math.round(n / 1024))} KB`;

/** The person's latest résumé, kept on this device: upload, replace, take back, remove. */
export function ResumeUpload() {
  const resume = useMediaState((s) => s.cv.resume);
  const input = useRef<HTMLInputElement>(null);

  const set = (next: ResumeFile | null) => updateMedia((s) => ({ ...s, cv: { ...s.cv, resume: next } }));

  function pick(file: File | undefined) {
    if (!file) return;
    if (file.size > RESUME_MAX_BYTES) return void toast.error("ফাইলটি ১.৫ MB-এর চেয়ে বড় — ছোট করে দিন");
    const reader = new FileReader();
    reader.onload = () => {
      const saved = set({ name: file.name, type: file.type, size: file.size, href: String(reader.result), at: new Date().toISOString() });
      if (saved) toast.success("রেজুমে রাখা হলো");
      else toast.error("জায়গা কম — ফাইলটি রাখা গেল না");
    };
    reader.onerror = () => toast.error("ফাইলটি পড়া গেল না");
    reader.readAsDataURL(file);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <input ref={input} type="file" accept={RESUME_TYPES} className="sr-only" aria-label="রেজুমে বেছে নিন" onChange={(e) => pick(e.target.files?.[0])} />
      {resume ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-m-ink/10 bg-m-ink/4 p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-blue/15 text-m-blue">
            <FileText className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-m-ink">{resume.name}</span>
            <span className="block text-xs text-m-ink/60">
              {kb(resume.size)} · <DateText iso={resume.at} />
            </span>
          </span>
          <a href={resume.href} download={resume.name} className={mediaButton({ variant: "quiet", size: "sm" })}>
            <Download aria-hidden /> নামান
          </a>
          <button type="button" onClick={() => input.current?.click()} className={mediaButton({ variant: "quiet", size: "sm" })}>
            <Upload aria-hidden /> বদলান
          </button>
          <button type="button" onClick={() => set(null)} aria-label="রেজুমে সরান" className={mediaButton({ variant: "ghost", size: "sm", className: "text-m-red" })}>
            <Trash2 aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed border-m-ink/20 px-4 py-6 text-center transition-colors hover:border-m-blue hover:bg-m-ink/4"
        >
          <Upload className="size-5 text-m-blue" aria-hidden />
          <span className="text-sm font-semibold text-m-ink">সাম্প্রতিক CV/রেজুমে আপলোড করুন</span>
          <span className="text-xs text-m-ink/60">PDF বা Word · সর্বোচ্চ ১.৫ MB</span>
        </button>
      )}
    </div>
  );
}
