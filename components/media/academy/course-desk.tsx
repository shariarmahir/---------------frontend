"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDepartment } from "@/data/media/academy";
import { MIN_ATTENDANCE, MIN_HOMEWORK, interviewSlots, progressOf, type Course, type Enrollment } from "@/lib/media/academy";
import { projectSchema, type ProjectInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { DateText, Num, useFormat } from "../ui/numerals";
import { PayDialog } from "./pay-dialog";
import { Fee, ModeTag } from "./parts";
import { updateAcademy, useAcademy } from "./use-academy";

const pct = (n: number) => Math.round(n * 100);

function updateEnrollment(code: string, fn: (e: Enrollment) => Enrollment) {
  updateAcademy((a) => (a.enrolled[code] ? { ...a, enrolled: { ...a.enrolled, [code]: fn(a.enrolled[code]) } } : a));
}

/**
 * The learner's side of a course: join its department first, then the fee into
 * escrow, then week by week — attendance, homework, the final project and a
 * panel-interview slot once the bar is met.
 */
export function CourseDesk({ course }: { course: Course }) {
  const hydrated = useHydrated();
  const admitted = useAcademy((a) => Boolean(a.admissions[course.dept]));
  const enrollment = useAcademy((a) => a.enrolled[course.id]);
  // Recognised prior learning: attendance and homework are waived in the department they were placed in.
  const fastTrack = useAcademy((a) => Boolean(a.admissions[course.dept]?.fastTrack));

  if (!hydrated) return <Skeleton className="h-96 rounded-2xl bg-text-primary/40" />;

  return (
    <div className="space-y-6">
      {enrollment ? <Standing course={course} e={enrollment} fastTrack={fastTrack} /> : <Enroll course={course} admitted={admitted} />}
      <Curriculum course={course} e={enrollment} />
      {enrollment && <Final course={course} e={enrollment} fastTrack={fastTrack} />}
    </div>
  );
}

function Enroll({ course, admitted }: { course: Course; admitted: boolean }) {
  const ensure = useRequireAccount();
  const [paying, setPaying] = useState(false);
  const full = course.enrolled >= course.seats;

  function join() {
    updateAcademy((a) => ({ ...a, enrolled: { ...a.enrolled, [course.id]: { at: new Date().toISOString(), attended: [], homework: {} } } }));
    setPaying(false);
    toast.success("কোর্সে ভর্তি হলেন", { description: "প্রথম সপ্তাহ থেকে হাজিরা আর হোমওয়ার্ক গোনা শুরু।" });
  }

  return (
    <section className="rounded-2xl bg-text-primary p-5 ring-1 ring-signal-orange/40 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/75">কোর্স ফি</p>
          <p className="text-2xl"><Fee amount={course.fee} /></p>
          {course.fee > 0 && <p className="text-xs text-white/65">শিক্ষক পান ৯৫% · টাকা এসক্রোতে থাকে</p>}
        </div>
        {!admitted ? (
          <Link href={`/media/academy/dept/${course.dept}#join`} className={mediaButton({ variant: "primary", size: "lg" })}>
            আগে বিভাগে যোগ দিন — বিনামূল্যে
          </Link>
        ) : full ? (
          <p className="max-w-xs text-sm text-white/80">এই ব্যাচের সব আসন পূর্ণ। পরের ব্যাচের তারিখ শিক্ষক বিভাগের পাতায় জানাবেন।</p>
        ) : (
          <button type="button" onClick={() => ensure("কোর্সে ভর্তি হতে") && (course.fee === 0 ? join() : setPaying(true))} className={mediaButton({ variant: "primary", size: "lg" })}>
            কোর্সে ভর্তি হোন
          </button>
        )}
      </div>
      {course.fee > 0 && (
        <PayDialog open={paying} onOpenChange={setPaying} title={course.title} label={`কোর্স ${course.id}: ${course.title}`} price={course.fee} onPaid={join} />
      )}
    </section>
  );
}

function Meter({ label, value, goal, need }: { label: string; value: number; goal: number; need: string | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-white">{label}</span>
        <span className="tabular-nums text-white/80"><Num value={pct(value)} />% <span className="text-white/65">/ লক্ষ্য <Num value={pct(goal)} />%</span></span>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="presentation">
        <span className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500", value >= goal ? "bg-bdgreen-500" : "bg-signal-orange")} style={{ width: `${Math.min(100, pct(value))}%` }} />
        <span className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pct(goal)}%` }} />
      </div>
      {need && <p className="mt-1.5 text-xs text-white/70">{need}</p>}
    </div>
  );
}

function Standing({ course, e, fastTrack }: { course: Course; e: Enrollment; fastTrack: boolean }) {
  const { num } = useFormat();
  const p = progressOf(course, e);
  return (
    <section aria-label="আমার অগ্রগতি" className="space-y-4 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
      <p className="text-sm font-semibold text-signal-orange">ভর্তি · <DateText iso={e.at} /></p>
      <Meter label="হাজিরা" value={p.attended / course.lessons.length} goal={MIN_ATTENDANCE} need={p.needClasses ? `আরও ${num(p.needClasses)}টি ক্লাস` : null} />
      <Meter label="হোমওয়ার্ক" value={p.homeworkSet ? p.homeworkDone / p.homeworkSet : 1} goal={MIN_HOMEWORK} need={p.needHomework ? `আরও ${num(p.needHomework)}টি হোমওয়ার্ক` : null} />
      <p className="text-sm text-white/85">
        {p.eligible || (fastTrack && e.project) ? "ফাইনাল ইন্টারভিউয়ের জন্য প্রস্তুত — নিচে সময় বেছে নিন।" : fastTrack ? "অভিজ্ঞতার স্বীকৃতি: হাজিরা আর হোমওয়ার্ক মাফ — প্রজেক্ট জমা দিলেই ইন্টারভিউ।" : e.project ? "প্রজেক্ট জমা হয়েছে; হাজিরা আর হোমওয়ার্ক পূরণ হলে ইন্টারভিউ খুলবে।" : "হাজিরা, হোমওয়ার্ক আর ফাইনাল প্রজেক্ট — তিনটি হলে প্যানেল ইন্টারভিউ।"}
      </p>
    </section>
  );
}

function Curriculum({ course, e }: { course: Course; e?: Enrollment }) {
  const place = getDepartment(course.dept)?.place;
  return (
    <section aria-labelledby="curriculum">
      <h2 id="curriculum" className="mb-3 text-lg font-bold text-white">সপ্তাহ ধরে পাঠক্রম</h2>
      <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[1.1rem] before:w-px before:bg-white/15">
        {course.lessons.map((l) => {
          const attended = e?.attended.includes(l.week) ?? false;
          return (
            <li key={l.week} className="relative flex gap-4">
              <span className={cn("relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold", attended ? "bg-bdgreen-500 text-text-primary" : "bg-text-primary text-white ring-1 ring-white/20")}>
                {attended ? <Check className="size-4" aria-label="উপস্থিত" /> : <Num value={l.week} />}
              </span>
              <div className="min-w-0 flex-1 rounded-xl bg-text-primary p-4 ring-1 ring-white/12">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-white">{l.title}</h3>
                  <ModeTag mode={l.mode} />
                </div>
                {l.mode === "hands-on" && place && <p className="mt-1 text-xs text-white/65">{place}</p>}
                {l.homework && <p className="mt-2 text-sm text-white/80"><span className="font-semibold text-signal-orange">হোমওয়ার্ক:</span> {l.homework}</p>}
                {e && <WeekActions code={course.id} week={l.week} attended={attended} homework={l.homework ? e.homework[l.week] ?? "" : undefined} />}
              </div>
            </li>
          );
        })}
      </ol>
      {e && <p className="mt-3 text-xs text-white/65">ডেমো: আসল ব্যবস্থায় লাইভ ক্লাসে ঢুকলে আর কর্মশালায় শিক্ষক নিলে হাজিরা নিজে থেকে ওঠে।</p>}
    </section>
  );
}

function WeekActions({ code, week, attended, homework }: { code: string; week: number; attended: boolean; homework?: string }) {
  const { num } = useFormat();
  const [draft, setDraft] = useState(homework ?? "");
  const submitted = Boolean(homework?.trim());
  return (
    <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
      {!attended && (
        <button type="button" onClick={() => updateEnrollment(code, (x) => ({ ...x, attended: [...x.attended, week] }))} className={mediaButton({ variant: "quiet", size: "sm" })}>
          হাজিরা দিন
        </button>
      )}
      {homework !== undefined &&
        (submitted ? (
          <p className="text-sm text-bdgreen-500"><Check className="mr-1 inline size-4" aria-hidden />হোমওয়ার্ক জমা হয়েছে</p>
        ) : (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              if (draft.trim().length < 5) {
                toast.error("হোমওয়ার্কে কী করলেন, অন্তত এক লাইন লিখুন");
                return;
              }
              updateEnrollment(code, (x) => ({ ...x, homework: { ...x.homework, [week]: draft.trim() } }));
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label className="sr-only" htmlFor={`hw-${code}-${week}`}>সপ্তাহ {num(week)}-এর হোমওয়ার্ক</label>
            <Input id={`hw-${code}-${week}`} value={draft} maxLength={500} onChange={(ev) => setDraft(ev.target.value)} placeholder="কী করলেন, বা লিংক দিন" />
            <button type="submit" className={mediaButton({ variant: "primary", size: "md" })}>জমা দিন</button>
          </form>
        ))}
    </div>
  );
}

function Final({ course, e, fastTrack }: { course: Course; e: Enrollment; fastTrack: boolean }) {
  const ready = progressOf(course, e).eligible || (fastTrack && Boolean(e.project));
  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: { title: "", link: "", summary: "" } });
  const [slots] = useState(() => interviewSlots(new Date()));
  const [slot, setSlot] = useState<string>();

  return (
    <section aria-labelledby="final" className="rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
      <h2 id="final" className="text-lg font-bold text-white">ফাইনাল প্রজেক্ট ও প্যানেল ইন্টারভিউ</h2>
      <p className="mt-1 text-sm leading-relaxed text-white/80">{course.final}</p>

      {!e.project ? (
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit((v) => {
              updateEnrollment(course.id, (x) => ({ ...x, project: { ...v, at: new Date().toISOString() } }));
              toast.success("প্রজেক্ট জমা হয়েছে", { description: "ইন্টারভিউয়ে প্যানেল এটা নিয়েই প্রশ্ন করবে।" });
            })}
            className="mt-5 space-y-4"
          >
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>প্রজেক্টের নাম</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem><FormLabel>লিংক — ভিডিও, ছবি বা কোড</FormLabel><FormControl><Input type="url" placeholder="https://…" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem><FormLabel>কী বানালেন, কীভাবে, কত খরচে</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <button type="submit" className={mediaButton({ variant: "primary" })}>প্রজেক্ট জমা দিন</button>
          </form>
        </Form>
      ) : (
        <div className="mt-4 rounded-xl bg-black/40 p-4">
          <p className="font-semibold text-white">{e.project.title}</p>
          <a href={e.project.link} target="_blank" rel="noopener noreferrer nofollow" className="text-sm break-all text-signal-orange hover:underline">{e.project.link}</a>
        </div>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        {e.interview ? (
          <p className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
            <CalendarCheck className="mt-0.5 size-5 shrink-0 text-signal-orange" aria-hidden />
            <span>
              ইন্টারভিউ: <strong className="text-white"><DateText iso={e.interview} time weekday /></strong>। প্যানেলে থাকবেন আপনার শিক্ষক আর একজন বহিরাগত পেশাদার; দুজন আলাদা নম্বর দেবেন। পাস করলে নাম ওঠে <Link href="/media/academy/exam#board" className="font-semibold text-signal-orange hover:underline">প্রকাশ্য বোর্ডে</Link>।
            </span>
          </p>
        ) : ready ? (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-white">ইন্টারভিউয়ের সময় বেছে নিন (শুক্রবার বাদে)</legend>
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <label key={s} className={choiceClass(slot === s)}>
                  <input type="radio" name="slot" className="sr-only" checked={slot === s} onChange={() => setSlot(s)} />
                  <DateText iso={s} time weekday />
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={!slot}
              onClick={() => {
                updateEnrollment(course.id, (x) => ({ ...x, interview: slot }));
                toast.success("ইন্টারভিউ বুক হয়েছে");
              }}
              className={mediaButton({ variant: "primary", className: "mt-4" })}
            >
              সময় নিশ্চিত করুন
            </button>
          </fieldset>
        ) : (
          <p className="flex items-start gap-3 text-sm text-white/80">
            <Lock className="mt-0.5 size-4 shrink-0 text-white/65" aria-hidden />
            ইন্টারভিউ খুলবে হাজিরা ≥ <Num value={pct(MIN_ATTENDANCE)} />%, হোমওয়ার্ক ≥ <Num value={pct(MIN_HOMEWORK)} />% আর প্রজেক্ট জমা হলে।
          </p>
        )}
      </div>
    </section>
  );
}
