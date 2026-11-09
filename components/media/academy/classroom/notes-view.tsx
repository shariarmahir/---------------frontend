"use client";

import { useRef, useState } from "react";
import { Download, File as FileIcon, FileText, Film, ImageIcon, Music, Presentation, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { sizeParts } from "@/lib/media/academy";
import type { Batch } from "@/lib/media/batch";
import { NOTE_FILE_MAX } from "@/lib/media/classroom";
import { STUDY_GROUPS, groupOf, type StudyFile, type StudyGroup } from "@/lib/media/study-file";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Tx } from "../../ui/language";
import { DateText, Num, useFormat } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

const NONE: StudyFile[] = [];
const ICON: Record<StudyGroup, typeof FileIcon> = { image: ImageIcon, video: Film, audio: Music, pdf: FileText, slides: Presentation, other: FileIcon };

export const useStudyFiles = (batchId: string) => useAcademy((a) => a.shared?.[batchId] ?? NONE);

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/**
 * The batch's study shelf: anyone in the class shares a picture, a video, a
 * slide deck, a PDF or any other file (up to 1.5 MB, kept on this device) and
 * everyone downloads it. Sharers and the teacher may take a file down.
 */
export function NotesView({ batch, lead, me }: { batch: Batch; lead: boolean; me: string }) {
  const { num } = useFormat();
  const files = useStudyFiles(batch.id);
  const picker = useRef<HTMLInputElement>(null);
  const [shelf, setShelf] = useState<StudyGroup | "all">("all");
  const [title, setTitle] = useState("");

  async function add(list: FileList | null) {
    const f = list?.[0];
    if (!f) return;
    const { value, unit } = sizeParts(f.size);
    if (f.size > NOTE_FILE_MAX) return toast.error(`${f.name} — ${num(value)} ${unit}`, { description: "১.৫ এমবি পর্যন্ত রাখা যায়; বড় ফাইল ড্রাইভে তুলে লিংক দিন।" });
    try {
      const href = await readDataUrl(f);
      const file: StudyFile = {
        id: newId("sf"),
        title: title.trim() || f.name,
        by: me,
        mine: true,
        at: new Date().toISOString(),
        name: f.name,
        size: `${num(value)} ${unit}`,
        type: f.type,
        href,
      };
      if (!updateAcademy((a) => ({ ...a, shared: { ...a.shared, [batch.id]: [file, ...(a.shared?.[batch.id] ?? [])] } })))
        toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "পুরোনো ফাইল মুছুন।" });
      else setTitle("");
    } catch {
      toast.error(`${f.name} পড়া গেল না`);
    }
  }

  const remove = (id: string) => updateAcademy((a) => ({ ...a, shared: { ...a.shared, [batch.id]: (a.shared?.[batch.id] ?? []).filter((x) => x.id !== id) } }));
  const shown = files.filter((f) => shelf === "all" || groupOf(f) === shelf);
  const present = (Object.keys(STUDY_GROUPS) as StudyGroup[]).filter((g) => files.some((f) => groupOf(f) === g));

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display text-3xl text-(--c-ink-strong)">
          <Tx k="ক্লাসের নোট ও ফাইল" />
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="ফাইলের নাম (ঐচ্ছিক)"
            aria-label="ফাইলের নাম"
            className="h-11 w-full border sm:w-56 border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong) placeholder:text-(--c-faint) focus:border-(--c-signal) focus:outline-none"
          />
          <button type="button" onClick={() => picker.current?.click()} className="inline-flex h-11 items-center gap-2 bg-(--c-signal) px-5 font-bold text-black hover:opacity-85">
            <Upload className="size-4" aria-hidden /> <Tx k="ফাইল দিন" />
          </button>
          <input
            ref={picker}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void add(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </header>

      {present.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {(["all", ...present] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setShelf(g)}
              aria-pressed={shelf === g}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-bold transition-colors",
                shelf === g ? "bg-(--c-blue) text-white" : "bg-(--c-bg-raised) text-(--c-muted) ring-1 ring-(--c-line) hover:text-(--c-ink-strong)",
              )}
            >
              <Tx k={g === "all" ? "সব" : STUDY_GROUPS[g]} />
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-3xl bg-(--c-bg-raised) p-6 text-(--c-muted) ring-1 ring-(--c-line)">
          <Tx k="এখনো কোনো ফাইল নেই — ছবি, ভিডিও, স্লাইড বা পিডিএফ দিয়ে শুরু করুন।" />
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((f) => {
            const g = groupOf(f);
            const Icon = ICON[g];
            return (
              <li key={f.id} className="flex flex-col overflow-hidden rounded-3xl bg-(--c-bg-raised) ring-1 ring-(--c-line)">
                {g === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.href} alt={f.title} className="h-44 w-full object-cover" />
                ) : g === "video" ? (
                  <video src={f.href} controls preload="metadata" className="h-44 w-full bg-black object-cover" />
                ) : g === "audio" ? (
                  <div className="grid h-44 place-items-center bg-(--c-bg-sunken) p-4">
                    <audio src={f.href} controls preload="none" className="w-full" />
                  </div>
                ) : (
                  <div className="grid h-44 place-items-center bg-(--c-bg-sunken) text-(--c-accent-ink)">
                    <Icon className="size-14" strokeWidth={1.25} aria-hidden />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="truncate font-bold text-(--c-ink-strong)">{f.title}</p>
                  <p className="hud text-(--c-faint)">
                    {f.by} · <DateText iso={f.at} /> · {f.size}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a href={f.href} download={f.name} className="inline-flex h-9 items-center gap-2 bg-(--c-blue) px-4 text-sm font-bold text-(--c-signal) hover:opacity-85">
                      <Download className="size-4" aria-hidden /> <Tx k="নামান" />
                    </a>
                    {(f.mine || lead) && (
                      <button type="button" onClick={() => remove(f.id)} aria-label="ফাইল মুছুন" className="text-(--c-muted) hover:text-(--c-bad)">
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="hud text-(--c-faint)">
        <Num value={files.length} /> <Tx k="টি ফাইল" />
      </p>
    </div>
  );
}
