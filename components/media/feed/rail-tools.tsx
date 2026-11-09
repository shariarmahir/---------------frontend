"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Send, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { newId, updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../ui/numerals";
import { Panel } from "../ui/layout";

/** Something on a day: a class, an event. */
export interface DayItem {
  iso: string;
  title: string;
  href: string;
  kind: "class" | "event";
}

const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const field = "w-full rounded-xl border border-m-ink/12 bg-m-canvas px-3 text-sm text-m-ink placeholder:text-m-ink/45 focus-visible:border-m-blue focus-visible:outline-none";

/** The month at a glance: days with a class or an event carry a dot; picking a day lists them, each a link. */
export function RailCalendar({ items }: { items: DayItem[] }) {
  const hydrated = useHydrated();
  const [shift, setShift] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  if (!hydrated)
    return (
      <Panel title="ক্যালেন্ডার">
        <div className="h-64" />
      </Panel>
    );

  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + shift, 1);
  const lead = month.getDay();
  const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const byDay = new Map<string, DayItem[]>();
  for (const it of items) {
    const k = dayKey(new Date(it.iso));
    byDay.set(k, [...(byDay.get(k) ?? []), it]);
  }
  const selected = picked ?? dayKey(today);
  const list = byDay.get(selected) ?? [];

  return (
    <Panel
      title={
        <span>
          {MONTHS[month.getMonth()]} <Num value={month.getFullYear()} />
        </span>
      }
      action={
        <span className="flex gap-1">
          <button
            type="button"
            onClick={() => setShift((n) => n - 1)}
            aria-label="আগের মাস"
            className="grid size-8 place-items-center rounded-lg text-m-ink/70 hover:bg-m-ink/8 hover:text-m-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setShift((n) => n + 1)}
            aria-label="পরের মাস"
            className="grid size-8 place-items-center rounded-lg text-m-ink/70 hover:bg-m-ink/8 hover:text-m-ink"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </span>
      }
    >
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-1 font-mono text-[10px] font-bold text-m-ink/45">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`gap-${i}`} />
        ))}
        {Array.from({ length }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const k = dayKey(date);
          const busy = byDay.has(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => setPicked(k)}
              aria-pressed={k === selected}
              aria-label={busy ? `${i + 1} তারিখ, ${byDay.get(k)!.length}টি কাজ` : undefined}
              className={cn(
                "relative mx-auto grid size-8 place-items-center rounded-lg text-xs font-semibold transition-colors",
                k === selected ? "bg-m-yellow text-m-ink" : k === dayKey(today) ? "text-m-blue ring-1 ring-m-blue" : "text-m-ink/80 hover:bg-m-ink/8",
              )}
            >
              <Num value={i + 1} />
              {busy && <span aria-hidden className="absolute bottom-0.5 size-1 rounded-full bg-m-blue" />}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 space-y-1.5 border-t border-m-ink/10 pt-3">
        {list.length === 0 ? (
          <li className="text-xs text-m-ink/55">এই দিনে কোনো ক্লাস বা আয়োজন নেই।</li>
        ) : (
          list.map((it) => (
            <li key={it.href + it.iso}>
              <Link href={it.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-m-ink/85 hover:bg-m-ink/6 hover:text-m-ink">
                <span className={cn("size-2 shrink-0 rounded-full", it.kind === "class" ? "bg-m-blue" : "bg-m-yellow")} aria-hidden />
                <span className="truncate">{it.title}</span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </Panel>
  );
}

/** A short to-do list kept on this device: add, tick, remove, clear the done ones. */
export function TodoList() {
  const hydrated = useHydrated();
  const todos = useMediaState((s) => s.todos);
  const [text, setText] = useState("");
  const shown = hydrated ? todos : [];
  const left = shown.filter((t) => !t.done).length;

  function add(e: React.FormEvent) {
    e.preventDefault();
    const line = text.trim();
    if (!line) return;
    updateMedia((s) => ({ ...s, todos: [...s.todos, { id: newId("todo"), text: line.slice(0, 120), done: false }] }));
    setText("");
  }
  const patch = (fn: (list: typeof todos) => typeof todos) => updateMedia((s) => ({ ...s, todos: fn(s.todos) }));

  return (
    <Panel
      title="করণীয়"
      action={
        <span className="font-mono text-[11px] text-m-ink/55">
          <Num value={left} /> বাকি
        </span>
      }
    >
      <form onSubmit={add} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="নতুন কাজ লিখুন" aria-label="নতুন কাজ" className={cn(field, "h-10")} />
        <button type="submit" aria-label="যোগ করুন" className="grid size-10 shrink-0 place-items-center rounded-xl bg-m-yellow text-m-ink">
          <Plus className="size-4.5" aria-hidden />
        </button>
      </form>
      <ul className="mt-3 space-y-1">
        {shown.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-m-ink/5">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => patch((list) => list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              aria-label={t.text}
              className="size-4 shrink-0 accent-m-blue"
            />
            <span className={cn("min-w-0 flex-1 text-sm break-words", t.done ? "text-m-ink/45 line-through" : "text-m-ink")}>{t.text}</span>
            <button
              type="button"
              onClick={() => patch((list) => list.filter((x) => x.id !== t.id))}
              aria-label={`${t.text} মুছুন`}
              className="text-m-ink/40 opacity-0 group-hover:opacity-100 hover:text-m-red focus-visible:opacity-100"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      {shown.some((t) => t.done) && (
        <button type="button" onClick={() => patch((list) => list.filter((x) => !x.done))} className="mt-2 text-xs font-semibold text-m-blue hover:underline">
          শেষ হওয়াগুলো সরান
        </button>
      )}
    </Panel>
  );
}

/** A quick note: keep it on the notes board, or share it to the feed as a post. */
export function ShareNote() {
  const [text, setText] = useState("");
  const note = text.trim();
  const share = `/media/share?${new URLSearchParams({ u: "/media/notes", t: "আমার নোট", s: note, k: "নোট", src: "নোট" })}`;

  function keep() {
    updateMedia((s) => ({ ...s, notes: [{ id: newId("note"), text: note, color: "yellow", best: false, pinned: false, at: new Date().toISOString() }, ...s.notes] }));
    setText("");
    toast.success("নোটে রাখা হলো");
  }

  return (
    <Panel
      title="নোট"
      action={
        <Link href="/media/notes" className="text-xs font-semibold text-m-blue hover:underline">
          সব নোট
        </Link>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={400}
        rows={3}
        placeholder="আজ কী শিখলেন, কী ভাবলেন?"
        aria-label="নোট"
        className={cn(field, "resize-none py-2 leading-relaxed")}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={keep}
          disabled={!note}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-m-ink/15 text-sm font-semibold text-m-ink hover:bg-m-ink/6 disabled:opacity-45"
        >
          <StickyNote className="size-4" aria-hidden /> রাখুন
        </button>
        <Link
          href={share}
          aria-disabled={!note}
          className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-m-yellow text-sm font-bold text-m-ink", !note && "pointer-events-none opacity-45")}
        >
          <Send className="size-4" aria-hidden /> শেয়ার
        </Link>
      </div>
    </Panel>
  );
}
