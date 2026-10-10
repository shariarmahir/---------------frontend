"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarRange, Check, FileText, FileVideo, Upload } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courses, coursesOf, departments, workshops } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import {
  BATCH_MAX,
  CLASS_MINUTES,
  CLASS_WEEKS,
  COURSE_DAYS,
  DEPT_COURSES,
  LEVELS,
  MODES,
  PROMO_SECONDS,
  courseTimeline,
  draftCode,
  materialKindOf,
  promoFits,
  sizeParts,
  type Course,
  type Department,
  type Level,
  type Material,
  type Mode,
} from "@/lib/media/academy";
import { NOTE_FILE_MAX } from "@/lib/media/classroom";
import { bnDigits } from "@/lib/media/format";
import { computeFees } from "@/lib/media/fees";
import { courseSchemaFor, type CourseInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { toNumber } from "../../ui/field-styles";
import { DateText, Num, Taka, useFormat } from "../../ui/numerals";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CourseCard } from "../catalogue/course-card";
import { choiceClass, fieldClass } from "../catalogue/fields";
import { CatalogueRuler } from "../catalogue/ruler";
import { modesOf } from "../parts";
import { updateAcademy } from "../use-academy";
import { useTeacher } from "./use-teacher";

/** Covers a teacher can pick from: the platform's own pictures, never a stranger's. */
const COVERS = [...new Set([...courses.map((c) => c.image), ...workshops.map((w) => w.image)])];

const lesson = (mode: Mode = "live", by = "") => ({ title: "", mode, homework: "", by });
const NO_PAPER = { kind: "pdf" as const, title: "", size: "" };

/** The next Saturday after today: batches start at the head of the academy week. */
function nextSaturday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** A video's length in seconds, read from the file itself; nothing is uploaded anywhere. */
function videoSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(v.duration));
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    v.src = url;
  });
}

/**
 * Building a course by the academy rules: five weeks of topics so it ends in
 * 40 days, 40-minute online classes, a batch no bigger than the academy may
 * take, a member for every topic in a team academy, and the three papers —
 * syllabus, working calendar and a 2.5-minute promo. A live preview beside it.
 */
export function CourseBuilder() {
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      <Builder />
      <CatalogueFooter />
    </CatalogueRoot>
  );
}

/** A plain select outside the shared form pieces, in the catalogue's dress. */
const plainSelect = cn(fieldClass, "border-(--c-line-strong) bg-(--c-bg-sunken) text-(--c-ink-strong) focus-visible:border-(--c-signal)");
const cell = "space-y-6 bg-(--c-bg) p-6 md:p-10";
const cellTitle = "display text-2xl text-(--c-ink-strong)";

function Builder() {
  const router = useRouter();
  const hydrated = useHydrated();
  const t = useTeacher();
  const deptOf = (id: string): Department | undefined => t.depts.find((d) => d.id === id);
  const first = t.depts[0];
  const form = useForm<CourseInput>({
    // The rules depend on the academy: its batch size and its members.
    resolver: ((values, ctx, opts) => zodResolver(courseSchemaFor(deptOf(values.dept) ?? { kind: "solo", teachers: [t.handle] }))(values, ctx, opts)) as Resolver<CourseInput>,
    defaultValues: {
      title: "",
      dept: first?.id ?? "",
      level: "foundation",
      fee: 2000,
      seats: first ? BATCH_MAX[first.kind] : 5,
      image: COVERS[0],
      outcome: "",
      final: "",
      starts: nextSaturday(),
      lessons: [lesson("video", t.handle), lesson(), lesson(), lesson(), lesson()],
      syllabus: NO_PAPER,
      calendar: { ...NO_PAPER, kind: "sheet" },
      promo: { seconds: 0, file: "" },
    },
  });
  const v = useWatch({ control: form.control });
  const [replaces, setReplaces] = useState("");

  if (!hydrated) {
    return (
      <Band id="intro" n={1} label="নতুন কোর্স" now>
        <span aria-hidden className="block h-96 animate-pulse bg-(--c-bg-sunken)" />
      </Band>
    );
  }
  if (!t.record || !first) {
    return (
      <Band id="intro" n={1} label="নতুন কোর্স" now>
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <h1 className="display max-w-xl text-3xl text-(--c-ink-strong)">আগে প্যানেল ইন্টারভিউ, তারপর কোর্স।</h1>
          <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">কোর্স বানাতে আগে শিক্ষক হিসেবে প্যানেল ইন্টারভিউ পাস করে একটা একাডেমিতে থাকতে হয়।</p>
          <Link href="/media/academy/teach" className={cn(primaryBtn, "mt-8")}>
            আবেদন করুন
          </Link>
        </div>
      </Band>
    );
  }

  const dept = deptOf(v.dept ?? "") ?? first;
  const team = dept.kind === "team";
  const max = BATCH_MAX[dept.kind];
  const live = coursesOf(dept.id);
  const full = live.length >= DEPT_COURSES;
  const topics = [...new Set(live.flatMap((c) => c.lessons.map((l) => l.title)))];
  const timeline = v.starts ? courseTimeline(v.starts) : undefined;

  const taken = [...courses.map((c) => c.id), ...t.drafts.map((c) => c.id)];
  const preview: Course = {
    id: draftCode(dept.id, taken),
    dept: dept.id,
    title: v.title ?? "",
    teacher: t.handle,
    level: (v.level ?? "foundation") as Level,
    weeks: CLASS_WEEKS,
    fee: v.fee ?? 0,
    seats: v.seats || 1,
    enrolled: 0,
    image: v.image || COVERS[0],
    outcome: v.outcome ?? "",
    final: v.final ?? "",
    starts: v.starts ?? "",
    lessons: (v.lessons ?? []).map((l, i) => ({ week: i + 1, title: l?.title ?? "", mode: (l?.mode ?? "live") as Mode, homework: l?.homework || undefined, by: team ? l?.by || undefined : undefined })),
    materials: [],
    syllabus: (v.syllabus as Material) ?? NO_PAPER,
    calendar: (v.calendar as Material) ?? NO_PAPER,
    promo: { seconds: v.promo?.seconds ?? 0, file: v.promo?.file },
  };
  const fees = computeFees(preview.fee);

  function onSubmit(input: CourseInput) {
    if (full && !replaces) {
      toast.error(`এই বিভাগে ${DEPT_COURSES}টি কোর্সই আছে`, { description: "নতুন কোর্সটি কোনটির জায়গা নেবে, বেছে নিন।" });
      return;
    }
    const course: Course = {
      ...preview,
      ...input,
      id: draftCode(input.dept, taken),
      weeks: CLASS_WEEKS,
      lessons: input.lessons.map((l, i) => ({ week: i + 1, title: l.title, mode: l.mode, homework: l.homework || undefined, by: team ? l.by : undefined })),
      syllabus: input.syllabus as Material,
      calendar: input.calendar as Material,
      promo: input.promo,
      replaces: full ? replaces : undefined,
    };
    if (!updateAcademy((a) => ({ ...a, drafts: [course, ...a.drafts] }))) {
      toast.error("ব্রাউজারের জায়গা ভরে গেছে", { description: "সিলেবাস বা ক্যালেন্ডারের ফাইল ছোট করে আবার দিন।" });
      return;
    }
    toast.success(`${course.id} জমা হয়েছে`, { description: "প্যানেল ৭২ ঘণ্টার মধ্যে সিলেবাস, ক্যালেন্ডার আর প্রোমো দেখে অনুমোদন দেবে।" });
    router.push(`/media/academy/classroom/${course.id}`);
  }

  return (
    <>
      <Band id="intro" n={1} label="নতুন কোর্স" now note="প্যানেলের অনুমোদনের জন্য">
        <div className="px-6 py-12 md:px-10 md:py-16">
          <Link href="/media/academy/classroom" data-reveal data-in className="hud group inline-flex items-center gap-1.5 text-(--c-muted) hover:text-(--c-ink-strong)">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" aria-hidden /> সব ক্লাসরুম
          </Link>
          <BandTitle as="h1" now className="mt-6">
            নতুন <Turn>কোর্স</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            প্রতিটা কোর্স শুরুর <Num value={COURSE_DAYS} /> দিনে শেষ — <Num value={CLASS_WEEKS} /> সপ্তাহের ক্লাস, তারপর প্রজেক্ট আর প্যানেল। অনলাইন ক্লাস <Num value={CLASS_MINUTES} /> মিনিটের। সিলেবাস, কাজের ক্যালেন্ডার আর আড়াই মিনিটের প্রোমো ছাড়া
            কোর্স খোলে না।
          </p>
        </div>
      </Band>

      <Band id="build" n={2} label="কোর্সের খসড়া" note={<span className="font-mono">{preview.id}</span>}>
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex min-w-0 flex-col gap-px">
              <section className={cell}>
                <h2 className={cellTitle}>মূল তথ্য</h2>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কোর্সের নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: ইলেকট্রিক গিটার — শুরু থেকে" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dept"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>একাডেমি ও বিভাগ</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const next = deptOf(e.target.value);
                              if (next) form.setValue("seats", Math.min(form.getValues("seats") || BATCH_MAX[next.kind], BATCH_MAX[next.kind]));
                              setReplaces("");
                            }}
                            className={fieldClass}
                          >
                            {t.depts.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.academy.name} · {d.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormDescription>
                          {team ? "দলীয় একাডেমি — প্রতিটা বিষয়ে কে পড়াবেন বেছে দিন" : "একক একাডেমি — সব বিষয় আপনিই পড়াবেন"}, এক ব্যাচে সর্বোচ্চ <Num value={max} /> জন।
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormGroupLabel>স্তর</FormGroupLabel>
                        <FormGroup className="flex flex-wrap gap-2">
                          {(Object.keys(LEVELS) as Level[]).map((l) => (
                            <label key={l} className={choiceClass(field.value === l)}>
                              <input type="radio" className="sr-only" name={field.name} checked={field.value === l} onChange={() => field.onChange(l)} />
                              {LEVELS[l]}
                            </label>
                          ))}
                        </FormGroup>
                      </FormItem>
                    )}
                  />
                </div>
                {full && (
                  <div className="border-l-4 border-(--c-signal) bg-(--c-bg-sunken) p-4">
                    <label htmlFor="replaces" className="text-sm font-semibold text-(--c-ink-strong)">
                      এই বিভাগে <Num value={DEPT_COURSES} />
                      টি কোর্সই আছে — নতুনটি কোনটির জায়গা নেবে?
                    </label>
                    <select id="replaces" value={replaces} onChange={(e) => setReplaces(e.target.value)} className={cn(plainSelect, "mt-3")}>
                      <option value="">বেছে নিন</option>
                      {live.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} · {c.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-(--c-muted)">প্যানেল অনুমোদন দিলে পুরোনোটির চলমান ব্যাচ শেষ হওয়ার পর বদল হবে।</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ফি (৳)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" className="tabular-nums" value={field.value || ""} placeholder="০" onChange={(e) => field.onChange(toNumber(e.target.value))} />
                        </FormControl>
                        <FormDescription>বিনা ফি হলে ০</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>এক ব্যাচে আসন</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" className="tabular-nums" value={field.value || ""} placeholder="০" onChange={(e) => field.onChange(toNumber(e.target.value))} />
                        </FormControl>
                        <FormDescription>
                          সর্বোচ্চ <Num value={max} /> জন
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="starts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ব্যাচ শুরু</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        {timeline && (
                          <FormDescription>
                            শেষ <DateText iso={`${timeline.ends}T00:00:00Z`} /> — <Num value={COURSE_DAYS} />
                            তম দিন
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormGroupLabel>প্রচ্ছদ</FormGroupLabel>
                      <FormGroup className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {COVERS.map((src) => (
                          <label
                            key={src}
                            className={cn(
                              "relative aspect-video cursor-pointer overflow-hidden outline-offset-2 has-focus-visible:outline-2 has-focus-visible:outline-(--c-signal)",
                              field.value === src ? "outline-2 outline-(--c-signal)" : "opacity-70 hover:opacity-100",
                            )}
                          >
                            <input type="radio" className="sr-only" name={field.name} checked={field.value === src} onChange={() => field.onChange(src)} />
                            <Image src={src} alt="" fill sizes="8rem" className="object-cover" />
                            {field.value === src && (
                              <span className="absolute top-1 right-1 grid size-5 place-items-center bg-(--c-signal) text-black">
                                <Check className="size-3.5" strokeWidth={3} aria-label="বাছাই" />
                              </span>
                            )}
                          </label>
                        ))}
                      </FormGroup>
                    </FormItem>
                  )}
                />
              </section>

              <section className={cell}>
                <div>
                  <h2 className={cellTitle}>কোর্সের কাগজ</h2>
                  <p className="mt-1 text-sm text-(--c-muted)">তিনটিই লাগবে — প্যানেল এগুলো দেখেই অনুমোদন দেয়।</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <PaperField name="syllabus" label="সিলেবাস" hint="পিডিএফ বা ওয়ার্ড" accept=".pdf,.doc,.docx" form={form} />
                  <PaperField name="calendar" label="কাজের ক্যালেন্ডার" hint={`${bnDigits(COURSE_DAYS)} দিনের — কোন দিন কোন ক্লাস`} accept=".pdf,.xls,.xlsx,.csv,.doc,.docx" form={form} />
                  <PromoField form={form} />
                </div>
              </section>

              <section className={cell}>
                <h2 className={cellTitle}>শেষে কী হবে</h2>
                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>শিক্ষার্থী শেষে কী পারবে</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="যেমন: মূল কর্ডগুলো বদলে বদলে একটা পুরো গান বাজাতে পারবে।" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="final"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ফাইনাল প্রজেক্ট</FormLabel>
                      <FormControl>
                        <Textarea rows={2} placeholder="প্যানেল ইন্টারভিউ এই কাজ নিয়েই হবে — শেষের পাঁচ দিনে।" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className={cell}>
                <div>
                  <h2 className={cellTitle}>
                    <Num value={CLASS_WEEKS} /> সপ্তাহের বিষয়
                  </h2>
                  <p className="mt-1 text-sm text-(--c-muted)">
                    প্রতি সপ্তাহে একটা বিষয়, অনলাইন ক্লাস <Num value={CLASS_MINUTES} /> মিনিটের। {team ? "দলীয় একাডেমিতে আলাদা বিষয় আলাদা জন পড়ান।" : ""}
                  </p>
                </div>
                <datalist id="topic-options">
                  {topics.map((x) => (
                    <option key={x} value={x} />
                  ))}
                </datalist>
                <ol className="space-y-3">
                  {Array.from({ length: CLASS_WEEKS }, (_, i) => (
                    <li key={i} className={cn("grid gap-2 border border-(--c-line) p-3 sm:items-start", team ? "sm:grid-cols-[4.5rem_minmax(0,1fr)_9rem_9rem]" : "sm:grid-cols-[4.5rem_minmax(0,1fr)_9.5rem]")}>
                      <span className="display flex h-11 flex-col justify-center text-sm text-(--c-accent-ink)">
                        সপ্তাহ <Num value={i + 1} />
                        {timeline && (
                          <span className="text-[11px] font-normal text-(--c-faint)">
                            <DateText iso={`${timeline.weeks[i].from}T00:00:00Z`} />
                          </span>
                        )}
                      </span>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name={`lessons.${i}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">সপ্তাহ {i + 1}-এর বিষয়</FormLabel>
                              <FormControl>
                                <Input list="topic-options" placeholder="এই সপ্তাহের বিষয়" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`lessons.${i}.homework`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">হোমওয়ার্ক</FormLabel>
                              <FormControl>
                                <Input placeholder="হোমওয়ার্ক (ঐচ্ছিক)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`lessons.${i}.mode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">কীভাবে</FormLabel>
                            <FormControl>
                              <select {...field} className={fieldClass}>
                                {(Object.keys(MODES) as Mode[]).map((m) => (
                                  <option key={m} value={m}>
                                    {MODES[m]}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {team && (
                        <FormField
                          control={form.control}
                          name={`lessons.${i}.by`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">কে পড়াবেন</FormLabel>
                              <FormControl>
                                <select {...field} className={fieldClass}>
                                  <option value="">কে পড়াবেন</option>
                                  {dept.teachers.map((h) => (
                                    <option key={h} value={h}>
                                      {personOrThrow(h).nameBn}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </li>
                  ))}
                </ol>
                {form.formState.errors.lessons?.root?.message || form.formState.errors.lessons?.message ? (
                  <p role="alert" className="mt-3 text-sm text-(--c-bad)">
                    {form.formState.errors.lessons?.root?.message ?? form.formState.errors.lessons?.message}
                  </p>
                ) : null}
              </section>

              <div className="bg-(--c-bg) p-6 md:p-10">
                <button type="submit" className={primaryBtn}>
                  প্যানেলে জমা দিন
                </button>
              </div>
            </form>
          </Form>

          <aside className="bg-(--c-bg)">
            <div className="space-y-px lg:sticky lg:top-24">
              <p className="hud border-b border-(--c-line) px-6 py-3 text-(--c-faint)">শিক্ষার্থীরা যেভাবে দেখবে</p>
              <CourseCard entry={{ course: preview, dept, tone: departments.findIndex((d) => d.id === dept.id), modes: modesOf(preview) }} n={1} preview />
              {timeline && (
                <div className="border-t border-(--c-line) p-6 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-(--c-ink-strong)">
                    <CalendarRange className="size-4 text-(--c-accent-ink)" aria-hidden /> <Num value={COURSE_DAYS} /> দিনের সময়রেখা
                  </p>
                  <p className="mt-2 flex justify-between">
                    <span className="text-(--c-muted)">ক্লাস</span>
                    <span className="text-(--c-ink-strong)">
                      <DateText iso={`${timeline.weeks[0].from}T00:00:00Z`} /> – <DateText iso={`${timeline.weeks[CLASS_WEEKS - 1].to}T00:00:00Z`} />
                    </span>
                  </p>
                  <p className="mt-1 flex justify-between">
                    <span className="text-(--c-muted)">প্রজেক্ট ও প্যানেল</span>
                    <span className="text-(--c-ink-strong)">
                      <DateText iso={`${timeline.final.from}T00:00:00Z`} /> – <DateText iso={`${timeline.final.to}T00:00:00Z`} />
                    </span>
                  </p>
                </div>
              )}
              <div className="border-t border-(--c-line) p-6 text-sm">
                {preview.fee > 0 ? (
                  <>
                    <p className="flex justify-between">
                      <span className="text-(--c-muted)">প্রতি শিক্ষার্থী আপনি পান</span>
                      <span className="font-semibold text-(--c-ink-strong)">
                        <Taka amount={fees.sellerReceives} />
                      </span>
                    </p>
                    <p className="mt-1 flex justify-between">
                      <span className="text-(--c-muted)">শিক্ষার্থী দেয়</span>
                      <span className="font-semibold text-(--c-ink-strong)">
                        <Taka amount={fees.buyerPays} />
                      </span>
                    </p>
                    <p className="mt-1 flex justify-between">
                      <span className="text-(--c-muted)">পুরো ব্যাচ ভরলে</span>
                      <span className="font-semibold text-(--c-accent-ink)">
                        <Taka amount={fees.sellerReceives * Math.min(preview.seats, max)} />
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-(--c-ink)">বিনা ফির কোর্স — শিক্ষার্থীদের কোনো খরচ নেই।</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}

type BuilderForm = ReturnType<typeof useForm<CourseInput>>;

/** One paper to upload: kept in the browser when it is small, otherwise its name and size go to the panel. */
function PaperField({ name, label, hint, accept, form }: { name: "syllabus" | "calendar"; label: string; hint: string; accept: string; form: BuilderForm }) {
  const { num } = useFormat();
  const input = useRef<HTMLInputElement>(null);
  const paper = useWatch({ control: form.control, name });
  const error = form.formState.errors[name]?.title?.message;

  async function pick(file: File | undefined) {
    if (!file) return;
    const { value, unit } = sizeParts(file.size);
    let href: string | undefined;
    if (file.size <= NOTE_FILE_MAX) {
      try {
        href = await readDataUrl(file);
      } catch {
        toast.error(`${file.name} পড়া গেল না`);
        return;
      }
    }
    form.setValue(name, { kind: materialKindOf(file.name), title: file.name, size: `${num(value)} ${unit}`, href, file: file.name }, { shouldValidate: true });
  }

  return (
    <div>
      <p className="text-sm font-semibold text-(--c-ink-strong)">{label}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          "mt-2 flex w-full items-center gap-2.5 border px-3 py-3 text-left text-sm transition-colors duration-150",
          paper?.title ? "border-(--c-good)" : "border-dashed border-(--c-line-strong) hover:border-(--c-ink)",
          error && "border-(--c-bad)",
        )}
      >
        {paper?.title ? <Check className="size-4.5 shrink-0 text-(--c-good)" aria-hidden /> : <Upload className="size-4.5 shrink-0 text-(--c-muted)" aria-hidden />}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-(--c-ink-strong)">{paper?.title || "ফাইল দিন"}</span>
          <span className="block text-xs text-(--c-muted)">{paper?.title ? paper.size : hint}</span>
        </span>
      </button>
      <input ref={input} type="file" accept={accept} className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => pick(e.target.files?.[0])} />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-(--c-bad)">
          {error}
        </p>
      )}
    </div>
  );
}

/** The promo: a video file whose length is read here and must be two and a half minutes. */
function PromoField({ form }: { form: BuilderForm }) {
  const { num } = useFormat();
  const input = useRef<HTMLInputElement>(null);
  const promo = useWatch({ control: form.control, name: "promo" });
  const error = form.formState.errors.promo?.file?.message ?? form.formState.errors.promo?.seconds?.message;
  const ok = Boolean(promo?.file) && promoFits(promo?.seconds ?? 0);
  const clock = (s: number) => num(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      const seconds = await videoSeconds(file);
      form.setValue("promo", { seconds, file: file.name }, { shouldValidate: true });
      if (!promoFits(seconds)) toast.error(`প্রোমো ${clock(seconds)} — আড়াই মিনিট লাগবে`, { description: `পুরো কোর্সের সারাংশ ${clock(PROMO_SECONDS)}-এ কেটে আবার দিন।` });
    } catch {
      toast.error(`${file.name} ভিডিও হিসেবে পড়া গেল না`);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-(--c-ink-strong)">প্রোমো ভিডিও</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn("mt-2 flex w-full items-center gap-2.5 border px-3 py-3 text-left text-sm transition-colors duration-150", ok ? "border-(--c-good)" : "border-dashed border-(--c-line-strong) hover:border-(--c-ink)", error && "border-(--c-bad)")}
      >
        {ok ? <Check className="size-4.5 shrink-0 text-(--c-good)" aria-hidden /> : promo?.file ? <FileVideo className="size-4.5 shrink-0 text-(--c-muted)" aria-hidden /> : <Upload className="size-4.5 shrink-0 text-(--c-muted)" aria-hidden />}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-(--c-ink-strong)">{promo?.file || "ভিডিও দিন"}</span>
          <span className="block text-xs text-(--c-muted)">{promo?.file ? `${clock(promo.seconds)} মিনিট` : `পুরো কোর্সের সারাংশ, ${clock(PROMO_SECONDS)} মিনিট`}</span>
        </span>
      </button>
      <input ref={input} type="file" accept="video/*" className="sr-only" tabIndex={-1} aria-label="প্রোমো ভিডিও" onChange={(e) => pick(e.target.files?.[0])} />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-(--c-bad)">
          {error}
        </p>
      )}
      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-(--c-faint)">
        <FileText className="mt-px size-3 shrink-0" aria-hidden /> ভিডিও এই ফোন থেকে কোথাও যায় না — নাম আর দৈর্ঘ্য প্যানেলে যায়।
      </p>
    </div>
  );
}
