"use client";

import { useState } from "react";
import { Crown, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { average, clampMark, examStage, ranked, type BatchExam } from "@/lib/media/batch-exam";
import { dhakaDay, type Batch } from "@/lib/media/batch";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Tx } from "../../ui/language";
import { DateText, Num } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

const NONE: BatchExam[] = [];
const field = "h-10 w-full border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong) focus:border-(--c-signal) focus:outline-none";

export const useExams = (batchId: string) => useAcademy((a) => a.exams?.[batchId] ?? NONE);
export const useLeader = (batchId: string) => useAcademy((a) => a.leaders?.[batchId]);

const save = (batchId: string, fn: (list: BatchExam[]) => BatchExam[]) => updateAcademy((a) => ({ ...a, exams: { ...a.exams, [batchId]: fn(a.exams?.[batchId] ?? []) } }));

/**
 * The batch's exams and its leader. The teacher sets exams, enters each
 * learner's marks and names the batch leader; a learner sees their own marks,
 * the class average and the three best.
 */
export function ExamsView({ batch, lead, me, roster }: { batch: Batch; lead: boolean; me: string; roster: { id: string; name: string }[] }) {
  const exams = useExams(batch.id);
  const leaderId = useLeader(batch.id);
  const people = [...roster, { id: "me", name: me }];
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id;
  const today = dhakaDay(new Date());
  const [title, setTitle] = useState("");
  const [on, setOn] = useState(today);
  const [marks, setMarks] = useState("20");

  function add(e: React.FormEvent) {
    e.preventDefault();
    const full = Number(marks);
    if (title.trim().length < 3 || !on || !(full > 0)) return toast.error("পরীক্ষার নাম, দিন আর পূর্ণমান দিন");
    save(batch.id, (list) => [...list, { id: newId("ex"), title: title.trim(), on, marks: full, scores: {} }]);
    setTitle("");
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="display text-3xl text-(--c-ink-strong)">
          <Tx k="পরীক্ষা ও লিডার" />
        </h2>
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-(--c-signal)" aria-hidden />
          <span className="hud text-(--c-faint)">
            <Tx k="ব্যাচ লিডার" />
          </span>
          {lead ? (
            <select
              value={leaderId ?? ""}
              onChange={(e) => updateAcademy((a) => ({ ...a, leaders: { ...a.leaders, [batch.id]: e.target.value } }))}
              className="h-10 border border-(--c-line-strong) bg-(--c-bg-sunken) px-3 text-(--c-ink-strong)"
              aria-label="ব্যাচ লিডার"
            >
              <option value="">{roster[0]?.name ?? "—"}</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-(--c-ink-strong)">{leaderId ? nameOf(leaderId) : (roster[0]?.name ?? "—")}</span>
          )}
        </div>
      </header>

      {lead && (
        <form onSubmit={add} className="grid grid-cols-1 gap-3 rounded-3xl bg-(--c-bg-raised) p-5 ring-1 ring-(--c-line) md:grid-cols-[minmax(0,1fr)_11rem_8rem_auto]">
          <label className="block">
            <span className="hud text-(--c-faint)">
              <Tx k="পরীক্ষার নাম" />
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={field} />
          </label>
          <label className="block">
            <span className="hud text-(--c-faint)">
              <Tx k="দিন" />
            </span>
            <input type="date" value={on} onChange={(e) => setOn(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="hud text-(--c-faint)">
              <Tx k="পূর্ণমান" />
            </span>
            <input type="number" min={1} max={1000} value={marks} onChange={(e) => setMarks(e.target.value)} className={field} />
          </label>
          <button type="submit" className="mt-auto h-10 bg-(--c-signal) px-5 font-bold text-black hover:opacity-85">
            <Tx k="পরীক্ষা যোগ করুন" />
          </button>
        </form>
      )}

      {exams.length === 0 && (
        <p className="rounded-3xl bg-(--c-bg-raised) p-6 text-(--c-muted) ring-1 ring-(--c-line)">
          <Tx k="এখনো কোনো পরীক্ষা নেই।" />
        </p>
      )}

      <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {[...exams]
          .sort((a, b) => a.on.localeCompare(b.on))
          .map((x) => {
            const stage = examStage(x, today);
            const avg = average(x);
            const mine = x.scores.me;
            return (
              <li key={x.id} className="rounded-3xl bg-(--c-bg-raised) p-5 ring-1 ring-(--c-line)">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="display text-xl text-(--c-ink-strong)">{x.title}</h3>
                    <p className="hud mt-1 text-(--c-muted)">
                      <DateText iso={x.on} /> · <Tx k="পূর্ণমান" /> <Num value={x.marks} />
                    </p>
                  </div>
                  <span
                    className={cn(
                      "hud shrink-0 px-2 py-0.5 font-bold",
                      stage === "past" ? "bg-(--c-bg-sunken) text-(--c-muted)" : stage === "today" ? "bg-(--c-bad) text-black" : "bg-(--c-signal) text-black",
                    )}
                  >
                    <Tx k={stage === "past" ? "হয়ে গেছে" : stage === "today" ? "আজ" : "সামনে"} />
                  </span>
                </div>

                {lead ? (
                  <ul className="mt-4 grid gap-2">
                    {people.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-sm text-(--c-ink)">{p.name}</span>
                        <input
                          type="number"
                          min={0}
                          max={x.marks}
                          step="0.5"
                          value={x.scores[p.id] ?? ""}
                          aria-label={p.name}
                          onChange={(e) => {
                            const v = clampMark(e.target.value, x.marks);
                            save(batch.id, (list) =>
                              list.map((y) => {
                                if (y.id !== x.id) return y;
                                const rest = Object.fromEntries(Object.entries(y.scores).filter(([k]) => k !== p.id));
                                return { ...y, scores: v === null ? rest : { ...rest, [p.id]: v } };
                              }),
                            );
                          }}
                          className="h-9 w-24 border border-(--c-line-strong) bg-(--c-bg-sunken) px-2 text-right text-(--c-ink-strong)"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-(--c-muted)">
                      <Tx k="আপনার নম্বর" />:{" "}
                      <span className="font-bold text-(--c-ink-strong)">
                        {mine === undefined ? (
                          "—"
                        ) : (
                          <>
                            <Num value={mine} />/<Num value={x.marks} />
                          </>
                        )}
                      </span>
                      {avg !== null && (
                        <>
                          {" · "}
                          <Tx k="ক্লাসের গড়" /> <Num value={avg} />
                        </>
                      )}
                    </p>
                    {ranked(x).slice(0, 3).length > 0 && (
                      <ol className="space-y-1">
                        {ranked(x)
                          .slice(0, 3)
                          .map((r, i) => (
                            <li key={r.id} className="flex items-center gap-2 text-sm">
                              <Trophy className={cn("size-4", i === 0 ? "text-(--c-signal)" : "text-(--c-faint)")} aria-hidden />
                              <span className="min-w-0 flex-1 truncate text-(--c-ink)">{nameOf(r.id)}</span>
                              <span className="font-bold text-(--c-ink-strong)">
                                <Num value={r.score} />
                              </span>
                            </li>
                          ))}
                      </ol>
                    )}
                  </div>
                )}

                {lead && (
                  <button
                    type="button"
                    onClick={() => save(batch.id, (list) => list.filter((y) => y.id !== x.id))}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-(--c-muted) hover:text-(--c-bad)"
                  >
                    <Trash2 className="size-4" aria-hidden /> <Tx k="পরীক্ষা মুছুন" />
                  </button>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
