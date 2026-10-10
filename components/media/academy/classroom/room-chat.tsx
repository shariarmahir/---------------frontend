"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Mic, Paperclip, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { getCourse } from "@/data/media/academy";
import { currentUser, personOrThrow } from "@/data/media/users";
import { sizeParts } from "@/lib/media/academy";
import type { Batch, RoomFile, RoomMessage } from "@/lib/media/batch";
import { NOTE_FILE_MAX } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { updateAcademy } from "../use-academy";
import { useRoomChat } from "./use-batches";

const ACCEPT: Record<RoomFile["kind"], string> = {
  file: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip",
  image: "image/*",
  audio: "audio/*",
};

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Who wrote a line, as an avatar-ready person: a member by handle, a sample learner by name. */
function author(m: RoomMessage) {
  if ("handle" in m.by) {
    const p = personOrThrow(m.by.handle);
    return { key: p.handle, nameBn: p.nameBn, person: p };
  }
  const name = m.by.name;
  return { key: name, nameBn: name, person: { nameBn: name, initials: name.slice(0, 1), tone: "green" as const } };
}

/**
 * The batch's own chat, after a course site's "Course Chat": who is in it,
 * the conversation with the teacher marked, and a composer with a send
 * button and three ways to add something — a file, a picture, a voice note
 * (each up to 1.5 MB, kept on this device).
 */
export function RoomChat({ batch, compact, className }: { batch: Batch; compact?: boolean; className?: string }) {
  const { num } = useFormat();
  const messages = useRoomChat(batch);
  const course = getCourse(batch.course);
  const [text, setText] = useState("");
  const list = useRef<HTMLOListElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<RoomFile["kind"]>("file");

  // New lines scroll into view.
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages.length]);

  function post(body: string, file?: RoomFile) {
    const m: RoomMessage = { id: newId("rm"), by: { handle: currentUser.handle }, text: body, ...(file ? { file } : {}), at: new Date().toISOString() };
    if (!updateAcademy((a) => ({ ...a, roomChat: { ...a.roomChat, [batch.id]: [...(a.roomChat?.[batch.id] ?? []), m] } }))) {
      toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "পুরোনো ফাইল মুছুন, বা লিংক দিন।" });
    }
  }

  async function attach(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const { value, unit } = sizeParts(f.size);
    if (f.size > NOTE_FILE_MAX) {
      toast.error(`${f.name} — ${num(value)} ${unit}`, { description: "১.৫ এমবি পর্যন্ত পাঠানো যায়; বড় ফাইল ড্রাইভে তুলে লিংক দিন।" });
      return;
    }
    try {
      post(text.trim(), { kind, name: f.name, size: `${num(value)} ${unit}`, href: await readDataUrl(f) });
      setText("");
    } catch {
      toast.error(`${f.name} পড়া গেল না`);
    }
  }

  function choose(k: RoomFile["kind"]) {
    setKind(k);
    // The input's accept list follows the kind; open it after React applies it.
    requestAnimationFrame(() => picker.current?.click());
  }

  const people = new Set(messages.map((m) => author(m).key)).size;

  return (
    <section aria-labelledby={`chat-${batch.id}`} className={cn("flex min-h-0 flex-col bg-(--c-bg)", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <h2 id={`chat-${batch.id}`} className="display text-xl text-(--c-ink-strong)">
            ব্যাচের আড্ডা
          </h2>
          <p className="mt-0.5 text-sm text-(--c-muted)">
            <Num value={batch.enrolled + 1} /> জন সদস্য · এখানে লিখেছেন <Num value={people} /> জন
          </p>
        </div>
        {course && !compact && (
          <span className="flex -space-x-2" aria-hidden>
            {[...new Map(messages.map((m) => [author(m).key, author(m).person])).values()].slice(0, 4).map((p) => (
              <PersonAvatar key={p.nameBn} person={p} size="sm" className="ring-2 ring-(--c-bg)" />
            ))}
          </span>
        )}
      </header>

      <ol ref={list} className={cn("min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-2 scrollbar-gold", compact ? "max-h-none" : "max-h-[26rem] xl:max-h-none")} aria-live="polite">
        {messages.length === 0 && <li className="py-8 text-center text-sm text-(--c-faint)">প্রথম বার্তাটা আপনিই লিখুন — নিজের পরিচয় দিন।</li>}
        {messages.map((m) => {
          const a = author(m);
          const me = "handle" in m.by && m.by.handle === currentUser.handle;
          const teacher = "handle" in m.by && m.by.handle === course?.teacher;
          return (
            <li key={m.id} className={cn("flex items-end gap-2.5", me && "flex-row-reverse")}>
              {!me && <PersonAvatar person={a.person} size="sm" className="mb-5 shrink-0" />}
              <div className={cn("max-w-[82%]", me && "text-right")}>
                {!me && (
                  <p className="mb-1 text-xs font-semibold text-(--c-muted)">
                    {a.nameBn}
                    {teacher && <span className="ml-1.5 bg-(--c-signal) px-1.5 py-px text-[10px] font-bold text-black">শিক্ষক</span>}
                  </p>
                )}
                <div className={cn("inline-block px-3.5 py-2.5 text-left text-[15px] leading-relaxed", me ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "border border-(--c-line) bg-(--c-bg-raised) text-(--c-ink-strong)")}>
                  {m.file && <Attachment file={m.file} me={me} />}
                  {m.text && <p className={cn(m.file && "mt-2")}>{m.text}</p>}
                </div>
                <p className="mt-1 text-[11px] text-(--c-faint)">
                  <DateText iso={m.at} time />
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const body = text.trim();
          if (!body) return;
          post(body);
          setText("");
        }}
        className="space-y-2.5 border-t border-(--c-line) p-4"
      >
        <div className="flex items-center gap-2 border border-(--c-line-strong) bg-(--c-bg-sunken) p-1.5 pl-4 transition-colors duration-150 focus-within:border-(--c-signal)">
          <label htmlFor={`msg-${batch.id}`} className="sr-only">
            বার্তা
          </label>
          <input
            id={`msg-${batch.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            autoComplete="off"
            placeholder="বার্তা লিখুন…"
            className="h-9 min-w-0 flex-1 bg-transparent text-[15px] text-(--c-ink-strong) placeholder:text-(--c-faint) focus:outline-none"
          />
          <button type="submit" disabled={!text.trim()} className="grid size-9 shrink-0 place-items-center bg-(--c-signal) text-black transition-opacity duration-150 hover:opacity-80 disabled:opacity-40" aria-label="পাঠান">
            <SendHorizontal className="size-4" aria-hidden />
          </button>
        </div>
        {!compact && (
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["file", "ফাইল", Paperclip],
                ["image", "ছবি", ImageIcon],
                ["audio", "অডিও", Mic],
              ] as const
            ).map(([k, label, Icon]) => (
              <button
                key={k}
                type="button"
                onClick={() => choose(k)}
                className="inline-flex h-10 items-center justify-center gap-1.5 border border-(--c-line) text-sm font-semibold text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        )}
        <input
          ref={picker}
          type="file"
          accept={ACCEPT[kind]}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void attach(e.target.files);
            e.target.value = "";
          }}
        />
      </form>
    </section>
  );
}

function Attachment({ file, me }: { file: RoomFile; me: boolean }) {
  if (file.kind === "image") {
    return (
      <a href={file.href} download={file.name} className="block overflow-hidden">
        <Image src={file.href} alt={file.name} width={320} height={200} unoptimized className="h-auto max-h-56 w-full object-cover" />
      </a>
    );
  }
  if (file.kind === "audio") return <audio src={file.href} controls preload="none" className="h-10 w-60 max-w-full" />;
  return (
    <a href={file.href} download={file.name} className={cn("flex items-center gap-2.5 px-3 py-2", me ? "bg-black/10" : "bg-(--c-bg)")}>
      <FileText className="size-5 shrink-0" aria-hidden />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{file.name}</span>
        <span className={cn("text-xs", me ? "opacity-70" : "text-(--c-faint)")}>{file.size}</span>
      </span>
    </a>
  );
}
