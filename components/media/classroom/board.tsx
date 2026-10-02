"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, BookOpen, ChevronDown, Download, FileText, Lightbulb, Lock, Paperclip, ScanLine, Send, Share2, Swords, Upload, User, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_NOW } from "@/data/media/clock";
import type { ClassNote, NoteFile, Problem } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { Panel } from "../ui/layout";
import { FilePreview, NoteReader, downloadNote, kb, readerUrl, toNoteFile } from "./note-files";
import type { ClassTab } from "./room";
import type { SharePreset } from "./share-work";
import { ClassShareDialog } from "./team-tabs";
import { bump, editClassroom, nameOf } from "./use-classroom";

const today = DEMO_NOW.toISOString().slice(0, 10);

const NOTE_KINDS: Record<ClassNote["kind"], { bn: string; chip: string }> = {
  note: { bn: "নোট", chip: "bg-bd-green text-white" },
  homework: { bn: "হোমওয়ার্ক", chip: "bg-signal-orange text-text-primary" },
  material: { bn: "ম্যাটেরিয়াল", chip: "bg-bdorange-600 text-text-primary" },
  rule: { bn: "ক্লাসের নিয়ম", chip: "bg-white text-text-primary" },
};

const PROBLEM_KINDS: Record<Problem["kind"], { bn: string; Icon: typeof Users }> = {
  class: { bn: "পুরো ক্লাস", Icon: Users },
  solo: { bn: "একক চ্যালেঞ্জ", Icon: User },
  innovation: { bn: "উদ্ভাবন", Icon: Lightbulb },
};

const JoinFirst = () => <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/70 ring-1 ring-white/10">অংশ নিতে আগে ক্লাসে যোগ দিন।</p>;

export const BoardTab: ClassTab = ({ room, me, member, leader }) => {
  const [filter, setFilter] = useState<ClassNote["kind"] | "all">("all");
  const [kind, setKind] = useState<ClassNote["kind"]>("note");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<NoteFile | undefined>();
  const [busy, setBusy] = useState(false);
  const [only, setOnly] = useState(false);
  const [reading, setReading] = useState<{ note: ClassNote; url?: string } | null>(null);
  const shown = room.notes.filter((n) => (filter === "all" || n.kind === filter) && (!n.private || n.by === me?.id));

  async function attach(e: React.ChangeEvent<HTMLInputElement>, scan: boolean) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    setBusy(true);
    try {
      const f = await toNoteFile(picked, scan);
      setFile(f);
      if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/^scan-/, ""));
    } catch (err) {
      toast.error("ফাইল যোগ হলো না", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  }

  function share(e: React.FormEvent) {
    e.preventDefault();
    if (!me || title.trim().length < 3) return;
    const note: ClassNote = { id: newId("n"), kind, title: title.trim(), text: text.trim(), file, by: me.id, at: today, private: only || undefined };
    const saved = editClassroom(room.id, (r) => {
      const next = { ...r, notes: [note, ...r.notes] };
      return only ? next : bump(next, me.id, "notes");
    });
    setTitle("");
    setText("");
    setFile(undefined);
    if (!saved) toast.error("ব্রাউজারে জায়গা শেষ", { description: "এই ভিজিটে নোটটি আছে, কিন্তু পরে থাকবে না। পুরোনো বড় ফাইল মুছুন বা ছোট ফাইল দিন।" });
    else toast.success(only ? "নিজের জন্য রাখা হলো" : "ক্লাসে শেয়ার হলো", { description: only ? "শুধু আপনি দেখবেন।" : "+৫ পয়েন্ট" });
  }

  const open = async (note: ClassNote) => setReading({ note, url: await readerUrl(note) });
  const close = () => {
    if (reading?.url) URL.revokeObjectURL(reading.url);
    setReading(null);
  };
  const tool =
    "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold ring-1 transition-[background-color,scale] duration-200 active:scale-95 has-focus-visible:ring-2 has-focus-visible:ring-signal-orange";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="space-y-3">
        <ul className="flex flex-wrap gap-2">
          {(["all", ...Object.keys(NOTE_KINDS)] as (ClassNote["kind"] | "all")[]).map((k) => (
            <li key={k}>
              <button type="button" onClick={() => setFilter(k)} className={choiceClass(filter === k)}>
                {k === "all" ? "সব" : NOTE_KINDS[k].bn}
              </button>
            </li>
          ))}
        </ul>
        {shown.map((n) => (
          <article key={n.id} className="story-reveal rounded-2xl bg-text-primary p-4 ring-1 ring-white/12 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-26px_var(--color-signal-orange)]">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("rounded-full px-2.5 py-0.5 font-bold", NOTE_KINDS[n.kind].chip)}>{NOTE_KINDS[n.kind].bn}</span>
              {n.file && <span className="inline-flex items-center gap-1 text-white/65"><Paperclip className="size-3.5" aria-hidden /> {kb(n.file.size)}</span>}
              {n.private && <span className="inline-flex items-center gap-1 text-white/65"><Lock className="size-3.5" aria-hidden /> শুধু আমার</span>}
              <span className="ml-auto text-white/55">{nameOf(room, n.by)}</span>
            </div>
            <h3 className="truncate text-lg font-bold text-white" title={n.title}>{n.title}</h3>
            {n.file && <FilePreview file={n.file} onOpen={() => open(n)} />}
            {n.text && (
              <details className="group mt-2">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-signal-orange [&::-webkit-details-marker]:hidden">
                  বিস্তারিত <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="live-in mt-2 leading-relaxed whitespace-pre-line text-white/90">{n.text}</p>
              </details>
            )}
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
              <button type="button" onClick={() => open(n)} className={mediaButton({ variant: "quiet", size: "sm" })}><BookOpen aria-hidden /> পড়ুন</button>
              <button type="button" onClick={() => downloadNote(n)} className={mediaButton({ variant: "ghost", size: "sm" })}><Download aria-hidden /> ডাউনলোড</button>
            </div>
          </article>
        ))}
        {shown.length === 0 && <p className="rounded-2xl bg-text-primary p-6 text-center text-sm text-white/70 ring-1 ring-white/12">এখানে এখনো কিছু নেই।</p>}
      </div>

      <Panel title="বোর্ডে লিখুন" className="h-fit lg:sticky lg:top-32">
        {!member ? (
          <JoinFirst />
        ) : (
          <form onSubmit={share} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(NOTE_KINDS) as ClassNote["kind"][]).filter((k) => k !== "rule" || leader).map((k) => (
                <label key={k} className={choiceClass(kind === k)}>
                  <input type="radio" name="kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                  {NOTE_KINDS[k].bn}
                </label>
              ))}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="শিরোনাম — এক লাইনে" aria-label="শিরোনাম" />
            <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="বিস্তারিত (ঐচ্ছিক) — সূত্র, ধাপ, লিংক" aria-label="বিস্তারিত" />

            <div className="grid grid-cols-2 gap-2">
              <label className={cn(tool, "bg-signal-orange text-text-primary ring-transparent hover:brightness-105")}>
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => attach(e, true)} disabled={busy} />
                <ScanLine className="size-4.5" aria-hidden /> স্ক্যান করুন
              </label>
              <label className={cn(tool, "text-white ring-white/20 hover:bg-white/10")}>
                <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => attach(e, false)} disabled={busy} />
                <Upload className="size-4.5" aria-hidden /> ফাইল আপলোড
              </label>
            </div>
            {busy && <p className="live-in text-sm font-semibold text-signal-orange">পাতা ঠিক করা হচ্ছে…</p>}
            {file && (
              <div className="live-in flex items-center gap-3 rounded-xl bg-black/40 p-2 ring-1 ring-white/10">
                {file.type === "application/pdf" ? (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-national-crimson text-white"><FileText className="size-5" aria-hidden /></span>
                ) : (
                  <Image src={file.data} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-lg bg-white object-cover" />
                )}
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-semibold text-white">{file.name}</span>
                  <span className="text-xs text-white/60">{kb(file.size)}</span>
                </span>
                <button type="button" onClick={() => setFile(undefined)} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label="ফাইল সরান"><X aria-hidden /></button>
              </div>
            )}
            <p className="text-xs text-white/55">ছবি বা পিডিএফ, সর্বোচ্চ ১.৫ MB। স্ক্যান পাতাকে সাদা-কালো পরিষ্কার কপি বানায়।</p>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} className="size-4 accent-signal-orange" />
              শুধু নিজের জন্য রাখুন
            </label>
            <button type="submit" disabled={busy || title.trim().length < 3} className={mediaButton({ variant: "primary", className: "w-full" })}><Send aria-hidden /> {only ? "রাখুন" : "শেয়ার করুন"}</button>
          </form>
        )}
      </Panel>

      <NoteReader note={reading?.note ?? null} url={reading?.url} author={reading ? nameOf(room, reading.note.by) : ""} onClose={close} />
    </div>
  );
};

export const ChallengeTab: ClassTab = ({ room, me, member, leader }) => {
  const [kind, setKind] = useState<Problem["kind"]>("class");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sharing, setSharing] = useState<SharePreset | null>(null);

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!me || title.trim().length < 4) return;
    const p: Problem = { id: newId("p"), kind, title: title.trim(), body: body.trim(), by: me.id, solutions: [] };
    editClassroom(room.id, (r) => ({ ...r, problems: [p, ...r.problems] }));
    setTitle("");
    setBody("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4">
        {room.problems.map((p) => (
          <ProblemCard
            key={p.id}
            problem={p}
            roomId={room.id}
            me={me}
            member={member}
            leader={leader}
            name={(id) => nameOf(room, id)}
            onShare={() =>
              setSharing({
                kind: p.kind === "innovation" ? "innovation" : "solution",
                title: p.title,
                question: p.body,
                finding: p.solutions.map((s) => s.text).join("\n"),
                team: [...new Set([...p.solutions.map((s) => s.by), ...(me ? [me.id] : [])])],
              })
            }
          />
        ))}
        {room.problems.length === 0 && <p className="rounded-2xl bg-text-primary p-6 text-center text-sm text-white/70 ring-1 ring-white/12">প্রথম চ্যালেঞ্জটা আপনিই দিন।</p>}
      </div>
      <Panel title={<span className="flex items-center gap-2"><Swords className="size-4.5" aria-hidden /> নতুন চ্যালেঞ্জ</span>} className="h-fit lg:sticky lg:top-32">
        {!member ? (
          <JoinFirst />
        ) : (
          <form onSubmit={post} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PROBLEM_KINDS) as Problem["kind"][]).map((k) => (
                <label key={k} className={choiceClass(kind === k)}>
                  <input type="radio" name="pkind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                  {PROBLEM_KINDS[k].bn}
                </label>
              ))}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="সমস্যা বা চ্যালেঞ্জের শিরোনাম" />
            <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="বইয়ের অধ্যায়, শর্ত বা কী জমা দিতে হবে" />
            <button type="submit" className={mediaButton({ variant: "primary", className: "w-full" })}>চ্যালেঞ্জ দিন</button>
          </form>
        )}
      </Panel>
      <ClassShareDialog room={room} me={me} preset={sharing} onClose={() => setSharing(null)} />
    </div>
  );
};

function ProblemCard({ problem: p, roomId, me, member, leader, name, onShare }: { problem: Problem; roomId: string; me: { id: string } | null; member: boolean; leader: boolean; name: (id: string) => string; onShare: () => void }) {
  const [answer, setAnswer] = useState("");
  const { bn, Icon } = PROBLEM_KINDS[p.kind];
  const edit = (fn: (q: Problem) => Problem) => editClassroom(roomId, (r) => ({ ...r, problems: r.problems.map((q) => (q.id === p.id ? fn(q) : q)) }));

  return (
    <article className="story-reveal overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
      <div className="space-y-2 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-signal-orange px-2.5 py-0.5 text-text-primary"><Icon className="size-3.5" aria-hidden /> {bn}</span>
          {p.solved && <span className="live-in inline-flex items-center gap-1 rounded-full bg-bd-green px-2.5 py-0.5 text-white"><BadgeCheck className="size-3.5" aria-hidden /> সমাধান হয়েছে</span>}
          <span className="ml-auto font-medium text-white/55">{name(p.by)}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{p.title}</h3>
        {p.body && <p className="text-sm leading-relaxed text-white/80">{p.body}</p>}
      </div>
      {p.solutions.length > 0 && (
        <ul className="space-y-2 border-t border-white/10 bg-black/30 px-5 py-4">
          {p.solutions.map((s, i) => (
            <li key={i} className="text-sm">
              <span className="font-bold text-signal-orange">{name(s.by)}</span>
              <p className="mt-0.5 leading-relaxed whitespace-pre-line text-white/90">{s.text}</p>
            </li>
          ))}
        </ul>
      )}
      {member && me && !p.solved && (
        <form
          className="flex gap-2 border-t border-white/10 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (answer.trim().length < 3) return;
            editClassroom(roomId, (r) =>
              bump({ ...r, problems: r.problems.map((q) => (q.id === p.id ? { ...q, solutions: [...q.solutions, { by: me.id, text: answer.trim(), at: today }] } : q)) }, me.id, "solved"),
            );
            setAnswer("");
            toast.success("সমাধান জমা হলো", { description: "+১০ পয়েন্ট" });
          }}
        >
          <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="আপনার সমাধান বা যুক্তি" aria-label="সমাধান" />
          <button type="submit" className={mediaButton({ variant: "primary", size: "icon" })}><Send aria-hidden /><span className="sr-only">জমা দিন</span></button>
        </form>
      )}
      {member && p.solutions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-4">
          {leader && !p.solved && (
            <button type="button" onClick={() => edit((q) => ({ ...q, solved: true }))} className={mediaButton({ variant: "green", size: "sm" })}>
              <BadgeCheck aria-hidden /> সমাধান হয়েছে বলে চিহ্নিত করুন
            </button>
          )}
          <button type="button" onClick={onShare} className={mediaButton({ variant: p.solved ? "primary" : "outline", size: "sm" })}>
            <Share2 aria-hidden /> {p.kind === "innovation" ? "উদ্ভাবন শেয়ার" : "সমাধান শেয়ার"}
          </button>
        </div>
      )}
    </article>
  );
}
