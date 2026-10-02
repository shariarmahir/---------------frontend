"use client";

import { useState } from "react";
import { BellRing, CalendarX2, Check, ClipboardClock, Megaphone, Pin, PinOff, Plus, Siren, UserRoundX, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { LEAVE_WORDS, NOTE_COLORS, NOTICE_KINDS, canPost, canRemove, isStaff, onBoard, oneWord, paperOf, type NoteColor, type Notice, type NoticeKind, type Role } from "@/lib/media/notices";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { DateText, Num } from "../ui/numerals";

const ICON: Record<NoticeKind, LucideIcon> = { emergency: Siren, cancel: CalendarX2, leave: UserRoundX, late: ClipboardClock, custom: Megaphone };

/** Each paper with ink that reads on it, and a contrasting chip for the reason and role. */
const PAPER: Record<NoteColor | "red", { bn: string; paper: string; tag: string }> = {
  red: { bn: "লাল", paper: "bg-national-crimson text-white", tag: "bg-white text-national-crimson" },
  gold: { bn: "সোনালি", paper: "bg-signal-orange text-text-primary", tag: "bg-text-primary text-signal-orange" },
  orange: { bn: "কমলা", paper: "bg-bdorange-600 text-text-primary", tag: "bg-text-primary text-signal-orange" },
  peach: { bn: "পীচ", paper: "bg-bdorange-100 text-text-primary", tag: "bg-bdorange-600 text-text-primary" },
  green: { bn: "সবুজ", paper: "bg-bd-green text-white", tag: "bg-signal-orange text-text-primary" },
  mint: { bn: "পুদিনা", paper: "bg-bdgreen-500 text-text-primary", tag: "bg-text-primary text-white" },
  leaf: { bn: "কচিপাতা", paper: "bg-bdgreen-200 text-text-primary", tag: "bg-bd-green text-white" },
  white: { bn: "সাদা", paper: "bg-white text-text-primary", tag: "bg-text-primary text-white" },
};

/** A slight tilt per note, like paper pinned by hand. */
const TILT = ["-rotate-1", "rotate-[0.75deg]", "-rotate-[0.5deg]", "rotate-1"];

const ROLE_BN: Partial<Record<Role, string>> = { teacher: "শিক্ষক", leader: "লিডার" };

export interface NoticeBoardProps {
  notices: Notice[];
  role: Role;
  meId?: string;
  name: (id: string) => string;
  /** Today, YYYY-MM-DD. */
  today: string;
  /** Classes that can be cancelled. */
  subjects: string[];
  /** Work that can be handed in late. */
  items: string[];
  onChange: (fn: (list: Notice[]) => Notice[]) => boolean;
}

/** One small pinned note; tapping its text opens it in full. */
function NoteCard({ n, tilt, by, actions }: { n: Notice; tilt: string; by: string; actions?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const Icon = ICON[n.kind];
  const { paper, tag } = PAPER[paperOf(n)];
  return (
    <div className={cn("relative flex h-full flex-col gap-1 rounded-md p-2.5 pt-3.5 shadow-[0_10px_20px_-12px_rgb(0_0_0/0.9)] transition-[rotate,translate] duration-300 hover:-translate-y-0.5 hover:rotate-0 motion-reduce:transition-none", paper, tilt)}>
      <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-text-primary ring-2 ring-white/80" aria-hidden />
      <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase opacity-80">
        <Icon className="size-3" aria-hidden /> {NOTICE_KINDS[n.kind].bn}
        {n.pinned && <Pin className="ml-auto size-3" aria-label="পিন করা" />}
      </span>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="text-left">
        <span className={cn("block text-[13px] leading-snug font-bold", !open && "line-clamp-2")}>{n.title}</span>
        {n.body && <span className={cn("mt-0.5 block text-xs leading-snug opacity-85", !open && "line-clamp-1")}>{n.body}</span>}
      </button>
      {(n.reason || n.date) && (
        <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold opacity-90">
          {n.reason && <span className={cn("rounded px-1.5 py-px font-bold", tag)}>{n.reason}</span>}
          {n.date && (
            <span>
              <DateText iso={n.date} />
              {n.days && n.days > 1 ? <> · <Num value={n.days} /> দিন</> : null}
            </span>
          )}
        </span>
      )}
      <span className="mt-auto flex items-center gap-1 pt-0.5 text-[10.5px] opacity-80">
        <span className="min-w-0 truncate">{by}</span>
        {ROLE_BN[n.byRole] && <span className={cn("shrink-0 rounded px-1 font-bold", tag)}>{ROLE_BN[n.byRole]}</span>}
        {actions && <span className="ml-auto flex shrink-0">{actions}</span>}
      </span>
    </div>
  );
}

export function NoticeBoard({ notices, role, meId, name, today, subjects, items, onChange }: NoticeBoardProps) {
  const [writing, setWriting] = useState(false);
  const [all, setAll] = useState(false);
  const live = onBoard(notices, today);
  const shown = all ? live : live.slice(0, 8);
  const staff = isStaff(role);

  return (
    <section aria-labelledby="notice-title" className="story-reveal rounded-3xl bg-text-primary p-4 ring-1 ring-white/12 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="notice-title" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-signal-orange text-text-primary"><BellRing className="size-4.5" aria-hidden /></span>
          নোটিশ বোর্ড
          {live.length > 0 && <span className="rounded-full bg-white/10 px-2 text-xs font-semibold text-white/75"><Num value={live.length} /></span>}
        </h2>
        {role !== "guest" && (
          <button type="button" onClick={() => setWriting(true)} className={mediaButton({ variant: "primary", size: "sm" })}>
            <Plus aria-hidden /> {staff ? "নোটিশ দিন" : "ছুটি বা দেরির খবর দিন"}
          </button>
        )}
      </div>

      {live.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/60">বোর্ড ফাঁকা — আজ কোনো নোটিশ নেই।</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 pt-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((n, i) => (
            <li key={n.id} className="live-in">
              <NoteCard
                n={n}
                tilt={TILT[i % TILT.length]}
                by={n.byName ?? name(n.by)}
                actions={
                  <>
                    {staff && (
                      <button type="button" onClick={() => onChange((l) => l.map((x) => (x.id === n.id ? { ...x, pinned: !x.pinned } : x)))} className="flex size-6 items-center justify-center rounded hover:bg-black/15" aria-label={n.pinned ? "পিন সরান" : "পিন করুন"}>
                        {n.pinned ? <PinOff className="size-3" aria-hidden /> : <Pin className="size-3" aria-hidden />}
                      </button>
                    )}
                    {canRemove(n, role, meId) && (
                      <button type="button" onClick={() => onChange((l) => l.filter((x) => x.id !== n.id)) && toast.success("নোটিশ সরানো হলো")} className="flex size-6 items-center justify-center rounded hover:bg-black/15" aria-label="নোটিশ সরান">
                        <X className="size-3" aria-hidden />
                      </button>
                    )}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
      {live.length > 8 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-4 text-sm font-bold text-signal-orange hover:underline">
          {all ? "কম দেখান" : <>আরও <Num value={live.length - 8} />টি নোটিশ</>}
        </button>
      )}

      {role !== "guest" && meId && (
        <NoticeComposer open={writing} onOpenChange={setWriting} role={role} meId={meId} meName={name(meId)} today={today} subjects={subjects} items={items} onAdd={(n) => onChange((l) => [n, ...l])} />
      )}
    </section>
  );
}

function NoticeComposer({ open, onOpenChange, role, meId, meName, today, subjects, items, onAdd }: {
  open: boolean; onOpenChange: (o: boolean) => void; role: Role; meId: string; meName: string; today: string; subjects: string[]; items: string[]; onAdd: (n: Notice) => boolean;
}) {
  const kinds = (Object.keys(NOTICE_KINDS) as NoticeKind[]).filter((k) => canPost(k, role));
  const [kind, setKind] = useState<NoticeKind>(kinds[0]);
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(1);
  const [subject, setSubject] = useState("");
  const [item, setItem] = useState("");
  const [reason, setReason] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [color, setColor] = useState<NoteColor | undefined>();
  const [tried, setTried] = useState(false);

  function reset(o: boolean) {
    if (o) {
      setKind(kinds[0]);
      setDate(today);
      setDays(1);
      setSubject(subjects[0] ?? "");
      setItem(items[0] ?? "");
      setReason("");
      setTitle("");
      setBody("");
      setPinned(false);
      setColor(undefined);
      setTried(false);
    }
    onOpenChange(o);
  }

  const word = oneWord(reason);
  const problem = {
    date: !date ? "তারিখ দিন" : date < today && kind !== "custom" ? "আজ বা সামনের কোনো দিন দিন" : "",
    subject: kind === "cancel" && subject.trim().length < 2 ? "কোন ক্লাস, লিখুন" : "",
    item: kind === "late" && item.trim().length < 2 ? "কোন কাজ, লিখুন" : "",
    reason: kind === "leave" && !word ? "এক শব্দে কারণ দিন (যেমন জ্বর)" : kind === "late" && reason.trim() && !word ? "কারণ এক শব্দে" : "",
    title: kind === "custom" && title.trim().length < 4 ? "শিরোনাম দিন" : "",
    body: kind === "emergency" && body.trim().length < 4 ? "কী হয়েছে, এক লাইনে লিখুন" : "",
  };

  const auto: Record<NoticeKind, string> = {
    emergency: "জরুরি: ক্লাস বন্ধ",
    cancel: `${subject.trim()} ক্লাস হবে না`,
    leave: `${meName} — ছুটি`,
    late: `${item.trim()} — দেরিতে জমা`,
    custom: title.trim(),
  };
  const draft: Notice = {
    id: "preview",
    kind,
    title: auto[kind],
    body: body.trim() || undefined,
    reason: kind === "leave" || kind === "late" ? word ?? undefined : undefined,
    date: kind === "custom" ? undefined : date,
    days: kind === "leave" ? days : undefined,
    by: meId,
    byName: meName,
    byRole: role,
    at: today,
    pinned: isStaff(role) && pinned ? true : undefined,
    color: kind === "emergency" ? undefined : color,
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.values(problem).some(Boolean)) return;
    const n: Notice = { ...draft, id: newId("nb"), at: new Date().toISOString() };
    if (onAdd(n)) {
      toast.success("নোটিশ বোর্ডে উঠল", { description: n.title });
      reset(false);
    } else toast.error("এই ব্রাউজারে আর জায়গা নেই");
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  const err = (m: string) => tried && m && <span className="mt-1 block text-xs font-semibold text-crimson-bright">{m}</span>;
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="text-xl font-bold text-white">নোটিশ দিন</DialogTitle>
          <DialogDescription>{isStaff(role) ? "বোর্ডে যা উঠবে, ক্লাসের সবাই সাথে সাথে দেখবে।" : "ছুটি বা দেরিতে জমার খবর আগে দিন — শিক্ষক আর লিডার দেখবেন।"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <fieldset>
            <legend className={label}>কী ধরনের নোটিশ</legend>
            <div className="flex flex-wrap gap-2">
              {kinds.map((k) => {
                const Icon = ICON[k];
                return (
                  <label key={k} className={cn(choiceClass(kind === k), k === "emergency" && kind === k && "border-crimson-bright bg-national-crimson/15 text-crimson-bright")}>
                    <input type="radio" name="notice-kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                    <Icon className="size-4" aria-hidden /> {NOTICE_KINDS[k].bn}
                  </label>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-white/60">{NOTICE_KINDS[kind].hint}</p>
          </fieldset>

          {kind === "custom" && (
            <label className="block">
              <span className={label}>শিরোনাম *</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: পরীক্ষার ফি জমার শেষ দিন" aria-invalid={tried && Boolean(problem.title)} />
              {err(problem.title)}
            </label>
          )}
          {kind === "cancel" && (
            <label className="block">
              <span className={label}>কোন ক্লাস *</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} list="notice-subjects" placeholder="যেমন: রসায়ন" aria-invalid={tried && Boolean(problem.subject)} />
              <datalist id="notice-subjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
              {err(problem.subject)}
            </label>
          )}
          {kind === "late" && (
            <label className="block">
              <span className={label}>কোন কাজ *</span>
              {items.length > 0 ? (
                <select value={item} onChange={(e) => setItem(e.target.value)} className={selectClass}>
                  {items.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              ) : (
                <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="যেমন: হোমওয়ার্ক ৯.২" />
              )}
              {err(problem.item)}
            </label>
          )}

          {kind !== "custom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>{kind === "late" ? "কবে জমা দেবেন *" : kind === "leave" ? "কবে থেকে *" : "কোন দিন *"}</span>
                <Input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} aria-invalid={tried && Boolean(problem.date)} />
                {err(problem.date)}
              </label>
              {kind === "leave" && (
                <label className="block">
                  <span className={label}>কত দিন</span>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectClass}>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} দিন</option>)}
                  </select>
                </label>
              )}
            </div>
          )}

          {(kind === "leave" || kind === "late") && (
            <div>
              <label className="block">
                <span className={label}>কারণ — এক শব্দে{kind === "leave" ? " *" : ""}</span>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={16} placeholder="যেমন: জ্বর" aria-invalid={tried && Boolean(problem.reason)} />
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LEAVE_WORDS.map((w) => (
                  <button key={w} type="button" onClick={() => setReason(w)} className={cn("min-h-8 rounded-full px-3 text-xs font-semibold transition-colors", reason === w ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/75 ring-1 ring-white/12 hover:text-white")}>{w}</button>
                ))}
              </div>
              {err(problem.reason)}
            </div>
          )}

          <label className="block">
            <span className={label}>{kind === "emergency" ? "কী হয়েছে *" : "বিস্তারিত (ঐচ্ছিক)"}</span>
            <Textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder={kind === "emergency" ? "যেমন: বন্যার পানিতে রাস্তা বন্ধ, আজ অনলাইনে ক্লাস" : "এক-দুই লাইন"} aria-invalid={tried && Boolean(problem.body)} />
            {err(problem.body)}
          </label>

          {kind === "emergency" ? (
            <p className="text-xs text-white/60">জরুরি নোটিশ সবসময় লাল — যাতে সবার চোখে আগে পড়ে।</p>
          ) : (
            <fieldset>
              <legend className={label}>নোটের রং</legend>
              <div className="flex flex-wrap items-center gap-2">
                {NOTE_COLORS.map((c) => {
                  const on = paperOf({ kind, color }) === c;
                  return (
                    <label key={c} title={PAPER[c].bn} className={cn("flex size-9 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-text-primary transition-[box-shadow,scale] duration-150 has-focus-visible:ring-signal-orange active:scale-90", PAPER[c].paper, on ? "ring-white" : "ring-transparent hover:ring-white/40")}>
                      <input type="radio" name="note-color" className="sr-only" checked={on} onChange={() => setColor(c)} />
                      {on && <Check className="size-4" aria-hidden />}
                      <span className="sr-only">{PAPER[c].bn}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          <div className="flex items-start gap-4 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <span className="pt-2 text-xs font-semibold text-white/60">বোর্ডে এমন দেখাবে</span>
            <div className="w-44 shrink-0">
              <NoteCard n={{ ...draft, title: draft.title || NOTICE_KINDS[kind].bn }} tilt="-rotate-1" by={meName} />
            </div>
          </div>

          {isStaff(role) && (
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-4 accent-signal-orange" />
              পিন করে রাখুন — নিজে না সরানো পর্যন্ত থাকবে
            </label>
          )}
          <button type="submit" className={mediaButton({ variant: kind === "emergency" ? "danger" : "primary", size: "lg", className: "w-full" })}>বোর্ডে লাগান</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
