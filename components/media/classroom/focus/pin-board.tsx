"use client";

import { useState } from "react";
import { Check, ChevronDown, Circle, CircleCheck, ExternalLink, ListChecks, Pin as PinIcon, PinOff, Plus, Quote, StickyNote, Table2, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { canAddPin, canPin, canUnpin, daysLeft, isClassPin, PIN_COLOR, PIN_KINDS, sortPins, taskState, TITLE_MAX, VALUE_MAX, type Pin, type PinDraft, type PinKind } from "@/lib/media/class-pins";
import { NOTE_COLORS, type NoteColor, type Role } from "@/lib/media/notices";
import { isSheetLink } from "@/lib/media/research-project";
import { cn } from "@/lib/utils";
import { choiceClass } from "../../ui/field-styles";
import { useFormat } from "../../ui/numerals";
import { PAPER } from "../notice-board";

const ICON: Record<PinKind, LucideIcon> = { text: StickyNote, task: ListChecks, data: Table2, chat: Quote };

const label = "mb-1.5 block text-sm font-semibold text-m-ink";

interface Props {
  pins: Pin[];
  role: Role;
  parent: boolean;
  meId?: string;
  /** Labs call their leader "লিডার", classes call theirs "সিআর". */
  lab: boolean;
  /** Today in Dhaka, YYYY-MM-DD, for due days. */
  today: string;
  /** Make a pin from the form; returns what is wrong with it, or null once saved. */
  onCreate: (draft: PinDraft, color: NoteColor) => string | null;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  /** Scroll to a pinned message. */
  onJump: (msgId: string) => void;
}

/**
 * The strip under the Discussion Room's header: pinned text, tasks, data and
 * important chats, newest teacher's first. Teachers and leaders pin for the
 * class; students pin for themselves; parents only read.
 */
export function PinBoard({ pins, role, parent, meId, lab, today, onCreate, onToggle, onRemove, onJump }: Props) {
  const { num } = useFormat();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const can = canPin(role, parent ? "parent" : "student");
  const full = !canAddPin(pins);
  const list = sortPins(pins);
  if (list.length === 0 && !can) return null;

  return (
    <div className="border-b border-m-ink/10">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          disabled={list.length === 0}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors enabled:hover:bg-m-ink/3 disabled:cursor-default"
        >
          <PinIcon className="size-4 shrink-0 text-m-blue" aria-hidden />
          <span className="shrink-0 text-xs font-bold text-m-ink">পিন</span>
          {list.length > 0 && <span className="shrink-0 rounded-full bg-m-yellow px-1.5 text-[11px] leading-5 font-bold text-m-ink">{num(list.length)}</span>}
          {list.length === 0 ? (
            <span className="min-w-0 flex-1 truncate text-xs text-m-ink/55">লেখা, টাস্ক বা ডেটা পিন করুন</span>
          ) : (
            !open && <span className="min-w-0 flex-1 truncate text-xs text-m-ink/65">{list[0].title}</span>
          )}
          {list.length > 0 && <ChevronDown className={cn("ml-auto size-4 shrink-0 text-m-ink/60 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} aria-hidden />}
        </button>
        {can && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={full}
            title={full ? "পিন ভরে গেছে — আগে একটা সরান" : "নতুন পিন"}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-m-yellow px-2.5 text-xs font-bold text-m-ink transition-[scale,opacity] active:scale-95 disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden /> পিন
          </button>
        )}
      </div>

      {open && list.length > 0 && (
        <ul className="live-in scrollbar-gold max-h-[min(15rem,40dvh)] space-y-2 overflow-y-auto overscroll-contain px-3 pb-3">
          {list.map((p) => (
            <PinCard
              key={p.id}
              pin={p}
              owner={isClassPin(p) ? (p.byRole === "teacher" ? "শিক্ষক" : lab ? "লিডার" : "সিআর") : p.by === meId ? "আমার পিন" : p.byName}
              today={today}
              canTick={can}
              canRemove={canUnpin(p, role, meId)}
              onToggle={() => onToggle(p.id)}
              onRemove={() => onRemove(p.id)}
              onJump={() => p.msgId && onJump(p.msgId)}
            />
          ))}
        </ul>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-md">
          <DialogHeader>
            <PixelMark tone="dark" />
            <DialogTitle className="text-xl font-bold text-m-ink">নতুন পিন</DialogTitle>
            <DialogDescription className="text-sm text-m-ink/70">{role === "teacher" || role === "leader" ? "ক্লাসের সবার চোখে পড়বে।" : "শুধু আপনি দেখবেন। গুরুত্বপূর্ণ বার্তা পিন করতে চ্যাটের বার্তার নিচের পিন বোতাম চাপুন।"}</DialogDescription>
          </DialogHeader>
          <PinForm
            onSubmit={(draft, color) => {
              const problem = onCreate(draft, color);
              if (!problem) setAdding(false);
              return problem;
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PinCard({ pin: p, owner, today, canTick, canRemove, onToggle, onRemove, onJump }: { pin: Pin; owner: string; today: string; canTick: boolean; canRemove: boolean; onToggle: () => void; onRemove: () => void; onJump: () => void }) {
  const { num } = useFormat();
  const Icon = ICON[p.kind];
  const paper = PAPER[p.color];
  const state = p.kind === "task" ? taskState(p, today) : null;
  const left = p.kind === "task" && p.due ? daysLeft(p.due, today) : null;
  const due = left === null ? null : left < 0 ? "মেয়াদ পেরিয়েছে" : left === 0 ? "আজ" : left === 1 ? "কাল" : `${num(left)} দিন বাকি`;

  return (
    <li className={cn("rounded-xl p-2.5 text-[13px] leading-snug", paper.paper)}>
      <div className="flex items-start gap-2">
        {p.kind === "task" ? (
          <button type="button" role="checkbox" aria-checked={Boolean(p.done)} disabled={!canTick} onClick={onToggle} className="mt-px shrink-0 rounded-full transition-transform active:scale-90 disabled:cursor-default">
            {p.done ? <CircleCheck className="size-5" aria-hidden /> : <Circle className="size-5" aria-hidden />}
            <span className="sr-only">{p.done ? "টাস্ক শেষ — ফিরিয়ে নিন" : "টাস্ক শেষ করুন"}</span>
          </button>
        ) : (
          <Icon className="mt-0.5 size-4.5 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          {p.kind === "chat" ? (
            <p className="font-medium break-words">“{p.title}”</p>
          ) : (
            <p className={cn("font-bold break-words whitespace-pre-wrap", p.kind === "text" && "font-semibold", p.done && "line-through opacity-60")}>{p.title}</p>
          )}
          {p.kind === "chat" && p.body && <p className="text-xs font-semibold opacity-75">— {p.body}</p>}
          {p.kind === "data" && p.body && <p className="font-mono text-xs break-words">{p.body}</p>}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className={cn("rounded-full px-2 py-px", paper.tag)}>{PIN_KINDS[p.kind]}</span>
            {due && state && (
              <span className={cn("rounded-full px-2 py-px", state === "overdue" ? "bg-m-red text-m-on" : state === "done" ? "bg-m-card/15" : paper.tag)}>{state === "done" ? "শেষ" : due}</span>
            )}
            <span className="opacity-75">{owner}</span>
            {p.kind === "data" && p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
                {isSheetLink(p.url) ? "Google Sheet খুলুন" : "লিংক খুলুন"} <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
            {p.kind === "chat" && p.msgId && (
              <button type="button" onClick={onJump} className="underline underline-offset-2">
                বার্তায় যান
              </button>
            )}
          </div>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} title="পিন সরান" className="-mt-0.5 -mr-0.5 grid size-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-m-card/15">
            <PinOff className="size-4" aria-hidden />
            <span className="sr-only">পিন সরান</span>
          </button>
        )}
      </div>
    </li>
  );
}

const KINDS: { id: Exclude<PinKind, "chat">; Icon: LucideIcon }[] = [
  { id: "text", Icon: StickyNote },
  { id: "task", Icon: ListChecks },
  { id: "data", Icon: Table2 },
];

/** The pin form. It lives inside the dialog, so it starts blank every time the dialog opens. */
function PinForm({ onSubmit }: { onSubmit: (draft: PinDraft, color: NoteColor) => string | null }) {
  const [kind, setKind] = useState<Exclude<PinKind, "chat">>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [due, setDue] = useState("");
  const [color, setColor] = useState<NoteColor | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const paper = color ?? PIN_COLOR[kind];

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setProblem(onSubmit({ kind, title, body, url, due }, paper));
      }}
    >
      <div role="radiogroup" aria-label="কী পিন করবেন" className="flex flex-wrap gap-2">
        {KINDS.map(({ id, Icon }) => (
          <label key={id} className={choiceClass(kind === id)}>
            <input
              type="radio"
              name="pin-kind"
              className="sr-only"
              checked={kind === id}
              onChange={() => {
                setKind(id);
                setProblem(null);
              }}
            />
            <Icon className="size-4" aria-hidden /> {PIN_KINDS[id]}
          </label>
        ))}
      </div>

      {kind === "text" && (
        <label className="block">
          <span className={label}>কী পিন করবেন?</span>
          <Textarea rows={3} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX.text} placeholder="যেমন: কাল ল্যাব খাতা জমা — প্রিন্ট করে আনবে" autoFocus />
        </label>
      )}

      {kind === "task" && (
        <>
          <label className="block">
            <span className={label}>টাস্ক</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX.task} placeholder="যেমন: অনুশীলনী ৪.২ — ১ থেকে ৮ নম্বর" autoFocus />
          </label>
          <label className="block">
            <span className={label}>শেষ তারিখ (ঐচ্ছিক)</span>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        </>
      )}

      {kind === "data" && (
        <>
          <label className="block">
            <span className={label}>ডেটার নাম</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={TITLE_MAX.data} placeholder="যেমন: RC টাইম কনস্ট্যান্ট" autoFocus />
          </label>
          <label className="block">
            <span className={label}>মান</span>
            <Input value={body} onChange={(e) => setBody(e.target.value)} maxLength={VALUE_MAX} placeholder="যেমন: τ = 4.7 ms" />
          </label>
          <label className="block">
            <span className={label}>লিংক (ঐচ্ছিক)</span>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" placeholder="Google Sheet বা অন্য যেকোনো লিংক" />
          </label>
        </>
      )}

      <fieldset>
        <legend className={label}>রং</legend>
        <div className="flex flex-wrap items-center gap-2">
          {NOTE_COLORS.map((c) => {
            const on = paper === c;
            return (
              <label key={c} title={PAPER[c].bn} className={cn("flex size-9 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-popover transition-[box-shadow,scale] duration-150 has-focus-visible:ring-m-blue active:scale-90", PAPER[c].paper, on ? "ring-white" : "ring-transparent hover:ring-m-ink/34")}>
                <input type="radio" name="pin-color" className="sr-only" checked={on} onChange={() => setColor(c)} />
                {on && <Check className="size-4" aria-hidden />}
                <span className="sr-only">{PAPER[c].bn}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {problem && (
        <p role="alert" className="text-sm font-semibold text-m-red">
          {problem}
        </p>
      )}

      <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-m-yellow px-5 text-base font-semibold text-m-ink transition-[scale] duration-200 active:scale-[0.97]">
        <PinIcon className="size-5" aria-hidden /> পিন করুন
      </button>
    </form>
  );
}
