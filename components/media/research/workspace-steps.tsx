"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Crown, Download, ExternalLink, FileSpreadsheet, FileText, Link2, Plus, Presentation, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WEEKDAYS, fileTooBig, type NoteFile } from "@/lib/media/classroom";
import { daysUntil } from "@/lib/media/lab";
import {
  FILE_KINDS, MAX_IDEAS, SECTIONS, TASK_STATUS, VOTES, fileKind, isSheetLink, leading, monthGrid, pollOpen, shiftMonth, tally, writeDone,
  type FileKind, type ResearchFile, type ResearchProject, type TaskStatus, type Vote, type WriteUp,
} from "@/lib/media/research-project";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { selectClass } from "../ui/field-styles";
import { DateText, Num } from "../ui/numerals";

export interface StepProps {
  p: ResearchProject;
  meId?: string;
  /** In the research team: may vote, add and edit their own work. */
  inTeam: boolean;
  /** Runs it: locks the topic, sets dates, edits anything. */
  lead: boolean;
  today: string;
  now: Date;
  edit: (fn: (p: ResearchProject) => ResearchProject) => boolean;
  name: (id: string) => string;
}

/** What to do on this step, in a few plain lines. */
export function Guide({ title, tips }: { title: string; tips: string[] }) {
  return (
    <aside className="story-reveal rounded-2xl bg-m-blue-soft p-4 text-m-ink sm:p-5">
      <h3 className="text-sm font-bold text-m-blue">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-m-ink/90">
        {tips.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden />{t}</li>)}
      </ul>
    </aside>
  );
}

const initial = (n: string) => Array.from(n.trim())[0] ?? "?";

/* ───────────── 1. Topic poll ───────────── */

export function TopicStep({ p, meId, inTeam, lead, today, edit, name }: StepProps) {
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const open = pollOpen(p, today);
  const top = p.ideas.some((i) => Object.keys(i.votes).length > 0) ? leading(p.ideas) : null;
  const left = daysUntil(p.topicDeadline, new Date(`${today}T12:00:00+06:00`));

  function vote(ideaId: string, v: Vote) {
    if (!meId) return;
    edit((x) => ({
      ...x,
      ideas: x.ideas.map((i) => {
        if (i.id !== ideaId) return i;
        const votes = { ...i.votes };
        if (votes[meId] === v) delete votes[meId];
        else votes[meId] = v;
        return { ...i, votes };
      }),
    }));
  }

  return (
    <div className="space-y-5">
      <Guide
        title="কীভাবে বিষয় বাছবেন"
        tips={[
          "সবাই মিলে সর্বোচ্চ তিনটি বিষয় প্রস্তাব করুন — এমন সমস্যা যা আশেপাশে সত্যিই আছে।",
          "প্রতিটিতে মত দিন: 👍 একমত, 🤔 ভেবে দেখি, 👎 একমত নই। মত বদলানো যায়।",
          "ভোট শেষ হলে লিড সবচেয়ে সমর্থিত বিষয়টি চূড়ান্ত করবেন।",
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
        <p className="text-sm text-m-ink">
          {p.topicId ? (
            <span className="font-bold text-m-green">বিষয় চূড়ান্ত হয়েছে।</span>
          ) : open ? (
            <>ভোট চলছে — শেষ দিন <span className="font-bold text-m-blue"><DateText iso={p.topicDeadline} weekday /></span> ({left === 0 ? "আজই" : <><Num value={left} /> দিন বাকি</>})</>
          ) : (
            <span className="font-bold text-m-blue">ভোটের সময় শেষ — লিড এখন বিষয় চূড়ান্ত করবেন।</span>
          )}
        </p>
        {lead && !p.topicId && (
          <label className="flex items-center gap-2 text-xs text-m-ink/70">
            শেষ দিন বদলান
            <Input type="date" min={today} value={p.topicDeadline} onChange={(e) => e.target.value && edit((x) => ({ ...x, topicDeadline: e.target.value }))} className="h-9 w-auto" />
          </label>
        )}
        {lead && p.topicId && (
          <button type="button" onClick={() => edit((x) => ({ ...x, topicId: undefined, topicDeadline: x.topicDeadline < today ? today : x.topicDeadline }))} className={mediaButton({ variant: "ghost", size: "sm" })}>আবার ভোট খুলুন</button>
        )}
      </div>

      <ol className="grid gap-4 lg:grid-cols-3">
        {p.ideas.map((idea, n) => {
          const t = tally(idea);
          const chosen = p.topicId === idea.id;
          const dim = Boolean(p.topicId) && !chosen;
          const mine = meId ? idea.votes[meId] : undefined;
          return (
            <li key={idea.id} className={cn("story-reveal flex flex-col gap-3 rounded-2xl p-5 ring-2 transition-[opacity,box-shadow] duration-300", chosen ? "bg-m-yellow text-m-ink ring-m-blue" : "bg-m-card text-m-ink ring-m-ink/10", dim && "opacity-55")}>
              <span className="flex items-center gap-2 text-xs font-bold">
                <span className={cn("rounded-full px-2.5 py-0.5", chosen ? "bg-m-card text-m-blue" : "bg-m-ink/6")}>বিষয় <Num value={n + 1} /></span>
                {chosen && <span className="inline-flex items-center gap-1"><Crown className="size-3.5" aria-hidden /> চূড়ান্ত</span>}
                {!p.topicId && top?.id === idea.id && <span className="rounded-full bg-m-blue-soft px-2.5 py-0.5 text-m-ink">এগিয়ে</span>}
                <span className="ml-auto font-medium opacity-65">{name(idea.by)}</span>
              </span>
              <h3 className="text-lg leading-snug font-bold">{idea.title}</h3>
              {idea.why && <p className="text-sm leading-relaxed opacity-80">{idea.why}</p>}
              <div className="mt-auto flex gap-2" role="group" aria-label="আপনার মত">
                {(Object.keys(VOTES) as Vote[]).map((v) => {
                  const on = mine === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={!inTeam || Boolean(p.topicId)}
                      aria-pressed={on}
                      onClick={() => vote(idea.id, v)}
                      title={VOTES[v].bn}
                      className={cn(
                        "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ring-1 transition-[transform,background-color] duration-150 active:scale-90 disabled:cursor-default motion-reduce:active:scale-100",
                        on ? (chosen ? "bg-m-card text-m-ink ring-m-card" : "bg-m-yellow text-m-ink ring-m-blue") : chosen ? "ring-m-ink/25" : "ring-m-ink/13 hover:ring-m-ink/34",
                      )}
                    >
                      <span className={cn("text-lg leading-none transition-transform duration-200", on && "scale-125 motion-reduce:scale-100")} aria-hidden>{VOTES[v].emoji}</span>
                      <Num value={t[v]} />
                      <span className="sr-only">{VOTES[v].bn}</span>
                    </button>
                  );
                })}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/45" aria-hidden>
                <div className={cn("h-full rounded-full transition-[width] duration-500", chosen ? "bg-m-card" : "bg-m-green-soft")} style={{ width: `${(t.agree / Math.max(1, p.members.length)) * 100}%` }} />
              </div>
              <span className="text-xs opacity-70"><Num value={t.agree} />/<Num value={p.members.length} /> জন একমত</span>
              {lead && !p.topicId && (
                <button type="button" onClick={() => edit((x) => ({ ...x, topicId: idea.id })) && toast.success("বিষয় চূড়ান্ত", { description: idea.title })} className={mediaButton({ variant: "outline", size: "sm" })}>
                  <Crown aria-hidden /> এটাই চূড়ান্ত
                </button>
              )}
            </li>
          );
        })}
        {!p.topicId &&
          Array.from({ length: MAX_IDEAS - p.ideas.length }, (_, k) => (
            <li key={`slot${k}`} className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-m-ink/13 p-5">
              <span className="text-xs font-bold text-m-ink/55">বিষয় <Num value={p.ideas.length + k + 1} /> — ফাঁকা</span>
              {k === 0 && inTeam ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!meId || title.trim().length < 5) return;
                    edit((x) => ({ ...x, ideas: [...x.ideas, { id: newId("i"), title: title.trim(), why: why.trim(), by: meId, votes: { [meId]: "agree" } }] }));
                    setTitle("");
                    setWhy("");
                  }}
                >
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="বিষয় প্রস্তাব করুন" aria-label="বিষয়" />
                  <Textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="কেন জরুরি" aria-label="কেন জরুরি" />
                  <button type="submit" disabled={title.trim().length < 5} className={mediaButton({ variant: "primary", size: "sm", className: "w-full" })}><Plus aria-hidden /> প্রস্তাব দিন</button>
                </form>
              ) : (
                <p className="text-sm text-m-ink/45">আরেকটি প্রস্তাবের জায়গা</p>
              )}
            </li>
          ))}
      </ol>
    </div>
  );
}

/* ───────────── 2. Calendar ───────────── */

export function PlanStep({ p, inTeam, lead, today, edit }: StepProps) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const on = new Map<string, ResearchProject["milestones"]>();
  for (const m of p.milestones) on.set(m.date, [...(on.get(m.date) ?? []), m]);
  const sorted = [...p.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const next = sorted.find((m) => !m.done && m.date >= today);
  const monthName = new Intl.DateTimeFormat("bn-BD", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));

  return (
    <div className="space-y-5">
      <Guide
        title="সময় ঠিক করুন"
        tips={["প্রতিটি ধাপের একটি শেষ তারিখ দিন — ছয় সপ্তাহের খসড়া আগেই বসানো আছে, বদলে নিন।", "পরীক্ষার সপ্তাহ এড়িয়ে চলুন; ডেটা সংগ্রহে সবচেয়ে বেশি সময় রাখুন।", "ধাপ শেষ হলে টিক দিন — সবাই অগ্রগতি দেখবে।"]}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <div className="story-reveal rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="আগের মাস"><ChevronLeft aria-hidden /></button>
            <span className="font-bold text-m-ink">{monthName}</span>
            <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="পরের মাস"><ChevronRight aria-hidden /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-m-ink/55">{WEEKDAYS.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthGrid(month).flat().map((d, i) => {
              const ms = d ? on.get(d) ?? [] : [];
              const vote = d === p.topicDeadline && !p.topicId;
              return (
                <div key={d ?? `x${i}`} className={cn("min-h-16 rounded-lg p-1 text-left", !d ? "" : d === today ? "bg-m-yellow/15 ring-2 ring-m-blue" : "bg-m-ink/3")}>
                  {d && <span className={cn("text-xs font-bold", d === today ? "text-m-blue" : "text-m-ink/70")}><Num value={Number(d.slice(8))} /></span>}
                  {ms.map((m) => (
                    <span key={m.id} className={cn("mt-0.5 block truncate rounded px-1 text-[10px] leading-4 font-semibold", m.done ? "bg-m-blue-soft text-m-ink" : "bg-m-yellow text-m-ink")} title={m.title}>{m.title}</span>
                  ))}
                  {vote && <span className="mt-0.5 block truncate rounded bg-m-ink px-1 text-[10px] leading-4 font-semibold text-m-on">ভোট শেষ</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {next && (
            <p className="rounded-2xl bg-m-yellow p-4 text-sm font-semibold text-m-ink">
              পরের ধাপ: <span className="font-bold">{next.title}</span> — <DateText iso={next.date} weekday /> ({daysUntil(next.date, new Date(`${today}T12:00:00+06:00`)) === 0 ? "আজ" : <><Num value={daysUntil(next.date, new Date(`${today}T12:00:00+06:00`))} /> দিন বাকি</>})
            </p>
          )}
          <ol className="space-y-2">
            {sorted.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl bg-m-card px-3 py-2 ring-1 ring-m-ink/10">
                <input type="checkbox" disabled={!inTeam} checked={Boolean(m.done)} onChange={() => edit((x) => ({ ...x, milestones: x.milestones.map((y) => (y.id === m.id ? { ...y, done: !y.done } : y)) }))} className="size-4 accent-m-blue" aria-label={`${m.title} শেষ`} />
                <span className={cn("min-w-0 flex-1 truncate text-sm", m.done ? "text-m-ink/50 line-through" : "text-m-ink")}>{m.title}</span>
                {lead ? (
                  <Input type="date" value={m.date} onChange={(e) => e.target.value && edit((x) => ({ ...x, milestones: x.milestones.map((y) => (y.id === m.id ? { ...y, date: e.target.value } : y)) }))} className="h-9 w-auto" aria-label={`${m.title} তারিখ`} />
                ) : (
                  <span className="text-xs text-m-ink/65"><DateText iso={m.date} /></span>
                )}
                {lead && <button type="button" onClick={() => edit((x) => ({ ...x, milestones: x.milestones.filter((y) => y.id !== m.id) }))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label={`${m.title} মুছুন`}><Trash2 aria-hidden /></button>}
              </li>
            ))}
          </ol>
          {lead && (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (title.trim().length < 3 || !date) return;
                edit((x) => ({ ...x, milestones: [...x.milestones, { id: newId("m"), title: title.trim(), date }] }));
                setTitle("");
                setDate("");
              }}
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="নতুন ধাপ" className="min-w-0 flex-1" aria-label="নতুন ধাপ" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" aria-label="তারিখ" />
              <button type="submit" className={mediaButton({ variant: "quiet" })}><Plus aria-hidden /> যোগ</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── 3. Tasks ───────────── */

const ORDER: TaskStatus[] = ["todo", "doing", "done"];

export function TasksStep({ p, meId, inTeam, lead, today, edit, name }: StepProps) {
  const [title, setTitle] = useState("");
  const [who, setWho] = useState(p.members[0]?.id ?? "");
  const [due, setDue] = useState("");
  const move = (id: string, by: number) =>
    edit((x) => ({ ...x, tasks: x.tasks.map((t) => (t.id === id ? { ...t, status: ORDER[Math.max(0, Math.min(2, ORDER.indexOf(t.status) + by))] } : t)) }));

  return (
    <div className="space-y-5">
      <Guide title="কাজ ভাগ করুন" tips={["প্রত্যেকের ভাগে অন্তত একটি কাজ — নাম আর শেষ তারিখসহ।", "যার কাজ, সে নিজেই ‘চলছে’ আর ‘শেষ’-এ সরাবে।", "কাজ ছোট রাখুন: “তিনটি পেপার পড়ে সারাংশ” — “গবেষণা করা” নয়।"]} />
      <ul className="flex flex-wrap gap-2">
        {p.members.map((m) => {
          const mine = p.tasks.filter((t) => t.who === m.id);
          return (
            <li key={m.id} className={cn("inline-flex min-h-9 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm", mine.length === 0 ? "bg-m-red/20 text-m-on ring-1 ring-m-red/50" : "bg-m-ink/4 text-m-ink ring-1 ring-m-ink/9")}>
              <span className="flex size-7 items-center justify-center rounded-full bg-m-yellow text-xs font-bold text-m-ink">{initial(m.name)}</span>
              {m.id === meId ? "আপনি" : m.name.split(/\s+/)[0]}
              <span className="text-xs text-m-ink/65">{mine.length === 0 ? "কাজ নেই" : <><Num value={mine.filter((t) => t.status === "done").length} />/<Num value={mine.length} /></>}</span>
            </li>
          );
        })}
      </ul>

      {inTeam && (
        <form
          className="grid gap-2 rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 sm:grid-cols-[minmax(0,1fr)_12rem_10rem_auto] shadow-m-tile"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim().length < 3 || !who) return;
            edit((x) => ({ ...x, tasks: [...x.tasks, { id: newId("t"), title: title.trim(), who, due: due || undefined, status: "todo" }] }));
            setTitle("");
            setDue("");
            toast.success("কাজ দেওয়া হলো", { description: `${name(who)} — ${title.trim()}` });
          }}
        >
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="কী কাজ" aria-label="কী কাজ" />
          <select value={who} onChange={(e) => setWho(e.target.value)} className={selectClass} aria-label="কার কাজ">
            {p.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="শেষ তারিখ" />
          <button type="submit" className={mediaButton({ variant: "primary" })}><Plus aria-hidden /> দিন</button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {ORDER.map((status) => {
          const list = p.tasks.filter((t) => t.status === status);
          return (
            <section key={status} aria-label={TASK_STATUS[status]} className="rounded-2xl bg-m-ink/3 p-3 ring-1 ring-m-ink/9">
              <h3 className="mb-3 flex items-center justify-between px-1 text-sm font-bold text-m-ink">
                {TASK_STATUS[status]}
                <span className="rounded-full bg-m-ink/6 px-2 text-xs"><Num value={list.length} /></span>
              </h3>
              <ul className="space-y-2">
                {list.map((t) => {
                  const mayMove = lead || t.who === meId;
                  const late = t.due && t.due < today && t.status !== "done";
                  return (
                    <li key={t.id} className={cn("live-in rounded-xl p-3 text-sm ring-1", status === "done" ? "bg-m-blue/13 ring-m-blue/50" : "bg-m-card ring-m-ink/10")}>
                      <p className={cn("font-semibold", status === "done" ? "text-m-ink/70 line-through" : "text-m-ink")}>{t.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-m-ink/65">
                        <span className="font-semibold text-m-blue">{t.who === meId ? "আপনি" : name(t.who)}</span>
                        {t.due && <span className={cn(late && "font-bold text-m-red")}>· <DateText iso={t.due} />{late && " · দেরি"}</span>}
                      </p>
                      {mayMove && (
                        <div className="mt-2 flex gap-1">
                          <button type="button" disabled={status === "todo"} onClick={() => move(t.id, -1)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="আগের ঘরে"><ArrowLeft aria-hidden /></button>
                          <button type="button" disabled={status === "done"} onClick={() => move(t.id, 1)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="পরের ঘরে"><ArrowRight aria-hidden /></button>
                          {lead && <button type="button" onClick={() => edit((x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }))} className={mediaButton({ variant: "ghost", size: "icon-sm", className: "ml-auto" })} aria-label="কাজ মুছুন"><Trash2 aria-hidden /></button>}
                        </div>
                      )}
                    </li>
                  );
                })}
                {list.length === 0 && <li className="px-1 py-3 text-xs text-m-ink/45">ফাঁকা</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── 4. Files & data ───────────── */

const FILE_ICON: Record<FileKind, typeof FileText> = { ppt: Presentation, pdf: FileText, data: FileSpreadsheet, sheet: Link2, other: FileText };
const ACCEPT: { kind: Exclude<FileKind, "sheet" | "other">; label: string; accept: string }[] = [
  { kind: "ppt", label: "স্লাইড (PPT)", accept: ".ppt,.pptx,.odp,.key" },
  { kind: "pdf", label: "পিডিএফ", accept: ".pdf,application/pdf" },
  { kind: "data", label: "ডেটা (CSV, Excel)", accept: ".csv,.tsv,.xls,.xlsx,.ods,.json" },
];

const readDataUrl = (f: File) =>
  new Promise<string>((ok, fail) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => fail(r.error);
    r.readAsDataURL(f);
  });

const kb = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`);

export function FilesStep({ p, meId, inTeam, lead, edit, name }: StepProps) {
  const input = useRef<HTMLInputElement>(null);
  const [accept, setAccept] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const add = (f: ResearchFile) => (edit((x) => ({ ...x, files: [f, ...x.files] })) ? toast.success("যোগ হলো", { description: f.name }) : toast.error("এই ব্রাউজারে আর জায়গা নেই — বড় ফাইল গুগল ড্রাইভে রেখে লিংক দিন।"));

  async function pick(file: File) {
    if (!meId) return;
    if (fileTooBig(file.size)) return toast.error("ফাইল ১.৫ MB-এর বেশি", { description: "বড় ফাইল গুগল ড্রাইভ বা শিটে রেখে লিংক দিন।" });
    setBusy(true);
    try {
      const data = await readDataUrl(file);
      const nf: NoteFile = { name: file.name, type: file.type || "application/octet-stream", size: file.size, data };
      add({ id: newId("f"), kind: fileKind(file.name), name: file.name, file: nf, by: meId, at: new Date().toISOString() });
    } catch {
      toast.error("ফাইলটি পড়া গেল না");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Guide title="ফাইল ও ডেটা এক জায়গায়" tips={["উপস্থাপনার স্লাইড, পড়া পেপারের পিডিএফ আর মাপা ডেটা এখানে রাখুন।", "এক্সেলের ডেটা দলে মিলে লিখতে গুগল শিটের শেয়ার লিংক দিন — সবাই একই শিটে কাজ করবে।", "প্রতিটি ফাইল ১.৫ MB পর্যন্ত; বড় হলে ড্রাইভের লিংক দিন।"]} />
      {inTeam && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile">
            <h3 className="mb-3 text-sm font-bold text-m-ink">ফাইল তুলুন</h3>
            <div className="flex flex-wrap gap-2">
              {ACCEPT.map((a) => {
                const Icon = FILE_ICON[a.kind];
                return (
                  <button key={a.kind} type="button" disabled={busy} onClick={() => { setAccept(a.accept); requestAnimationFrame(() => input.current?.click()); }} className={mediaButton({ variant: "quiet", size: "sm" })}>
                    <Icon aria-hidden /> {a.label}
                  </button>
                );
              })}
            </div>
            <input ref={input} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) pick(f); }} />
            {busy && <p className="mt-2 text-xs text-m-blue">পড়া হচ্ছে…</p>}
          </div>
          <form
            className="rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 shadow-m-tile"
            onSubmit={(e) => {
              e.preventDefault();
              if (!meId) return;
              if (!isSheetLink(link)) return toast.error("গুগল শিটের লিংক নয়", { description: "শিট খুলে ‘শেয়ার’ থেকে লিংক কপি করুন: docs.google.com/spreadsheets/d/…" });
              add({ id: newId("f"), kind: "sheet", name: "গুগল শিট — দলের ডেটা", url: link.trim(), by: meId, at: new Date().toISOString() });
              setLink("");
            }}
          >
            <h3 className="mb-3 text-sm font-bold text-m-ink">গুগল শিটের লিংক (এক্সেল ডেটা)</h3>
            <div className="flex gap-2">
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…" inputMode="url" aria-label="গুগল শিটের লিংক" />
              <button type="submit" className={mediaButton({ variant: "primary" })}><Link2 aria-hidden /> যোগ</button>
            </div>
          </form>
        </div>
      )}

      {p.files.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-m-ink/13 p-6 text-center text-sm text-m-ink/60">এখনো কোনো ফাইল বা লিংক নেই।</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {p.files.map((f) => {
            const Icon = FILE_ICON[f.kind];
            return (
              <li key={f.id} className="story-reveal flex items-center gap-3 rounded-2xl bg-m-card p-3 ring-1 ring-m-ink/10 shadow-m-tile">
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", f.kind === "sheet" || f.kind === "data" ? "bg-m-blue-soft text-m-ink" : f.kind === "pdf" ? "bg-m-red text-m-on" : "bg-m-yellow text-m-ink")}><Icon className="size-5" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-m-ink">{f.name}</span>
                  <span className="text-xs text-m-ink/60">{FILE_KINDS[f.kind]}{f.file ? ` · ${kb(f.file.size)}` : ""} · {name(f.by)}</span>
                </span>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="শিট খুলুন"><ExternalLink aria-hidden /></a>
                ) : f.file ? (
                  <a href={f.file.data} download={f.name} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="ডাউনলোড"><Download aria-hidden /></a>
                ) : null}
                {(lead || f.by === meId) && <button type="button" onClick={() => edit((x) => ({ ...x, files: x.files.filter((y) => y.id !== f.id) }))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="সরান"><Trash2 aria-hidden /></button>}
              </li>
            );
          })}
        </ul>
      )}
      {!inTeam && <p className="text-xs text-m-ink/55"><Upload className="mr-1 inline size-3.5" aria-hidden />দলে থাকলে ফাইল তুলতে পারবেন।</p>}
    </div>
  );
}

/* ───────────── 5. Write-up ───────────── */

export function WriteStep({ p, inTeam, edit }: StepProps) {
  const [draft, setDraft] = useState<WriteUp>(p.write);
  const topic = p.ideas.find((i) => i.id === p.topicId);
  const save = (key: keyof WriteUp) => draft[key] !== p.write[key] && edit((x) => ({ ...x, write: { ...x.write, [key]: draft[key] } }));

  return (
    <div className="space-y-5">
      <Guide title="গবেষণার কাঠামো" tips={["পাঁচটি অংশ — প্রতিটির নিচে কী লিখবেন বলা আছে।", "সংখ্যা আর সূত্র দিন; অনুমান হলে বলুন অনুমান।", "লেখা ঘর ছাড়লেই সংরক্ষণ হয়; দলের সবাই একই লেখা দেখে।"]} />
      {topic && (
        <p className="rounded-2xl bg-m-yellow p-4 text-sm font-semibold text-m-ink">
          বিষয়: <span className="font-bold">{topic.title}</span>
          {inTeam && !draft.question && (
            <button type="button" onClick={() => setDraft((d) => ({ ...d, question: `${topic.title} — ` }))} className="ml-2 underline">প্রশ্নে বসান</button>
          )}
        </p>
      )}
      <ol className="space-y-4">
        {SECTIONS.map((s, i) => {
          const done = draft[s.key].trim().length >= s.min;
          return (
            <li key={s.key} className="story-reveal rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/10 sm:p-5 shadow-m-tile">
              <label className="block">
                <span className="flex items-center gap-2 font-bold text-m-ink">
                  <span className={cn("flex size-7 items-center justify-center rounded-full text-xs", done ? "bg-m-blue-soft text-m-ink" : "bg-m-ink/6 text-m-ink")}>{done ? <Check className="size-4" aria-hidden /> : <Num value={i + 1} />}</span>
                  {s.bn}
                  <span className="ml-auto text-xs font-medium text-m-ink/50"><Num value={draft[s.key].trim().length} /> অক্ষর</span>
                </span>
                <span className="mt-1 mb-2 block text-sm text-m-ink/60">{s.guide}</span>
                <Textarea rows={s.key === "question" ? 2 : 4} readOnly={!inTeam} value={draft[s.key]} onChange={(e) => setDraft((d) => ({ ...d, [s.key]: e.target.value }))} onBlur={() => save(s.key)} />
              </label>
            </li>
          );
        })}
      </ol>
      {inTeam && SECTIONS.some((s) => draft[s.key] !== p.write[s.key]) && (
        <button type="button" onClick={() => edit((x) => ({ ...x, write: draft })) && toast.success("লেখা সংরক্ষণ হলো")} className={mediaButton({ variant: "primary" })}>সব সংরক্ষণ করুন</button>
      )}
      <p className="text-xs text-m-ink/50">সব অংশ পূর্ণ: {SECTIONS.every((s) => writeDone(p.write, s.key)) ? "হ্যাঁ" : "এখনো না"}</p>
    </div>
  );
}
