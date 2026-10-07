"use client";

import { useRef, useState } from "react";
import { Database, Download, ExternalLink, FileSpreadsheet, FileText, FileVideo, Link2, Trash2, Upload, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { MATERIAL_KINDS, materialKindOf, sizeParts, type Course, type Material, type MaterialKind } from "@/lib/media/academy";
import { NOTE_FILE_MAX } from "@/lib/media/classroom";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { selectClass } from "../../ui/field-styles";
import { Num, useFormat } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

export const MATERIAL_ICON: Record<MaterialKind, LucideIcon> = { video: FileVideo, pdf: FileText, doc: FileText, sheet: FileSpreadsheet, data: Database };
const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,.json,.zip,.mp4,.webm,.jpg,.jpeg,.png";
const EMPTY: Material[] = [];

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Only web links; never javascript: or data: from a typed address. */
function webLink(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * The course's materials: what came with it, and what the teacher adds —
 * files up to 1.5 MB kept for download (PDF, Word, Excel, slides, data,
 * short clips), and links for anything bigger, like a YouTube class.
 */
export function MaterialsDesk({ course }: { course: Course }) {
  const { num } = useFormat();
  const added = useAcademy((a) => a.materials[course.id] ?? EMPTY);
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState({ title: "", url: "", kind: "video" as MaterialKind });

  const size = (bytes: number) => {
    const { value, unit } = sizeParts(bytes);
    return `${num(value)} ${unit}`;
  };

  function keep(items: Material[]) {
    if (!updateAcademy((a) => ({ ...a, materials: { ...a.materials, [course.id]: [...items, ...(a.materials[course.id] ?? [])] } }))) {
      toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "এই ভিজিটে দেখা যাবে; রাখতে চাইলে পুরোনো ফাইল মুছুন বা লিংক দিন।" });
    }
  }

  async function addFiles(files: FileList | File[]) {
    setBusy(true);
    const ok: Material[] = [];
    for (const file of Array.from(files)) {
      if (file.size > NOTE_FILE_MAX) {
        toast.error(`${file.name} — ${size(file.size)}`, { description: "১.৫ এমবি পর্যন্ত রাখা যায়। বড় ভিডিও ইউটিউব বা ড্রাইভে তুলে নিচে লিংক দিন।" });
        continue;
      }
      try {
        ok.push({ kind: materialKindOf(file.name), title: file.name.replace(/\.[^.]+$/, ""), size: size(file.size), href: await readDataUrl(file), file: file.name, at: new Date().toISOString() });
      } catch {
        toast.error(`${file.name} পড়া গেল না`);
      }
    }
    if (ok.length) {
      keep(ok);
      toast.success(`${num(ok.length)}টি উপকরণ যোগ হলো`, { description: "ভর্তি হওয়া শিক্ষার্থীরা ক্লাসের পাতায় পাবে।" });
    }
    setBusy(false);
  }

  function addLink(e: React.FormEvent) {
    e.preventDefault();
    const href = webLink(link.url);
    if (link.title.trim().length < 3) {
      toast.error("উপকরণের নাম লিখুন");
      return;
    }
    if (!href) {
      toast.error("সঠিক লিংক দিন, যেমন https://youtu.be/…");
      return;
    }
    keep([{ kind: link.kind, title: link.title.trim(), size: "লিংক", href, at: new Date().toISOString() }]);
    setLink((l) => ({ ...l, title: "", url: "" }));
  }

  function remove(at?: string) {
    updateAcademy((a) => ({ ...a, materials: { ...a.materials, [course.id]: (a.materials[course.id] ?? []).filter((m) => m.at !== at) } }));
  }

  return (
    <div className="space-y-6">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors has-focus-visible:ring-2 has-focus-visible:ring-m-blue",
          over ? "border-m-blue bg-m-yellow/10" : "border-m-ink/17 bg-m-card hover:border-m-ink/34",
        )}
      >
        <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files && void addFiles(e.target.files).then(() => { if (input.current) input.current.value = ""; })} />
        <span className="grid size-12 place-items-center rounded-2xl bg-m-yellow text-m-ink"><Upload className="size-6" aria-hidden /></span>
        <span className="text-base font-bold text-m-ink">{busy ? "পড়া হচ্ছে…" : "ফাইল এখানে ছেড়ে দিন, বা বেছে নিন"}</span>
        <span className="text-sm text-m-ink/70">পিডিএফ, ওয়ার্ড, এক্সেল, স্লাইড, ডেটা, ছোট ভিডিও — প্রতিটি ১.৫ এমবি পর্যন্ত</span>
      </label>

      <form onSubmit={addLink} className="grid gap-2 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_8rem_auto] sm:items-end shadow-m-tile">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-m-ink">বড় ভিডিও বা ফাইলের লিংক</span>
          <input value={link.title} onChange={(e) => setLink((l) => ({ ...l, title: e.target.value }))} placeholder="যেমন: সপ্তাহ ৩-এর ক্লাস" className="h-11 w-full rounded-lg border border-m-ink/13 bg-m-canvas px-3 text-[15px] focus-visible:border-m-blue focus-visible:outline-none" />
        </label>
        <label className="text-sm">
          <span className="sr-only">লিংক</span>
          <input value={link.url} onChange={(e) => setLink((l) => ({ ...l, url: e.target.value }))} type="url" placeholder="https://youtu.be/…" className="h-11 w-full rounded-lg border border-m-ink/13 bg-m-canvas px-3 text-[15px] focus-visible:border-m-blue focus-visible:outline-none" />
        </label>
        <label className="text-sm">
          <span className="sr-only">ধরন</span>
          <select value={link.kind} onChange={(e) => setLink((l) => ({ ...l, kind: e.target.value as MaterialKind }))} className={selectClass}>
            {(Object.keys(MATERIAL_KINDS) as MaterialKind[]).map((k) => <option key={k} value={k}>{MATERIAL_KINDS[k]}</option>)}
          </select>
        </label>
        <button type="submit" className={mediaButton({ variant: "quiet" })}><Link2 aria-hidden /> যোগ করুন</button>
      </form>

      <section aria-labelledby="mat-list">
        <h3 id="mat-list" className="mb-2 text-sm font-semibold text-m-ink/80">সব উপকরণ · <Num value={added.length + course.materials.length} /></h3>
        <ul className="divide-y divide-m-ink/9 overflow-hidden rounded-2xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
          {[...added, ...course.materials].map((m, i) => {
            const Icon = MATERIAL_ICON[m.kind];
            const mine = Boolean(m.at);
            const isLink = m.href && !m.href.startsWith("data:");
            return (
              <li key={`${m.title}-${m.at ?? i}`} className="flex items-center gap-3 px-4 py-3">
                <Icon className="size-5 shrink-0 text-m-blue" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-m-ink">{m.title}</span>
                  <span className="text-xs text-m-ink/65">{MATERIAL_KINDS[m.kind]} · {m.size}{!mine && " · কোর্সের সাথে"}</span>
                </span>
                {m.href && (
                  <a
                    href={m.href}
                    {...(isLink ? { target: "_blank", rel: "noopener noreferrer nofollow" } : { download: m.file ?? m.title })}
                    className={mediaButton({ variant: "ghost", size: "icon-sm" })}
                    aria-label={isLink ? `${m.title} খুলুন` : `${m.title} ডাউনলোড`}
                  >
                    {isLink ? <ExternalLink aria-hidden /> : <Download aria-hidden />}
                  </a>
                )}
                {mine && (
                  <button type="button" onClick={() => remove(m.at)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label={`${m.title} মুছুন`}>
                    <Trash2 aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
