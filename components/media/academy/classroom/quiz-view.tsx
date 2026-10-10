"use client";

import { useState } from "react";
import { Award, Flame, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { dhakaDay, type Batch } from "@/lib/media/batch";
import { POINTS_PER_ANSWER, badgesOf, pointsOf, streak, type QuizPlay, type QuizQuestion } from "@/lib/media/quiz";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Tx } from "../../ui/language";
import { Num } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

const NONE: QuizQuestion[] = [];
const NO_PLAY: QuizPlay = { picks: {}, days: [] };
const field = "h-10 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong) focus:border-(--c-signal) focus:outline-none";

/**
 * Fun with knowledge: the teacher writes questions for the batch; a learner
 * answers each once, sees at once if it was right, and builds points, a streak
 * of days and badges.
 */
export function QuizView({ batch, lead }: { batch: Batch; lead: boolean }) {
  const questions = useAcademy((a) => a.quizzes?.[batch.id] ?? NONE);
  const play = useAcademy((a) => a.quizPlay?.[batch.id] ?? NO_PLAY);
  const today = dhakaDay(new Date());
  const [text, setText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);

  const points = pointsOf(questions, play);
  const run = streak(play.days, today);
  const answered = Object.keys(play.picks).length;
  const badges = badgesOf(points, run, answered);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const opts = options.map((o) => o.trim());
    if (text.trim().length < 4 || opts.filter(Boolean).length < 2 || !opts[answer]) return toast.error("প্রশ্ন, অন্তত দুটি উত্তর আর সঠিক উত্তরটা দিন");
    const q: QuizQuestion = { id: newId("qz"), text: text.trim(), options: opts.filter(Boolean), answer: opts.slice(0, answer).filter(Boolean).length };
    updateAcademy((a) => ({ ...a, quizzes: { ...a.quizzes, [batch.id]: [...(a.quizzes?.[batch.id] ?? []), q] } }));
    setText("");
    setOptions(["", "", "", ""]);
    setAnswer(0);
  }

  function pick(q: QuizQuestion, i: number) {
    if (play.picks[q.id] !== undefined) return;
    updateAcademy((a) => {
      const now = a.quizPlay?.[batch.id] ?? NO_PLAY;
      const days = now.days.includes(today) ? now.days : [...now.days, today];
      return { ...a, quizPlay: { ...a.quizPlay, [batch.id]: { picks: { ...now.picks, [q.id]: i }, days } } };
    });
    if (i === q.answer) toast.success("ঠিক! +১০ পয়েন্ট");
    else toast("আরেকটু হলেই হতো", { description: q.options[q.answer] });
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display text-3xl text-(--c-ink-strong)">
          <Tx k="খেলা ও কুইজ" />
        </h2>
        <ul className="flex flex-wrap gap-3">
          <li className="flex items-center gap-2 rounded-2xl bg-(--c-signal) px-4 py-2 font-bold text-black">
            <Sparkles className="size-4" aria-hidden /> <Num value={points} /> <Tx k="পয়েন্ট" />
          </li>
          <li className="flex items-center gap-2 rounded-2xl bg-(--c-bad) px-4 py-2 font-bold text-black">
            <Flame className="size-4" aria-hidden /> <Num value={run} /> <Tx k="দিনের ধারা" />
          </li>
        </ul>
      </header>

      {badges.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <li key={b.id} className="inline-flex items-center gap-1.5 rounded-full bg-(--c-blue) px-3 py-1 text-sm font-bold text-(--c-signal)">
              <Award className="size-4" aria-hidden /> <Tx k={b.label} />
            </li>
          ))}
        </ul>
      )}

      {lead && (
        <form onSubmit={add} className="space-y-3 rounded-3xl bg-(--c-bg-raised) p-5 ring-1 ring-(--c-line)">
          <label className="block">
            <span className="hud text-(--c-faint)">
              <Tx k="নতুন প্রশ্ন" />
            </span>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={140} className={field} />
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((o, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name="right" checked={answer === i} onChange={() => setAnswer(i)} aria-label="সঠিক উত্তর" className="size-4 accent-(--c-good)" />
                <input value={o} onChange={(e) => setOptions((list) => list.map((x, k) => (k === i ? e.target.value : x)))} maxLength={60} className={field} aria-label={`উত্তর ${i + 1}`} />
              </label>
            ))}
          </div>
          <button type="submit" className="inline-flex h-10 items-center gap-2 bg-(--c-signal) px-5 font-bold text-black hover:opacity-85">
            <Plus className="size-4" aria-hidden /> <Tx k="প্রশ্ন যোগ করুন" />
          </button>
        </form>
      )}

      {questions.length === 0 ? (
        <p className="rounded-3xl bg-(--c-bg-raised) p-6 text-(--c-muted) ring-1 ring-(--c-line)">
          <Tx k={lead ? "প্রথম প্রশ্নটা লিখুন — ব্যাচ খেলতে শুরু করবে।" : "শিক্ষক এখনো কোনো প্রশ্ন দেননি।"} />
        </p>
      ) : (
        <ol className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {questions.map((q, n) => {
            const picked = play.picks[q.id];
            return (
              <li key={q.id} className="rounded-3xl bg-(--c-bg-raised) p-5 ring-1 ring-(--c-line)">
                <p className="flex items-start gap-3 font-bold text-(--c-ink-strong)">
                  <span className="hud mt-0.5 shrink-0 text-(--c-faint)">
                    <Num value={n + 1} />
                  </span>
                  <span className="min-w-0 flex-1">{q.text}</span>
                  {lead && (
                    <button
                      type="button"
                      onClick={() => updateAcademy((a) => ({ ...a, quizzes: { ...a.quizzes, [batch.id]: (a.quizzes?.[batch.id] ?? []).filter((x) => x.id !== q.id) } }))}
                      aria-label="প্রশ্ন মুছুন"
                      className="text-(--c-muted) hover:text-(--c-bad)"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </p>
                <ul className="mt-4 grid gap-2">
                  {q.options.map((o, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        disabled={picked !== undefined}
                        onClick={() => pick(q, i)}
                        className={cn(
                          "w-full rounded-xl px-4 py-2.5 text-left font-semibold transition-colors",
                          picked === undefined
                            ? "bg-(--c-bg-sunken) text-(--c-ink) hover:bg-(--c-blue) hover:text-(--c-signal)"
                            : i === q.answer
                              ? "bg-(--c-good) text-black"
                              : picked === i
                                ? "bg-(--c-bad) text-black"
                                : "bg-(--c-bg-sunken) text-(--c-faint)",
                        )}
                      >
                        {o}
                      </button>
                    </li>
                  ))}
                </ul>
                {picked !== undefined && picked === q.answer && (
                  <p className="hud mt-3 text-(--c-good)">
                    +<Num value={POINTS_PER_ANSWER} /> <Tx k="পয়েন্ট" />
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
