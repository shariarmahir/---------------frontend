"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, CalendarCheck, Check, ChevronDown, DoorOpen, Lock, ShoppingCart, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDepartment } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { CLASS_MINUTES, FINAL_DAYS, MIN_ATTENDANCE, MIN_HOMEWORK, MODES, courseTimeline, interviewSlots, progressOf, type Course, type Enrollment } from "@/lib/media/academy";
import { projectSchema, type ProjectInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num, useFormat } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { addToCart, useCart } from "./cart";
import { blockBtn, primaryBtn, secondaryBtn } from "./catalogue/buttons";
import { choiceClass, fieldClass, labelClass, messageClass } from "./catalogue/fields";
import { defaultBatch, joinable, useCourseBatches } from "./classroom/use-batches";
import { updateAcademy, useAcademy } from "./use-academy";

const pct = (n: number) => Math.round(n * 100);

function updateEnrollment(code: string, fn: (e: Enrollment) => Enrollment) {
  updateAcademy((a) => (a.enrolled[code] ? { ...a, enrolled: { ...a.enrolled, [code]: fn(a.enrolled[code]) } } : a));
}

/*
 * The learner's side of a course, in pieces the course page places: the
 * enrol button in the opening, the progress and the weeks in the
 * curriculum, the final project after them. The order: the checkout (which
 * joins the department too) with the fee into escrow, then week by week
 * attendance and homework, the project and a panel slot.
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

/** The opening's big two-line button: what to do next, and when the batch starts; beside it, the cart. */
export function EnrollCta({ course }: { course: Course }) {
  const { hydrated, enrollment } = useCourseState(course);
  const ensure = useRequireAccount();
  const router = useRouter();
  const inCart = useCart().includes(course.id);
  const batches = useCourseBatches(course.id);
  const open = batches.filter((b) => joinable(b));
  const next = defaultBatch(batches);
  const big = cn(primaryBtn, "h-auto min-h-14 flex-col gap-0.5 px-8 py-2 leading-tight");
  const second = "hud font-medium opacity-75";

  if (!hydrated) return <span aria-hidden className="block h-14 w-64 animate-pulse bg-(--c-bg-sunken)" />;

  if (enrollment)
    return (
      <Link href={`/media/academy/classroom/${encodeURIComponent(enrollment.batch ?? course.id)}`} className={big}>
        <span className="inline-flex items-center gap-2 text-base">
          <DoorOpen className="size-5" aria-hidden /> ক্লাসরুমে ঢুকুন
        </span>
        <span className={second}>
          ভর্তি <DateText iso={enrollment.at} />
        </span>
      </Link>
    );

  if (!next) return <p className="max-w-sm border border-(--c-line) px-4 py-3 text-sm leading-relaxed text-(--c-muted)">সব ব্যাচের আসন পূর্ণ। একাডেমি নতুন ব্যাচ খুললে এখানেই ভর্তি খুলবে।</p>;

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
        className={big}
      >
        <span className="inline-flex items-center gap-2 text-base">
          <Ticket className="size-4.5" aria-hidden />
          {course.fee === 0 ? "বিনা ফিতে ভর্তি হোন" : "কোর্সে ভর্তি হোন"}
        </span>
        <span className={second}>
          {open.length > 1 ? (
            <>
              <Num value={open.length} />
              টি ব্যাচ · পরেরটা শুরু <DateText iso={next.starts} />
            </>
          ) : (
            <>
              ব্যাচ শুরু <DateText iso={next.starts} />
            </>
          )}
        </span>
      </button>
      {inCart ? (
        <Link href="/media/academy/checkout" className={cn(secondaryBtn, "h-14")}>
          <ShoppingCart className="size-4" aria-hidden /> কার্টে আছে — চেকআউট
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!ensure("কার্টে রাখতে")) return;
            addToCart(course.id);
            toast.success("কার্টে রাখা হলো", { description: "উপরের কার্ট থেকে যখন খুশি ভর্তি সম্পন্ন করুন।" });
          }}
          className={cn(secondaryBtn, "h-14")}
        >
          <ShoppingCart className="size-4" aria-hidden /> কার্টে রাখুন
        </button>
      )}
    </div>
  );
}

/** The progress, once enrolled; nothing before. */
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

/** A ruled meter: the share done, a tick at the goal, green once past it. */
function Meter({ label, value, goal, need }: { label: string; value: number; goal: number; need: string | null }) {
  const done = value >= goal;
  return (
    <div className="bg-(--c-bg) p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-2">
        <span className="hud text-(--c-faint)">{label}</span>
        <span className="hud text-(--c-faint)">
          লক্ষ্য <Num value={pct(goal)} />%
        </span>
      </div>
      <p className={cn("display mt-3 text-4xl leading-none", done ? "text-(--c-good)" : "text-(--c-ink-strong)")}>
        <Num value={pct(value)} />%
      </p>
      <div className="relative mt-4 h-1.5 bg-(--c-line)" role="presentation">
        <span className={cn("absolute inset-y-0 left-0 transition-[width] duration-500", done ? "bg-(--c-good)" : "bg-(--c-signal)")} style={{ width: `${Math.min(100, pct(value))}%` }} />
        <span className="absolute -inset-y-1 w-px bg-(--c-ink-strong)" style={{ left: `${pct(goal)}%` }} />
      </div>
      {need && <p className="mt-3 text-sm text-(--c-muted)">{need}</p>}
    </div>
  );
}

function Standing({ course, e, fastTrack }: { course: Course; e: Enrollment; fastTrack: boolean }) {
  const { num } = useFormat();
  const p = progressOf(course, e);
  return (
    <section aria-label="আমার অগ্রগতি" className="border-b border-(--c-line)">
      <div className="grid gap-px bg-(--c-line) md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="bg-(--c-bg) p-6 md:p-8">
          <p className="hud text-(--c-faint)">
            ভর্তি · <DateText iso={e.at} />
          </p>
          <p className="mt-3 leading-relaxed text-(--c-ink)">
            {p.eligible || (fastTrack && e.project)
              ? "ফাইনাল ইন্টারভিউয়ের জন্য প্রস্তুত — নিচে সময় বেছে নিন।"
              : fastTrack
                ? "অভিজ্ঞতার স্বীকৃতি: হাজিরা আর হোমওয়ার্ক মাফ — প্রজেক্ট জমা দিলেই ইন্টারভিউ।"
                : e.project
                  ? "প্রজেক্ট জমা হয়েছে; হাজিরা আর হোমওয়ার্ক পূরণ হলে ইন্টারভিউ খুলবে।"
                  : "হাজিরা, হোমওয়ার্ক আর ফাইনাল প্রজেক্ট — তিনটি হলে প্যানেল ইন্টারভিউ।"}
          </p>
        </div>
        <Meter label="হাজিরা" value={p.attended / course.lessons.length} goal={MIN_ATTENDANCE} need={p.needClasses ? `আরও ${num(p.needClasses)}টি ক্লাস` : null} />
        <Meter label="হোমওয়ার্ক" value={p.homeworkSet ? p.homeworkDone / p.homeworkSet : 1} goal={MIN_HOMEWORK} need={p.needHomework ? `আরও ${num(p.needHomework)}টি হোমওয়ার্ক` : null} />
      </div>
    </section>
  );
}

const summary = "flex cursor-pointer list-none items-center gap-5 px-6 py-5 transition-colors duration-150 hover:bg-(--c-bg-raised) md:px-10 [&::-webkit-details-marker]:hidden";
const chevron = <ChevronDown className="size-5 shrink-0 text-(--c-muted) transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" aria-hidden />;
const body = "space-y-3 border-t border-(--c-line) px-6 pt-5 pb-6 md:pr-10 md:pl-[6.75rem]";

/**
 * The weeks as a ruled list: a numbered square, the title, the dates and how
 * it is taught; each opens to who teaches it, where, the homework, and —
 * once enrolled — attendance and handing the homework in. The project and
 * panel days close it.
 */
export function CourseWeeks({ course }: { course: Course }) {
  const { hydrated, enrollment: e } = useCourseState(course);
  const place = getDepartment(course.dept)?.place;
  const timeline = courseTimeline(course.starts);

  return (
    <div>
      <ol className="border-t border-(--c-line)">
        {course.lessons.map((l) => {
          const attended = hydrated && (e?.attended.includes(l.week) ?? false);
          const span = timeline.weeks[l.week - 1];
          return (
            <li key={l.week} className="border-b border-(--c-line)">
              <details className="group">
                <summary className={summary}>
                  <span className={cn("display grid size-12 shrink-0 place-items-center text-lg", attended ? "bg-(--c-good) text-black" : "bg-(--c-invert-bg) text-(--c-invert-fg)")}>
                    {attended ? <Check className="size-5" strokeWidth={3} aria-label="উপস্থিত" /> : <Num value={l.week} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-lg leading-snug text-(--c-ink-strong)">{l.title}</span>
                    <span className="hud mt-1 flex flex-wrap gap-x-2 text-(--c-faint)">
                      <span>
                        সপ্তাহ <Num value={l.week} />
                      </span>
                      {span && (
                        <span>
                          · <DateText iso={span.from} /> – <DateText iso={span.to} />
                        </span>
                      )}
                      <span className={l.mode === "hands-on" ? "text-(--c-signal)" : "text-(--c-accent-ink)"}>· {MODES[l.mode]}</span>
                    </span>
                  </span>
                  <span className="hud hidden text-(--c-muted) sm:inline">বিস্তারিত</span>
                  {chevron}
                </summary>
                <div className={body}>
                  {l.by && (
                    <p className="flex items-center gap-2 text-sm text-(--c-ink)">
                      <PersonAvatar person={personOrThrow(l.by)} size="xs" /> পড়াবেন {personOrThrow(l.by).nameBn}
                    </p>
                  )}
                  <p className="text-sm text-(--c-muted)">
                    {l.mode === "hands-on" && place ? (
                      place
                    ) : (
                      <>
                        অনলাইনে, <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস · রেকর্ডিং থাকে
                      </>
                    )}
                  </p>
                  {l.homework && (
                    <p className="text-sm leading-relaxed text-(--c-ink)">
                      <span className="font-semibold text-(--c-accent-ink)">হোমওয়ার্ক:</span> {l.homework}
                    </p>
                  )}
                  {hydrated && e && <WeekActions code={course.id} week={l.week} attended={attended} homework={l.homework ? (e.homework[l.week] ?? "") : undefined} />}
                </div>
              </details>
            </li>
          );
        })}
        <li className="border-b border-(--c-line)">
          <details className="group">
            <summary className={summary}>
              <span className="grid size-12 shrink-0 place-items-center bg-(--c-signal) text-black">
                <Award className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="display block text-lg leading-snug text-(--c-ink-strong)">ফাইনাল প্রজেক্ট ও প্যানেল ইন্টারভিউ</span>
                <span className="hud mt-1 block text-(--c-faint)">
                  শেষ <Num value={FINAL_DAYS} /> দিন · <DateText iso={timeline.final.from} /> – <DateText iso={timeline.final.to} />
                </span>
              </span>
              <span className="hud hidden text-(--c-muted) sm:inline">বিস্তারিত</span>
              {chevron}
            </summary>
            <div className={body}>
              <p className="text-sm leading-relaxed text-(--c-ink)">{course.final}</p>
              <p className="text-sm text-(--c-muted)">প্যানেলে থাকেন আপনার শিক্ষক আর একজন বহিরাগত পেশাদার; দুজন আলাদা নম্বর দেন।</p>
            </div>
          </details>
        </li>
      </ol>
      {hydrated && e && <p className="hud px-6 py-4 text-(--c-faint) md:px-10">ডেমো: আসল ব্যবস্থায় লাইভ ক্লাসে ঢুকলে আর কর্মশালায় শিক্ষক নিলে হাজিরা নিজে থেকে ওঠে।</p>}
    </div>
  );
}

function WeekActions({ code, week, attended, homework }: { code: string; week: number; attended: boolean; homework?: string }) {
  const { num } = useFormat();
  const [draft, setDraft] = useState(homework ?? "");
  const submitted = Boolean(homework?.trim());
  return (
    <div className="space-y-3 border-t border-(--c-line) pt-4">
      {!attended && (
        <button type="button" onClick={() => updateEnrollment(code, (x) => ({ ...x, attended: [...x.attended, week] }))} className={blockBtn}>
          <Check className="size-4" aria-hidden />
          হাজিরা দিন
        </button>
      )}
      {homework !== undefined &&
        (submitted ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-(--c-good)">
            <Check className="size-4" aria-hidden />
            হোমওয়ার্ক জমা হয়েছে
          </p>
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
            <label className="sr-only" htmlFor={`hw-${code}-${week}`}>
              সপ্তাহ {num(week)}-এর হোমওয়ার্ক
            </label>
            <Input id={`hw-${code}-${week}`} value={draft} maxLength={500} onChange={(ev) => setDraft(ev.target.value)} placeholder="কী করলেন, বা লিংক দিন" className={fieldClass} />
            <button type="submit" className={cn(primaryBtn, "h-11 shrink-0")}>
              জমা দিন
            </button>
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
    <section aria-labelledby="final" className="grid gap-px border-t border-(--c-line) bg-(--c-line) lg:grid-cols-2">
      <div className="bg-(--c-bg) p-6 md:p-10">
        <p className="hud text-(--c-faint)">ফাইনাল প্রজেক্ট</p>
        <h3 id="final" className="display mt-3 text-2xl text-(--c-ink-strong)">
          নিজের হাতে, প্যানেলের <span className="turn">সামনে</span>।
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--c-muted)">{course.final}</p>

        {!e.project ? (
          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit((v) => {
                updateEnrollment(course.id, (x) => ({ ...x, project: { ...v, at: new Date().toISOString() } }));
                toast.success("প্রজেক্ট জমা হয়েছে", { description: "ইন্টারভিউয়ে প্যানেল এটা নিয়েই প্রশ্ন করবে।" });
              })}
              className="mt-6 space-y-5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>প্রজেক্টের নাম</FormLabel>
                    <FormControl>
                      <Input className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>লিংক — ভিডিও, ছবি বা কোড</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://…" className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>কী বানালেন, কীভাবে, কত খরচে</FormLabel>
                    <FormControl>
                      <Textarea rows={4} className={fieldClass} {...field} />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
              <button type="submit" className={primaryBtn}>
                প্রজেক্ট জমা দিন
              </button>
            </form>
          </Form>
        ) : (
          <div className="mt-6 border border-(--c-line) p-4">
            <p className="font-semibold text-(--c-ink-strong)">{e.project.title}</p>
            <a href={e.project.link} target="_blank" rel="noopener noreferrer nofollow" className="text-sm break-all text-(--c-accent-ink) hover:underline">
              {e.project.link}
            </a>
          </div>
        )}
      </div>

      <div className="bg-(--c-bg) p-6 md:p-10">
        <p className="hud text-(--c-faint)">প্যানেল ইন্টারভিউ</p>
        {e.interview ? (
          <p className="mt-4 flex items-start gap-3 leading-relaxed text-(--c-ink)">
            <CalendarCheck className="mt-0.5 size-5 shrink-0 text-(--c-good)" aria-hidden />
            <span>
              ইন্টারভিউ:{" "}
              <strong className="text-(--c-ink-strong)">
                <DateText iso={e.interview} time weekday />
              </strong>
              । প্যানেলে থাকবেন আপনার শিক্ষক আর একজন বহিরাগত পেশাদার; দুজন আলাদা নম্বর দেবেন। পাস করলে নাম ওঠে{" "}
              <Link href="/media/academy/exam#board" className="font-semibold text-(--c-accent-ink) hover:underline">
                প্রকাশ্য বোর্ডে
              </Link>
              ।
            </span>
          </p>
        ) : ready ? (
          <fieldset className="mt-4">
            <legend className={cn(labelClass, "mb-3")}>ইন্টারভিউয়ের সময় বেছে নিন (শুক্রবার বাদে)</legend>
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
              className={cn(primaryBtn, "mt-5")}
            >
              সময় নিশ্চিত করুন
            </button>
          </fieldset>
        ) : (
          <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-(--c-muted)">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            ইন্টারভিউ খুলবে হাজিরা ≥ <Num value={pct(MIN_ATTENDANCE)} />
            %, হোমওয়ার্ক ≥ <Num value={pct(MIN_HOMEWORK)} />% আর প্রজেক্ট জমা হলে।
          </p>
        )}
      </div>
    </section>
  );
}
