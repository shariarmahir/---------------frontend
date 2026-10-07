"use client";

import Link from "next/link";
import { useState } from "react";
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
 * The free admission test: what you want, what you have already done, and
 * four practical questions from your department's school. It places — it
 * never turns anyone away.
 */
export function AdmissionTest({ initialDept }: { initialDept?: string }) {
  const ensure = useRequireAccount();
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.admission);
  const [answers, setAnswers] = useState<AdmissionInput | null>(null);
  const [picks, setPicks] = useState<(number | undefined)[]>([]);
  const [retake, setRetake] = useState(false);
  const form = useForm<AdmissionInput>({
    resolver: zodResolver(admissionSchema),
    defaultValues: { dept: initialDept && getDepartment(initialDept) ? initialDept : "", goal: "", years: 0, proof: "" },
  });

  if (!hydrated) return null;
  if (saved && !retake) return <Result admission={saved} onRetake={() => { setRetake(true); setAnswers(null); setPicks([]); }} />;

  if (!answers) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => ensure("ভর্তি পরীক্ষা দিতে") && setAnswers(v))} noValidate className="space-y-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-7">
          <StepHead n={1} title="কী শিখতে চান" />
          <FormField control={form.control} name="dept" render={({ field }) => (
            <FormItem>
              <FormLabel>বিভাগ</FormLabel>
              <FormControl>
                <select {...field} className={selectClass}>
                  <option value="">বেছে নিন</option>
                  {(Object.keys(SCHOOLS) as School[]).map((s) => (
                    <optgroup key={s} label={SCHOOLS[s]}>
                      {departments.filter((d) => d.school === s).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
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
                <FormDescription>অভিজ্ঞতা আর প্রমাণ থাকলে সরাসরি ফাইনালে বসতে পারবেন।</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}>
            পরীক্ষায় যান <ArrowRight aria-hidden />
          </button>
        </form>
      </Form>
    );
  }

  const dept = getDepartment(answers.dept)!;
  const questions = admissionQuestions[dept.school];
  const answered = questions.every((_, i) => picks[i] !== undefined);

  function submit() {
    const score = scorePaper(questions, picks);
    const placed = placement({ testPct: score, years: answers!.years, hasProof: answers!.proof !== "" });
    const admission: Admission = { ...answers!, score, ...placed, at: new Date().toISOString() };
    if (!updateAcademy((a) => ({ ...a, admission }))) toast.error("এই ব্রাউজারে সংরক্ষণ হয়নি", { description: "ফল এই ভিজিটে দেখা যাবে, পরে নাও থাকতে পারে।" });
    setRetake(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-7">
      <StepHead n={2} title={`${SCHOOLS[dept.school]} — চারটি প্রশ্ন`} />
      <p className="text-sm text-white/75">ভুল হলে ক্ষতি নেই — শুধু ঠিক হয় কোন স্তর থেকে শুরু করবেন।</p>
      <ol className="space-y-6">
        {questions.map((q, i) => (
          <li key={q.q}>
            <fieldset>
              <legend className="mb-2.5 font-semibold text-white"><Num value={i + 1} />. {q.q}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o, j) => (
                  <label key={o} className={choiceClass(picks[i] === j)}>
                    <input type="radio" className="sr-only" name={`q${i}`} checked={picks[i] === j} onChange={() => setPicks((p) => { const next = [...p]; next[i] = j; return next; })} />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <button type="button" disabled={!answered} onClick={submit} className={mediaButton({ variant: "primary", size: "lg" })}>
          জমা দিন ও ফল দেখুন
        </button>
        <button type="button" onClick={() => setAnswers(null)} className={mediaButton({ variant: "ghost" })}>আগের ধাপে</button>
        {!answered && <span className="text-sm text-white/65">সব প্রশ্নের উত্তর দিন</span>}
      </div>
    </div>
  );
}

function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-white">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-signal-orange text-sm text-text-primary"><Num value={n} /></span>
      {title}
    </h2>
  );
}

function Result({ admission, onRetake }: { admission: Admission; onRetake: () => void }) {
  const dept = getDepartment(admission.dept);
  const questions = dept ? admissionQuestions[dept.school] : [];
  const suggested = dept
    ? [...coursesOf(dept.id)].sort((a, b) => Math.abs(LEVEL_ORDER[a.level] - LEVEL_ORDER[admission.level]) - Math.abs(LEVEL_ORDER[b.level] - LEVEL_ORDER[admission.level]))
    : [];

  return (
    <div className="space-y-8">
      <section className="live-in rounded-2xl bg-text-primary p-5 ring-1 ring-signal-orange/40 sm:p-7">
        <p className="text-sm font-semibold text-signal-orange">ভর্তি নিশ্চিত — কোনো ফি লাগেনি</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{dept?.name}</h2>
        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["শুরুর স্তর", LEVELS[admission.level]],
            ["পরীক্ষায়", <><Num key="s" value={admission.score} />%</>],
            ["অভিজ্ঞতা", <><Num key="y" value={admission.years} /> বছর</>],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl bg-black/40 p-3">
              <dt className="text-xs text-white/65">{k}</dt>
              <dd className="mt-1 text-lg font-bold text-white">{v}</dd>
            </div>
          ))}
        </dl>
        {admission.fastTrack ? (
          <p className="mt-5 text-sm leading-relaxed text-white/85">
            আপনার অভিজ্ঞতা আর কাজের প্রমাণ আছে। চাইলে কোর্স না করেই <Link href="/media/academy/exam" className="font-semibold text-signal-orange hover:underline">ফাইনাল প্রজেক্ট ও প্যানেল ইন্টারভিউ</Link> দিতে পারেন — সরকারের আরপিএল (পূর্ব-অভিজ্ঞতার স্বীকৃতি) যেভাবে কাজ করে।
          </p>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-white/85">নিচের কোর্সগুলো আপনার স্তরের কাছাকাছি থেকে সাজানো। কোর্সে ভর্তির সময় শুধু সেই কোর্সের ফি দিতে হয়।</p>
        )}
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer font-semibold text-signal-orange">সঠিক উত্তরগুলো দেখুন</summary>
          <ol className="mt-3 space-y-2">
            {questions.map((q) => (
              <li key={q.q} className="text-white/85">
                {q.q} <span className="font-semibold text-bdgreen-500">{q.options[q.answer]}</span>
              </li>
            ))}
          </ol>
        </details>
        <button type="button" onClick={onRetake} className={mediaButton({ variant: "quiet", size: "sm", className: "mt-5" })}>অন্য বিভাগে আবার পরীক্ষা দিন</button>
      </section>

      {suggested.length > 0 && (
        <section aria-labelledby="suggested">
          <h2 id="suggested" className="mb-4 text-lg font-bold text-white">আপনার জন্য কোর্স</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {suggested.map((c) => <CourseCard key={c.id} course={c} className={cn(c.level === admission.level && "ring-signal-orange/60")} />)}
          </div>
        </section>
      )}
    </div>
  );
}
