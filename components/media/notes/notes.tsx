"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pin, PinOff, Star, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { noteSchema, type NoteInput } from "@/lib/media/schemas";
import { newId, updateMedia, useHydrated, useMediaState, type MyNote } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { Ago, Num } from "../ui/numerals";
import { Skeleton } from "@/components/ui/skeleton";

const noteColor: Record<MyNote["color"], string> = {
  yellow: "bg-amber-100 ring-amber-200",
  green: "bg-bd-green-light ring-bd-green/20",
  orange: "bg-orange-100 ring-orange-200",
  blue: "bg-sky-100 ring-sky-200",
};

const colorBn: Record<MyNote["color"], string> = { yellow: "হলুদ", green: "সবুজ", orange: "কমলা", blue: "নীল" };

const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

function patchNote(id: string, fn: (n: MyNote) => MyNote) {
  updateMedia((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? fn(n) : n)) }));
}

/** One sticky note. */
export function NoteCard({ note, readOnly }: { note: MyNote; readOnly?: boolean }) {
  return (
    <li className={cn("fade-in relative flex min-h-36 flex-col rounded-xl p-4 shadow-[0_2px_6px_-2px_rgb(15_23_42/0.15)] ring-1", noteColor[note.color])}>
      {note.best && (
        <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-orange-900">
          <Star className="size-3 fill-current" aria-hidden /> দিনের সেরা কাজ
        </span>
      )}
      <p className="flex-1 text-[15px] leading-relaxed whitespace-pre-line text-text-primary">{note.text}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-text-secondary">
        <Ago iso={note.at} live />
        {!readOnly && (
          <span className="flex gap-1">
            <button
              type="button"
              aria-pressed={note.pinned}
              onClick={() => patchNote(note.id, (n) => ({ ...n, pinned: !n.pinned }))}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-white/70"
              title={note.pinned ? "প্রোফাইল থেকে সরান" : "প্রোফাইলে দেখান"}
            >
              {note.pinned ? <PinOff className="size-4" aria-hidden /> : <Pin className="size-4" aria-hidden />}
              <span className="sr-only">{note.pinned ? "প্রোফাইল থেকে সরান" : "প্রোফাইলে দেখান"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                updateMedia((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== note.id) }));
                toast("নোট মুছে ফেলা হলো");
              }}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-white/70 hover:text-national-crimson"
            >
              <Trash2 className="size-4" aria-hidden />
              <span className="sr-only">মুছুন</span>
            </button>
          </span>
        )}
      </div>
      {note.pinned && <Pin className="absolute top-3 right-3 size-4 rotate-45 text-text-muted" aria-hidden />}
    </li>
  );
}

export function NotesBoard() {
  const hydrated = useHydrated();
  const notes = useMediaState((s) => s.notes);
  const form = useForm<NoteInput>({ resolver: zodResolver(noteSchema), defaultValues: { text: "", color: "yellow", best: false } });

  function onSubmit(v: NoteInput) {
    const at = new Date().toISOString();
    const note: MyNote = { id: newId("n"), text: v.text, color: v.color, best: v.best, pinned: v.best, at };
    updateMedia((s) => {
      // One "best of the day" per day: a new one replaces today's.
      const rest = v.best ? s.notes.map((n) => (n.best && sameDay(n.at, at) ? { ...n, best: false } : n)) : s.notes;
      const today = new Date().toLocaleDateString("en-CA");
      const plan = v.best ? { date: today, done: { ...(s.plan.date === today ? s.plan.done : {}), create: true as const } } : s.plan;
      return { ...s, notes: [note, ...rest], plan };
    });
    form.reset({ text: "", color: v.color, best: false });
    toast.success(v.best ? "আজকের সেরা কাজ প্রোফাইলে যুক্ত হলো" : "নোট রাখা হলো");
  }

  const best = notes.filter((n) => n.best).length;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-card-border bg-white p-4 sm:p-5">
          <FormField control={form.control} name="text" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea rows={3} aria-label="নোট" placeholder="আজকের সেরা কাজ, কাউকে সাহায্য, একটা ভালো স্মৃতি…" className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-3">
            <div className="flex flex-wrap items-center gap-4">
              <FormField control={form.control} name="color" render={({ field }) => (
                <div role="radiogroup" aria-label="রং" className="flex gap-1.5">
                  {(Object.keys(noteColor) as MyNote["color"][]).map((c) => (
                    <label key={c} className={cn("flex size-8 cursor-pointer items-center justify-center rounded-full ring-1 has-focus-visible:ring-3 has-focus-visible:ring-bd-green/40", noteColor[c], field.value === c && "ring-2 ring-text-primary")}>
                      <input type="radio" className="sr-only" name={field.name} checked={field.value === c} onChange={() => field.onChange(c)} />
                      <span className="sr-only">{colorBn[c]}</span>
                    </label>
                  ))}
                </div>
              )} />
              <FormField control={form.control} name="best" render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-text-secondary">
                  <Switch checked={field.value} onCheckedChange={field.onChange} /> দিনের সেরা কাজ
                </label>
              )} />
            </div>
            <button type="submit" className={mediaButton({ variant: "primary", size: "sm" })}>
              <StickyNote aria-hidden /> রাখুন
            </button>
          </div>
        </form>
      </Form>

      {!hydrated ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState icon="posts" title="এখনো কোনো নোট নেই" body="দিনের শেষে এক লাইন লিখে রাখুন — কী শিখলেন, কাকে সাহায্য করলেন। সেরা কাজগুলো প্রোফাইলে জমবে।" />
      ) : (
        <>
          <p className="text-sm text-text-muted">
            <Num value={notes.length} />টি নোট · <Num value={best} />টি দিনের সেরা কাজ
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => <NoteCard key={n.id} note={n} />)}
          </ul>
        </>
      )}
    </div>
  );
}

/** Pinned notes on the viewer's own profile. */
export function PinnedNotes() {
  const pinned = useMediaState((s) => s.notes).filter((n) => n.pinned).slice(0, 6);
  if (pinned.length === 0) return null;
  return (
    <section aria-labelledby="pinned-notes" className="rounded-2xl border border-card-border bg-white p-4 sm:p-6">
      <h2 id="pinned-notes" className="mb-4 text-base font-bold text-text-primary">নোট — সেরা কাজ ও স্মৃতি</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{pinned.map((n) => <NoteCard key={n.id} note={n} readOnly />)}</ul>
    </section>
  );
}
