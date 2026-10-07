"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, CalendarCheck, Check, ChevronDown, DoorOpen, Lock, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDepartment } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { CLASS_MINUTES, MIN_ATTENDANCE, MIN_HOMEWORK, courseTimeline, interviewSlots, progressOf, type Course, type Enrollment } from "@/lib/media/academy";
import { projectSchema, type ProjectInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { DateText, Num, useFormat } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { addToCart, useCart } from "./cart";
import { defaultBatch, joinable, useCourseBatches } from "./classroom/use-batches";
import { ModeTag } from "./parts";
import { updateAcademy, useAcademy } from "./use-academy";

const pct = (n: number) => Math.round(n * 100);

function updateEnrollment(code: string, fn: (e: Enrollment) => Enrollment) {
  updateAcademy((a) => (a.enrolled[code] ? { ...a, enrolled: { ...a.enrolled, [code]: fn(a.enrolled[code]) } } : a));
}

/*
 * The learner's side of a course, in pieces the course page places where a
 * course site would: the enrol button in the hero, the progress card and the
 * weeks in the curriculum, the final project after them. The order: the
 * checkout (which joins the department too) with the fee into escrow, then
 * week by week attendance and homework, the project and a panel slot.
 */

/** Where the viewer stands with this course. */
export function useCourseState(course: Course) {
  const hydrated = useHydrated();
  const admitted = useAcademy((a) => Boolean(a.admissions[course.dept]));
  const enrollment = useAcademy((a) => a.enrolled[course.id]);
  // Recognised prior learning: attendance and homework are waived in the department they were placed in.
  const fastTrack = useAcademy((a) => Boolean(a.admissions[course.dept]?.fastTrack));
  return { hydrated, admitted, enrollment, fastTrack };
}

/** The hero's big two-line button: what to do next, and when the batch starts. */
export function EnrollCta({ course }: { course: Course }) {
  const { hydrated, enrollment } = useCourseState(course);
  const ensure = useRequireAccount();
  const router = useRouter();
  const inCart = useCart().includes(course.id);
  const batches = useCourseBatches(course.id);
  const next = defaultBatch(batches);
  const full = !next;
  const big = "inline-flex min-h-14 flex-col items-center justify-center rounded-xl px-8 py-2 text-center leading-tight";
  const second = "mt-0.5 text-xs font-semibold opacity-80";

  if (!hydrated) return <Skeleton className="h-14 w-64 rounded-xl bg-m-ink/8" />;

  if (enrollment)
    return (
      <Link href={`/media/academy/classroom/${encodeURIComponent(enrollment.batch ?? course.id)}`} className={mediaButton({ className: big })}>
        <span className="inline-flex items-center gap-2 text-base">
          <DoorOpen className="size-5" aria-hidden /> ক্লাসরুমে ঢুকুন
        </span>
        <span className={second}>
          ভর্তি <DateText iso={enrollment.at} />
        </span>
      </Link>
    );

  if (full) return <p className="max-w-sm rounded-xl bg-m-amber-soft px-4 py-3 text-sm text-m-ink/85">সব ব্যাচের আসন পূর্ণ। একাডেমি নতুন ব্যাচ খুললে এখানেই ভর্তি খুলবে।</p>;

  // Joining — free or paid, new department or not — goes through the cart and the one checkout form.
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => {
          if (!ensure("কোর্সে ভর্তি হতে")) return;
          addToCart(course.id);
          router.push(`/media/academy/checkout?course=${encodeURIComponent(course.id)}`);
        }}
        className={mediaButton({ className: big })}
      >
        <span className="text-base">{course.fee === 0 ? "বিনা ফিতে ভর্তি হোন" : "কোর্সে ভর্তি হোন"}</span>
        <span className={second}>
          {batches.filter((b) => joinable(b)).length > 1 ? (
            <>
              <Num value={batches.filter((b) => joinable(b)).length} />টি ব্যাচ · পরেরটা শুরু <DateText iso={next.starts} />
            </>
          ) : (
            <>
              ব্যাচ শুরু <DateText iso={next.starts} />
            </>
          )}
        </span>
      </button>
      {inCart ? (
        <Link href="/media/academy/checkout" className={mediaButton({ variant: "outline", size: "lg", className: "h-14" })}>
          <ShoppingCart aria-hidden /> কার্টে আছে — চেকআউট
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!ensure("কার্টে রাখতে")) return;
            addToCart(course.id);
            toast.success("কার্টে রাখা হলো", { description: "উপরের কার্ট থেকে যখন খুশি ভর্তি সম্পন্ন করুন।" });
          }}
          className={mediaButton({ variant: "outline", size: "lg", className: "h-14" })}
        >
          <ShoppingCart aria-hidden /> কার্টে রাখুন
        </button>
      )}
    </div>
  );
}

/** The progress card, once enrolled; nothing before. */
export function CourseProgress({ course }: { course: Course }) {
  const { hydrated, enrollment, fastTrack } = useCourseState(course);
  if (!hydrated || !enrollment) return null;
  return <Standing course={course} e={enrollment} fastTrack={fastTrack} />;
}

/** The final project and the interview slot, once enrolled. */
export function CourseFinal({ course }: { course: Course }) {
  const { hydrated, enrollment, fastTrack } = useCourseState(course);
  if (!hydrated || !enrollment) return null;
  return <Final course={course} e={enrollment} fastTrack={fastTrack} />;
}

function Meter({ label, value, goal, need }: { label: string; value: number; goal: number; need: string | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-m-ink">{label}</span>
        <span className="tabular-nums text-m-ink/80"><Num value={pct(value)} />% <span className="text-m-ink/65">/ লক্ষ্য <Num value={pct(goal)} />%</span></span>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-m-ink/6" role="presentation">
        <span className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500", value >= goal ? "bg-m-green-soft" : "bg-m-yellow")} style={{ width: `${Math.min(100, pct(value))}%` }} />
        <span className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pct(goal)}%` }} />
      </div>
      {need && <p className="mt-1.5 text-xs text-m-ink/70">{need}</p>}
    </div>
  );
}

function Standing({ course, e, fastTrack }: { course: Course; e: Enrollment; fastTrack: boolean }) {
  const { num } = useFormat();
  const p = progressOf(course, e);
  return (
    <section aria-label="আমার অগ্রগতি" className="space-y-4 rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
      <p className="text-sm font-semibold text-m-blue">ভর্তি · <DateText iso={e.at} /></p>
      <Meter label="হাজিরা" value={p.attended / course.lessons.length} goal={MIN_ATTENDANCE} need={p.needClasses ? `আরও ${num(p.needClasses)}টি ক্লাস` : null} />
      <Meter label="হোমওয়ার্ক" value={p.homeworkSet ? p.homeworkDone / p.homeworkSet : 1} goal={MIN_HOMEWORK} need={p.needHomework ? `আরও ${num(p.needHomework)}টি হোমওয়ার্ক` : null} />
      <p className="text-sm text-m-ink/85">
        {p.eligible || (fastTrack && e.project) ? "ফাইনাল ইন্টারভিউয়ের জন্য প্রস্তুত — নিচে সময় বেছে নিন।" : fastTrack ? "অভিজ্ঞতার স্বীকৃতি: হাজিরা আর হোমওয়ার্ক মাফ — প্রজেক্ট জমা দিলেই ইন্টারভিউ।" : e.project ? "প্রজেক্ট জমা হয়েছে; হাজিরা আর হোমওয়ার্ক পূরণ হলে ইন্টারভিউ খুলবে।" : "হাজিরা, হোমওয়ার্ক আর ফাইনাল প্রজেক্ট — তিনটি হলে প্যানেল ইন্টারভিউ।"}
      </p>
    </section>
  );
}

/**
 * The weeks as a course site lists the courses of a series: one bordered
 * row each — a numbered tile, the title, dates and kind — that opens to its
 * details (who teaches it, where, the homework, and, once enrolled, the
 * attendance and homework actions). The project and panel days close it.
 */
export function CourseWeeks({ course }: { course: Course }) {
  const { hydrated, enrollment: e } = useCourseState(course);
  const place = getDepartment(course.dept)?.place;
  const timeline = courseTimeline(course.starts);
  const row = "group rounded-2xl bg-white ring-1 ring-m-ink/12 transition-shadow duration-200 open:shadow-m-tile open:ring-m-blue/35";
  const summary = "flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden";
  const chevron = <ChevronDown className="size-5 shrink-0 text-m-blue transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />;

  return (
    <div>
      <ol className="space-y-3">
        {course.lessons.map((l) => {
          const attended = hydrated && (e?.attended.includes(l.week) ?? false);
          const span = timeline.weeks[l.week - 1];
          return (
            <li key={l.week}>
              <details className={row}>
                <summary className={summary}>
                  <span className={cn("grid size-14 shrink-0 place-items-center rounded-xl text-lg font-bold shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]", attended ? "bg-m-green text-m-on" : "bg-m-blue text-m-on")}>
                    {attended ? <Check className="size-6" strokeWidth={3} aria-label="উপস্থিত" /> : <Num value={l.week} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-m-blue underline-offset-2 group-hover:underline">{l.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-m-ink/65">
                      <span>
                        সপ্তাহ <Num value={l.week} />
                      </span>
                      {span && (
                        <span>
                          · <DateText iso={span.from} /> – <DateText iso={span.to} />
                        </span>
                      )}
                      <span>·</span>
                      <ModeTag mode={l.mode} />
                    </span>
                  </span>
                  <span className="hidden text-sm font-semibold text-m-blue sm:inline">বিস্তারিত</span>
                  {chevron}
                </summary>
                <div className="space-y-2 border-t border-m-ink/8 px-4 pt-4 pb-5 sm:px-5 sm:pl-23">
                  {l.by && (
                    <p className="flex items-center gap-1.5 text-sm text-m-ink/80">
                      <PersonAvatar person={personOrThrow(l.by)} size="xs" /> পড়াবেন {personOrThrow(l.by).nameBn}
                    </p>
                  )}
                  <p className="text-sm text-m-ink/75">
                    {l.mode === "hands-on" && place ? place : <>অনলাইনে, <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস · রেকর্ডিং থাকে</>}
                  </p>
                  {l.homework && (
                    <p className="text-sm text-m-ink/85">
                      <span className="font-semibold text-m-blue">হোমওয়ার্ক:</span> {l.homework}
                    </p>
                  )}
                  {hydrated && e && <WeekActions code={course.id} week={l.week} attended={attended} homework={l.homework ? e.homework[l.week] ?? "" : undefined} />}
                </div>
              </details>
            </li>
          );
        })}
        <li>
          <details className={row}>
            <summary className={summary}>
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-m-yellow text-m-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]">
                <Award className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-m-blue underline-offset-2 group-hover:underline">ফাইনাল প্রজেক্ট ও প্যানেল ইন্টারভিউ</span>
                <span className="mt-1 block text-xs text-m-ink/65">
                  শেষ <Num value={5} /> দিন · <DateText iso={timeline.final.from} /> – <DateText iso={timeline.final.to} />
                </span>
              </span>
              <span className="hidden text-sm font-semibold text-m-blue sm:inline">বিস্তারিত</span>
              {chevron}
            </summary>
            <div className="border-t border-m-ink/8 px-4 pt-4 pb-5 sm:px-5 sm:pl-23">
              <p className="text-sm leading-relaxed text-m-ink/85">{course.final}</p>
              <p className="mt-2 text-sm text-m-ink/70">প্যানেলে থাকেন আপনার শিক্ষক আর একজন বহিরাগত পেশাদার; দুজন আলাদা নম্বর দেন।</p>
            </div>
          </details>
        </li>
      </ol>
      {hydrated && e && <p className="mt-3 text-xs text-m-ink/65">ডেমো: আসল ব্যবস্থায় লাইভ ক্লাসে ঢুকলে আর কর্মশালায় শিক্ষক নিলে হাজিরা নিজে থেকে ওঠে।</p>}
    </div>
  );
}

function WeekActions({ code, week, attended, homework }: { code: string; week: number; attended: boolean; homework?: string }) {
  const { num } = useFormat();
  const [draft, setDraft] = useState(homework ?? "");
  const submitted = Boolean(homework?.trim());
  return (
    <div className="mt-3 space-y-3 border-t border-m-ink/9 pt-3">
      {!attended && (
        <button type="button" onClick={() => updateEnrollment(code, (x) => ({ ...x, attended: [...x.attended, week] }))} className={mediaButton({ variant: "quiet", size: "sm" })}>
          হাজিরা দিন
        </button>
      )}
      {homework !== undefined &&
        (submitted ? (
          <p className="text-sm text-m-green"><Check className="mr-1 inline size-4" aria-hidden />হোমওয়ার্ক জমা হয়েছে</p>
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
    <section aria-labelledby="final" className="rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 sm:p-6 shadow-m-tile">
      <h2 id="final" className="text-lg font-bold text-m-ink">ফাইনাল প্রজেক্ট ও প্যানেল ইন্টারভিউ</h2>
      <p className="mt-1 text-sm leading-relaxed text-m-ink/80">{course.final}</p>

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
        <div className="mt-4 rounded-xl bg-white/65 p-4">
          <p className="font-semibold text-m-ink">{e.project.title}</p>
          <a href={e.project.link} target="_blank" rel="noopener noreferrer nofollow" className="text-sm break-all text-m-blue hover:underline">{e.project.link}</a>
        </div>
      )}

      <div className="mt-6 border-t border-m-ink/9 pt-5">
        {e.interview ? (
          <p className="flex items-start gap-3 text-sm leading-relaxed text-m-ink/85">
            <CalendarCheck className="mt-0.5 size-5 shrink-0 text-m-blue" aria-hidden />
            <span>
              ইন্টারভিউ: <strong className="text-m-ink"><DateText iso={e.interview} time weekday /></strong>। প্যানেলে থাকবেন আপনার শিক্ষক আর একজন বহিরাগত পেশাদার; দুজন আলাদা নম্বর দেবেন। পাস করলে নাম ওঠে <Link href="/media/academy/exam#board" className="font-semibold text-m-blue hover:underline">প্রকাশ্য বোর্ডে</Link>।
            </span>
          </p>
        ) : ready ? (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-m-ink">ইন্টারভিউয়ের সময় বেছে নিন (শুক্রবার বাদে)</legend>
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
          <p className="flex items-start gap-3 text-sm text-m-ink/80">
            <Lock className="mt-0.5 size-4 shrink-0 text-m-ink/65" aria-hidden />
            ইন্টারভিউ খুলবে হাজিরা ≥ <Num value={pct(MIN_ATTENDANCE)} />%, হোমওয়ার্ক ≥ <Num value={pct(MIN_HOMEWORK)} />% আর প্রজেক্ট জমা হলে।
          </p>
        )}
      </div>
    </section>
  );
}
