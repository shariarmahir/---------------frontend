"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { admissionQuestions, coursesOf, departments, getDepartment } from "@/data/media/academy";
import { LEVELS, SCHOOLS, placement, type Admission, type School } from "@/lib/media/academy";
import { scorePaper } from "@/lib/media/classroom";
import { admissionSchema, type AdmissionInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { CourseCard } from "./parts";
import { updateAcademy, useAcademy } from "./use-academy";

const LEVEL_ORDER = { foundation: 0, intermediate: 1, advanced: 2 } as const;

/**
 * Joining a department: what you want, what you have already done, and four
 * practical questions from its school. It places — it never turns anyone
 * away. On a department's page the department is fixed (`lockDept`); on the
 * admission page the learner picks one.
 */
export function AdmissionTest({ initialDept, lockDept }: { initialDept?: string; lockDept?: string }) {
  const ensure = useRequireAccount();
  const hydrated = useHydrated();
  const admissions = useAcademy((a) => a.admissions);
  const top = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<AdmissionInput | null>(null);
  const [picks, setPicks] = useState<(number | undefined)[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const [retake, setRetake] = useState(false);
  const preset = lockDept ?? (initialDept && getDepartment(initialDept) ? initialDept : "");
  const form = useForm<AdmissionInput>({ resolver: zodResolver(admissionSchema), defaultValues: { dept: preset, goal: "", years: 0, proof: "" } });

  if (!hydrated) return null;

  const resultDept = shown ?? (lockDept && admissions[lockDept] && !retake ? lockDept : null);
  const again = () => {
    setShown(null);
    setRetake(true);
    setAnswers(null);
    setPicks([]);
    form.reset({ dept: preset, goal: "", years: 0, proof: "" });
  };

  if (resultDept && admissions[resultDept]) {
    return (
      <div ref={top} className="scroll-mt-6">
        <Result admission={admissions[resultDept]} compact={Boolean(lockDept)} onAgain={again} />
      </div>
    );
  }

  if (!answers) {
    return (
      <div ref={top} className="scroll-mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => ensure("বিভাগে যোগ দিতে") && setAnswers(v))} noValidate className="space-y-5 rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-7 shadow-m-tile">
            <StepHead n={1} title={lockDept ? "আপনার কথা" : "কী শিখতে চান"} />
            {!lockDept && (
              <FormField control={form.control} name="dept" render={({ field }) => (
                <FormItem>
                  <FormLabel>বিভাগ</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClass}>
                      <option value="">বেছে নিন</option>
                      {(Object.keys(SCHOOLS) as School[]).map((s) => (
                        <optgroup key={s} label={SCHOOLS[s]}>
                          {departments.filter((d) => d.school === s).map((d) => <option key={d.id} value={d.id}>{admissions[d.id] ? `${d.name} (যোগ দিয়েছেন)` : d.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem>
                <FormLabel>কেন শিখতে চান, শেষে কী করবেন</FormLabel>
                <FormControl><Textarea rows={3} placeholder="যেমন: নিজের গ্যারেজ খুলতে চাই, এলাকায় ভালো মেকানিক নেই।" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <FormField control={form.control} name="years" render={({ field }) => (
                <FormItem>
                  <FormLabel>আগে কত বছর করেছেন</FormLabel>
                  <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} placeholder="০" onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="proof" render={({ field }) => (
                <FormItem>
                  <FormLabel>কাজের প্রমাণ (ঐচ্ছিক)</FormLabel>
                  <FormControl><Input type="url" placeholder="https://… ভিডিও, ছবি বা পোর্টফোলিও" {...field} /></FormControl>
                  <FormDescription>তিন বছরের বেশি কাজ আর প্রমাণ থাকলে সরাসরি ফাইনালে বসতে পারবেন।</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}>
              চার প্রশ্নে যান <ArrowRight aria-hidden />
            </button>
          </form>
        </Form>
      </div>
    );
  }

  const dept = getDepartment(answers.dept)!;
  const questions = admissionQuestions[dept.school];
  const answered = questions.every((_, i) => picks[i] !== undefined);

  function submit() {
    const score = scorePaper(questions, picks);
    const placed = placement({ testPct: score, years: answers!.years, hasProof: answers!.proof !== "" });
    const admission: Admission = { ...answers!, score, ...placed, at: new Date().toISOString() };
    if (!updateAcademy((a) => ({ ...a, admissions: { ...a.admissions, [admission.dept]: admission } }))) {
      toast.error("এই ব্রাউজারে সংরক্ষণ হয়নি", { description: "ফল এই ভিজিটে দেখা যাবে, পরে নাও থাকতে পারে।" });
    }
    setShown(admission.dept);
    setRetake(false);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={top} className="scroll-mt-6 space-y-5 rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-7 shadow-m-tile">
      <StepHead n={2} title={`${SCHOOLS[dept.school]} — চারটি প্রশ্ন`} />
      <p className="text-sm text-m-ink/75">ভুল হলে ক্ষতি নেই — শুধু ঠিক হয় কোন স্তর থেকে শুরু করবেন।</p>
      <ol className="space-y-6">
        {questions.map((q, i) => (
          <li key={q.q}>
            <fieldset>
              <legend className="mb-2.5 font-semibold text-m-ink"><Num value={i + 1} />. {q.q}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o, j) => (
                  <label key={o} className={choiceClass(picks[i] === j)}>
                    <input
                      type="radio"
                      className="sr-only"
                      name={`q${i}`}
                      checked={picks[i] === j}
                      onChange={() => setPicks((p) => { const next = [...p]; next[i] = j; return next; })}
                    />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3 border-t border-m-ink/9 pt-5">
        <button type="button" disabled={!answered} onClick={submit} className={mediaButton({ variant: "primary", size: "lg" })}>
          জমা দিন ও যোগ দিন
        </button>
        <button type="button" onClick={() => setAnswers(null)} className={mediaButton({ variant: "ghost" })}>আগের ধাপে</button>
        {!answered && <span className="text-sm text-m-ink/65">সব প্রশ্নের উত্তর দিন</span>}
      </div>
    </div>
  );
}

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-m-ink">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-m-yellow text-sm text-m-ink"><Num value={n} /></span>
      {title}
    </h2>
  );
}

function Result({ admission, compact, onAgain }: { admission: Admission; compact: boolean; onAgain: () => void }) {
  const dept = getDepartment(admission.dept);
  const questions = dept ? admissionQuestions[dept.school] : [];
  const suggested = dept
    ? [...coursesOf(dept.id)].sort((a, b) => Math.abs(LEVEL_ORDER[a.level] - LEVEL_ORDER[admission.level]) - Math.abs(LEVEL_ORDER[b.level] - LEVEL_ORDER[admission.level]))
    : [];

  return (
    <div className="space-y-8">
      <section className="live-in rounded-2xl bg-m-card p-5 ring-1 ring-m-blue/40 sm:p-7 shadow-m-tile">
        <p className="text-sm font-semibold text-m-blue">আপনি এই বিভাগের শিক্ষার্থী — কোনো ফি লাগেনি</p>
        <h2 className="mt-2 text-2xl font-bold text-m-ink">{dept?.name}</h2>
        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["শুরুর স্তর", LEVELS[admission.level]],
            ["পরীক্ষায়", <><Num key="s" value={admission.score} />%</>],
            ["অভিজ্ঞতা", <><Num key="y" value={admission.years} /> বছর</>],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl bg-white/65 p-3">
              <dt className="text-xs text-m-ink/65">{k}</dt>
              <dd className="mt-1 text-lg font-bold text-m-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {admission.fastTrack ? (
          <p className="mt-5 text-sm leading-relaxed text-m-ink/85">
            আপনার অভিজ্ঞতা আর কাজের প্রমাণ আছে। এই বিভাগের কোর্সে হাজিরা-হোমওয়ার্ক মাফ — প্রজেক্ট জমা দিলেই <Link href="/media/academy/exam" className="font-semibold text-m-blue hover:underline">প্যানেল ইন্টারভিউ</Link>, সরকারের আরপিএল (পূর্ব-অভিজ্ঞতার স্বীকৃতি) যেভাবে কাজ করে।
          </p>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-m-ink/85">আপনার স্তরের সবচেয়ে কাছের কোর্স দিয়ে শুরু করুন। কোর্সে ঢুকলে শুধু সেই কোর্সের ফি।</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {suggested[0] && (
            <Link href={`/media/academy/course/${suggested[0].id}`} className={mediaButton({ variant: "primary" })}>
              {suggested[0].title} <ArrowRight aria-hidden />
            </Link>
          )}
          <button type="button" onClick={onAgain} className={mediaButton({ variant: "quiet", size: "sm" })}>
            {compact ? "আবার পরীক্ষা দিন" : "আরেকটা বিভাগে যোগ দিন"}
          </button>
        </div>
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer font-semibold text-m-blue">সঠিক উত্তরগুলো দেখুন</summary>
          <ol className="mt-3 space-y-2">
            {questions.map((q) => (
              <li key={q.q} className="text-m-ink/85">
                {q.q} <span className="font-semibold text-m-green">{q.options[q.answer]}</span>
              </li>
            ))}
          </ol>
        </details>
      </section>

      {!compact && suggested.length > 0 && (
        <section aria-labelledby="suggested">
          <h2 id="suggested" className="mb-4 text-lg font-bold text-m-ink">আপনার জন্য কোর্স</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {suggested.map((c) => <CourseCard key={c.id} course={c} className={cn(c.level === admission.level && "ring-m-blue/60")} />)}
          </div>
        </section>
      )}
    </div>
  );
}
