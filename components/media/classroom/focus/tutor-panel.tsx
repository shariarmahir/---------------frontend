"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, FileText, ImageIcon, Mic, Paperclip, Presentation, RotateCcw, SendHorizontal, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { ACCEPT, MAX_FILES, SAVED, toTurns, type AttachKind, type TutorContext, type TutorMsg } from "@/lib/media/tutor";
import { cn } from "@/lib/utils";
import { useFormat, useNumerals } from "../../ui/numerals";
import { readForTutor, type Picked } from "./read-file";
import { VOICE_LANGS, useSpeaker, useVoice } from "./use-voice";

const SUGGEST = ["এই অধ্যায়টা সহজ করে বুঝিয়ে দিন", "আমার অঙ্কের ভুলটা ধরিয়ে দিন", "পাঁচটা MCQ বানিয়ে আমাকে পরীক্ষা নিন", "স্লাইডগুলোর সারাংশ দিন"];

const KIND_ICON: Record<AttachKind, typeof FileText> = { image: ImageIcon, pdf: FileText, office: Presentation, legacy: Presentation, text: FileText };

const save = (m: TutorMsg) => updateMedia((s) => ({ ...s, tutor: [...s.tutor, m].slice(-SAVED) }));

/** The right-hand AI study helper: type, speak or drop a file, and it explains. */
export function TutorPanel({ context, onClose }: { context: TutorContext; onClose?: () => void }) {
  const list = useMediaState((s) => s.tutor);
  const { numerals } = useNumerals();
  const { num } = useFormat();
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [reading, setReading] = useState(0);
  const [live, setLive] = useState<{ id: string; text: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [drag, setDrag] = useState(false);
  const [lang, setLang] = useState<string>(VOICE_LANGS[0].id);
  const abort = useRef<AbortController | null>(null);
  const lastFiles = useRef<Picked[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const speaker = useSpeaker();
  const busy = live !== null;

  const voice = useVoice({
    lang,
    onHeard: setDraft,
    onDone: (t) => void send(t, true),
    onError: (msg) => toast.error(msg),
  });

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [list.length, live?.text, reduce]);

  useEffect(() => () => abort.current?.abort(), []);

  async function add(files: FileList | File[]) {
    const room = MAX_FILES - picked.length;
    const take = [...files].slice(0, room);
    if (files.length > room) toast.message(`একবারে সবচেয়ে বেশি ${num(MAX_FILES)}টি ফাইল`);
    setReading((n) => n + take.length);
    for (const f of take) {
      try {
        const p = await readForTutor(f);
        setPicked((all) => (all.some((x) => x.id === p.id) ? all : [...all, p].slice(0, MAX_FILES)));
      } catch (err) {
        toast.error(f.name, { description: err instanceof Error ? err.message : "ফাইলটা পড়া গেল না।" });
      } finally {
        setReading((n) => n - 1);
      }
    }
  }

  async function ask(history: TutorMsg[], files: Picked[], spoken: boolean) {
    const id = newId("ta");
    const ctrl = new AbortController();
    abort.current = ctrl;
    setFailed(false);
    setLive({ id, text: "" });
    let text = "";
    let mode: TutorMsg["mode"] = "claude";
    try {
      const res = await fetch("/media/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: toTurns(history, files.map((p) => p.file)), context, numerals }),
        signal: ctrl.signal,
      });
      const header = res.headers.get("X-Tutor-Mode");
      if (!res.ok || !res.body || !header) throw new Error(res.status === 400 ? "bad" : "net");
      mode = header === "offline" ? "offline" : "claude";
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        setLive({ id, text });
      }
      text += dec.decode();
      save({ id, role: "assistant", text: text.trim(), at: new Date().toISOString(), mode });
      if (spoken) speaker.speak(id, text);
    } catch (err) {
      if (ctrl.signal.aborted) {
        if (text.trim()) save({ id, role: "assistant", text: `${text.trim()}\n\n(থামানো হলো)`, at: new Date().toISOString(), mode });
      } else {
        setFailed(true);
        lastFiles.current = files;
        if (err instanceof Error && err.message === "bad") toast.error("ফাইল বা প্রশ্নটা বেশি বড় — ছোট করে আবার পাঠান।");
      }
    } finally {
      abort.current = null;
      setLive(null);
    }
  }

  async function send(raw: string, spoken = false) {
    const text = raw.trim();
    if (busy || reading > 0 || (!text && picked.length === 0)) return;
    const files = picked;
    const msg: TutorMsg = { id: newId("tu"), role: "user", text, at: new Date().toISOString(), ...(files.length && { files: files.map((p) => ({ name: p.name, kind: p.kind })) }), ...(spoken && { voice: true }) };
    save(msg);
    setDraft("");
    setPicked([]);
    speaker.stop();
    await ask([...list, msg], files, spoken);
    box.current?.focus();
  }

  function clear() {
    abort.current?.abort();
    speaker.stop();
    updateMedia((s) => ({ ...s, tutor: [] }));
    setFailed(false);
  }

  const empty = list.length === 0 && !live;

  return (
    <section
      aria-label="মেধাবী বন্ধু"
      className="relative flex h-full min-h-0 flex-col bg-m-canvas"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        void add(e.dataTransfer.files);
      }}
    >
      <header className="flex items-center gap-3 border-b border-m-ink/10 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-yellow text-m-ink">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-m-ink">মেধাবী বন্ধু</h2>
          <p className="truncate text-xs text-m-ink/65">{context.room ? `${context.room} খোলা আছে` : "যেকোনো বিষয়ে প্রশ্ন করুন"}</p>
        </div>
        {list.length > 0 && (
          <button type="button" onClick={clear} className="grid size-9 place-items-center rounded-lg text-m-ink/70 transition-colors hover:bg-m-ink/6 hover:text-m-ink" title="নতুন আলাপ">
            <RotateCcw className="size-4.5" aria-hidden />
            <span className="sr-only">নতুন আলাপ শুরু করুন</span>
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-m-ink/70 transition-colors hover:bg-m-ink/6 hover:text-m-ink">
            <X className="size-5" aria-hidden />
            <span className="sr-only">সহায়ক বন্ধ করুন</span>
          </button>
        )}
      </header>

      <div className="scrollbar-gold min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {empty ? (
          <div className="space-y-5 pt-2">
            <div className="rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
              <p className="text-[15px] leading-relaxed text-m-ink">বইয়ের পাতার ছবি, PDF, Word বা স্লাইড দিন — অথবা মাইকে বলুন। ধাপে ধাপে বুঝিয়ে দেব, তারপর ছোট প্রশ্নে যাচাই করব।</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-m-ink/75">
                {[
                  [ImageIcon, "ছবি"],
                  [FileText, "PDF"],
                  [FileText, "Word"],
                  [Presentation, "PowerPoint"],
                  [Mic, "ভয়েস"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof FileText;
                  return (
                    <li key={label as string} className="inline-flex items-center gap-1.5 rounded-full bg-m-ink/4 px-2.5 py-1">
                      <I className="size-3.5 text-m-blue" aria-hidden /> {label as string}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-m-ink/60">শুরু করতে পারেন</p>
              {SUGGEST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setDraft(s);
                    box.current?.focus();
                  }}
                  className="block w-full rounded-xl border border-m-ink/10 px-3 py-2.5 text-left text-sm text-m-ink/85 transition-colors hover:border-m-blue/50 hover:bg-m-ink/3 hover:text-m-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-4">
            {list.map((m) => (
              <Bubble key={m.id} m={m} speaking={speaker.speaking === m.id} canSpeak={speaker.supported} onSpeak={() => (speaker.speaking === m.id ? speaker.stop() : speaker.speak(m.id, m.text))} />
            ))}
            {live && (
              <li className="flex">
                <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-m-card px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-m-ink ring-1 ring-m-ink/10 shadow-m-tile">
                  {live.text || <Thinking />}
                </div>
              </li>
            )}
            {failed && (
              <li className="rounded-xl bg-m-ink/3 p-3 text-sm text-m-ink/80 ring-1 ring-m-ink/10">
                উত্তর আনা গেল না — ইন্টারনেট দেখে আবার চেষ্টা করুন।
                <button type="button" onClick={() => void ask(list, lastFiles.current, false)} className="ml-2 font-bold text-m-blue hover:underline">
                  আবার চেষ্টা
                </button>
              </li>
            )}
          </ol>
        )}
        <div ref={end} />
      </div>

      <form
        className="border-t border-m-ink/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        {(picked.length > 0 || reading > 0) && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {picked.map((p) => {
              const Icon = KIND_ICON[p.kind];
              return (
                <li key={p.id} className="flex max-w-full items-center gap-2 rounded-xl bg-m-card py-1 pr-1 pl-1.5 text-xs text-m-ink ring-1 ring-m-ink/10">
                  {p.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local data URL thumbnail
                    <img src={p.preview} alt="" className="size-8 rounded-lg object-cover" />
                  ) : (
                    <span className="grid size-8 place-items-center rounded-lg bg-m-ink/4">
                      <Icon className="size-4 text-m-blue" aria-hidden />
                    </span>
                  )}
                  <span className="max-w-36 truncate">{p.name}</span>
                  <button type="button" onClick={() => setPicked((all) => all.filter((x) => x.id !== p.id))} className="grid size-7 place-items-center rounded-lg hover:bg-m-ink/6">
                    <X className="size-3.5" aria-hidden />
                    <span className="sr-only">{p.name} সরান</span>
                  </button>
                </li>
              );
            })}
            {reading > 0 && <li className="flex items-center rounded-xl bg-m-ink/3 px-3 text-xs text-m-ink/70">ফাইল পড়া হচ্ছে…</li>}
          </ul>
        )}
        <div className={cn("rounded-2xl bg-m-card ring-1 transition-shadow shadow-m-tile", voice.listening ? "ring-2 ring-m-blue" : "ring-m-ink/10 focus-within:ring-m-blue/60")}>
          <label htmlFor="tutor-box" className="sr-only">
            মেধাবী বন্ধুকে প্রশ্ন
          </label>
          <textarea
            id="tutor-box"
            ref={box}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(draft);
              }
            }}
            onPaste={(e) => {
              const files = [...e.clipboardData.files];
              if (files.length) {
                e.preventDefault();
                void add(files);
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder={voice.listening ? "শুনছি… বলা শেষ হলে নিজেই পাঠাব" : "প্রশ্ন লিখুন, ফাইল দিন বা মাইকে বলুন"}
            className="block max-h-40 min-h-14 w-full resize-none bg-transparent px-3.5 pt-3 text-[15px] leading-relaxed text-m-ink outline-none placeholder:text-m-ink/45"
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden onChange={(e) => {
              if (e.target.files) void add(e.target.files);
              e.target.value = "";
            }} />
            <button type="button" onClick={() => fileInput.current?.click()} disabled={picked.length >= MAX_FILES} className="grid size-9 place-items-center rounded-lg text-m-ink/75 transition-colors hover:bg-m-ink/6 hover:text-m-ink disabled:opacity-40" title="ছবি, PDF, Word বা PowerPoint যোগ করুন">
              <Paperclip className="size-4.5" aria-hidden />
              <span className="sr-only">ফাইল যোগ করুন</span>
            </button>
            <button
              type="button"
              onClick={voice.listening ? voice.stop : voice.start}
              disabled={!voice.supported || busy}
              aria-pressed={voice.listening}
              title={voice.supported ? "মাইকে বলুন" : "এই ব্রাউজারে ভয়েস চলে না — Chrome বা Edge-এ খুলুন"}
              className={cn("relative grid size-9 place-items-center rounded-lg transition-colors disabled:opacity-40", voice.listening ? "bg-m-yellow text-m-ink" : "text-m-ink/75 hover:bg-m-ink/6 hover:text-m-ink")}
            >
              {voice.listening && !reduce && <span aria-hidden className="absolute inset-0 animate-ping rounded-lg bg-m-yellow/50" />}
              <Mic className="relative size-4.5" aria-hidden />
              <span className="sr-only">{voice.listening ? "শোনা থামান" : "মাইকে বলুন"}</span>
            </button>
            <button
              type="button"
              onClick={() => setLang((l) => (l === VOICE_LANGS[0].id ? VOICE_LANGS[1].id : VOICE_LANGS[0].id))}
              disabled={!voice.supported || voice.listening}
              className="h-7 rounded-md px-1.5 text-[11px] font-bold text-m-ink/60 ring-1 ring-m-ink/13 hover:text-m-ink disabled:opacity-40"
              title="ভয়েসের ভাষা"
            >
              {VOICE_LANGS.find((v) => v.id === lang)!.label}
            </button>
            <span className="flex-1" />
            {busy ? (
              <button type="button" onClick={() => abort.current?.abort()} className="grid size-10 place-items-center rounded-xl bg-m-ink text-m-on transition-transform active:scale-95">
                <Square className="size-4 fill-current" aria-hidden />
                <span className="sr-only">উত্তর থামান</span>
              </button>
            ) : (
              <button type="submit" disabled={reading > 0 || (!draft.trim() && picked.length === 0)} className="grid size-10 place-items-center rounded-xl bg-m-yellow text-m-ink transition-[scale,opacity] active:scale-95 disabled:opacity-40">
                <SendHorizontal className="size-5" aria-hidden />
                <span className="sr-only">পাঠান</span>
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 px-1 text-[11px] text-m-ink/50">AI ভুল করতে পারে — দরকারি তথ্য বই বা শিক্ষকের কাছে মিলিয়ে নিন।</p>
      </form>

      <AnimatePresence>
        {drag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-2 grid place-items-center rounded-2xl border-2 border-dashed border-m-blue bg-white/90 text-center"
          >
            <p className="text-base font-bold text-m-blue">
              ফাইল এখানে ছাড়ুন
              <span className="mt-1 block text-xs font-medium text-m-ink/70">ছবি · PDF · Word · PowerPoint</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Thinking() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="ভাবছে">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-m-yellow motion-reduce:animate-none" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

function Bubble({ m, speaking, canSpeak, onSpeak }: { m: TutorMsg; speaking: boolean; canSpeak: boolean; onSpeak: () => void }) {
  if (m.role === "user") {
    return (
      <li className="flex flex-col items-end gap-1.5">
        {m.files?.length ? (
          <ul className="flex flex-wrap justify-end gap-1.5">
            {m.files.map((f) => {
              const Icon = KIND_ICON[f.kind];
              return (
                <li key={f.name} className="inline-flex max-w-52 items-center gap-1.5 rounded-lg bg-m-ink/4 px-2 py-1 text-xs text-m-ink/80">
                  <Icon className="size-3.5 shrink-0 text-m-blue" aria-hidden />
                  <span className="truncate">{f.name}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
        {m.text && (
          <p className="max-w-[88%] rounded-2xl rounded-tr-md bg-m-yellow px-4 py-2.5 text-[15px] leading-relaxed font-medium whitespace-pre-wrap text-m-ink">
            {m.voice && <Mic className="mr-1.5 inline size-3.5 align-[-2px]" aria-label="ভয়েসে বলা" />}
            {m.text}
          </p>
        )}
      </li>
    );
  }
  return (
    <li className="flex flex-col items-start gap-1.5">
      <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-m-card px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-m-ink ring-1 ring-m-ink/10 shadow-m-tile">{m.text}</div>
      <div className="flex items-center gap-1 pl-1 text-m-ink/55">
        {m.mode === "offline" && <span className="mr-1 rounded-full bg-m-ink/4 px-2 py-0.5 text-[11px] font-semibold text-m-ink/70">অফলাইন সহায়ক</span>}
        {canSpeak && (
          <button type="button" onClick={onSpeak} aria-pressed={speaking} className={cn("grid size-7 place-items-center rounded-md hover:bg-m-ink/6 hover:text-m-ink", speaking && "text-m-blue")} title={speaking ? "পড়া থামান" : "শুনুন"}>
            {speaking ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            <span className="sr-only">{speaking ? "পড়া থামান" : "উত্তরটা শুনুন"}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(m.text).then(() => toast.success("উত্তর কপি হলো"))}
          className="grid size-7 place-items-center rounded-md hover:bg-m-ink/6 hover:text-m-ink"
          title="কপি"
        >
          <Copy className="size-3.5" aria-hidden />
          <span className="sr-only">উত্তর কপি করুন</span>
        </button>
      </div>
    </li>
  );
}
