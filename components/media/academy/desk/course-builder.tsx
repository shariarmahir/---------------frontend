"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormGroup, FormGroupLabel, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courses, workshops } from "@/data/media/academy";
import { LEVELS, MODES, draftCode, type Course, type Level, type Mode } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";
import { courseSchema, type CourseInput } from "@/lib/media/schemas";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { choiceClass, selectClass, toNumber } from "../../ui/field-styles";
import { Num, Taka } from "../../ui/numerals";
import { CourseCard } from "../parts";
import { updateAcademy } from "../use-academy";
import { useTeacher } from "./use-teacher";

/** Covers a teacher can pick from: the platform's own photos, never a stranger's. */
const COVERS = [...new Set([...courses.map((c) => c.image), ...workshops.map((w) => w.image)])];

const lesson = (title = "", mode: Mode = "live") => ({ title, mode, homework: "" });

/** Building a course: the plan week by week, the fee, the final — with a live preview. */
export function CourseBuilder() {
  const router = useRouter();
  const hydrated = useHydrated();
  const t = useTeacher();
  const form = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      dept: t.depts[0]?.id ?? "",
      level: "foundation",
      weeks: 4,
      fee: 2000,
      seats: 20,
      image: COVERS[0],
      outcome: "",
      final: "",
      lessons: [lesson("", "video"), lesson(), lesson(), lesson()],
    },
  });
  const lessons = useFieldArray({ control: form.control, name: "lessons" });
  const v = useWatch({ control: form.control });

  if (!hydrated) return null;
  if (!t.record) {
    return (
      <p className="mx-auto max-w-md rounded-2xl bg-text-primary p-6 text-center text-white/85 ring-1 ring-white/12">
        কোর্স বানাতে আগে শিক্ষক হিসেবে প্যানেল ইন্টারভিউ পাস করতে হয়। <Link href="/media/academy/teach" className="font-semibold text-signal-orange hover:underline">আবেদন করুন</Link>
      </p>
    );
  }

  const taken = [...courses.map((c) => c.id), ...t.drafts.map((c) => c.id)];
  const preview: Course = {
    id: draftCode(v.dept || "new", taken),
    dept: v.dept ?? "",
    title: v.title ?? "",
    teacher: t.handle,
    level: (v.level ?? "foundation") as Level,
    weeks: v.weeks || 1,
    fee: v.fee ?? 0,
    seats: v.seats || 1,
    enrolled: 0,
    image: v.image || COVERS[0],
    outcome: v.outcome ?? "",
    final: v.final ?? "",
    lessons: (v.lessons ?? []).map((l, i) => ({ week: i + 1, title: l?.title ?? "", mode: (l?.mode ?? "live") as Mode, homework: l?.homework || undefined })),
    materials: [],
  };
  const fees = computeFees(preview.fee);

  function onSubmit(input: CourseInput) {
    const course: Course = { ...preview, ...input, id: draftCode(input.dept, taken), lessons: input.lessons.map((l, i) => ({ week: i + 1, title: l.title, mode: l.mode, homework: l.homework || undefined })) };
    updateAcademy((a) => ({ ...a, drafts: [course, ...a.drafts] }));
    toast.success(`${course.id} জমা হয়েছে`, { description: "প্যানেল ৭২ ঘণ্টার মধ্যে পাঠক্রম দেখে অনুমোদন দেবে।" });
    router.push(`/media/academy/desk/${course.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/media/academy/desk" className="group mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-signal-orange">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> শিক্ষক ডেস্ক
      </Link>
      <h1 className="text-2xl font-bold text-white sm:text-[2rem]">নতুন কোর্স</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm leading-relaxed text-white/80">সপ্তাহ ধরে যা শেখাবেন, তা-ই পাঠক্রম। প্রথম ক্লাস অনলাইনে, শেষে একটা সত্যিকারের প্রজেক্ট — প্যানেল দেখে অনুমোদন দেবে।</p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="min-w-0 space-y-8">
            <section className="space-y-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
              <h2 className="text-lg font-bold text-white">মূল তথ্য</h2>
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>কোর্সের নাম</FormLabel><FormControl><Input placeholder="যেমন: বাইকের চেইন ও ব্রেক সার্ভিস" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="dept" render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিভাগ</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClass}>
                        {t.depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="level" render={({ field }) => (
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
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(["weeks", "fee", "seats"] as const).map((name) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{name === "weeks" ? "সপ্তাহ" : name === "fee" ? "ফি (৳)" : "আসন"}</FormLabel>
                      <FormControl><Input inputMode="numeric" className="tabular-nums" value={field.value || ""} placeholder="০" onChange={(e) => field.onChange(toNumber(e.target.value))} /></FormControl>
                      {name === "fee" && <FormDescription>বিনা ফি হলে ০</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormGroupLabel>প্রচ্ছদ</FormGroupLabel>
                  <FormGroup className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {COVERS.map((src) => (
                      <label key={src} className={cn("relative aspect-video cursor-pointer overflow-hidden rounded-lg ring-2 has-focus-visible:ring-signal-orange", field.value === src ? "ring-signal-orange" : "ring-transparent hover:ring-white/40")}>
                        <input type="radio" className="sr-only" name={field.name} checked={field.value === src} onChange={() => field.onChange(src)} />
                        <Image src={src} alt="" fill sizes="8rem" className="object-cover" />
                        {field.value === src && <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-signal-orange text-text-primary"><Check className="size-3.5" strokeWidth={3} aria-label="বাছাই" /></span>}
                      </label>
                    ))}
                  </FormGroup>
                </FormItem>
              )} />
            </section>

            <section className="space-y-5 rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
              <h2 className="text-lg font-bold text-white">শেষে কী হবে</h2>
              <FormField control={form.control} name="outcome" render={({ field }) => (
                <FormItem><FormLabel>শিক্ষার্থী শেষে কী পারবে</FormLabel><FormControl><Textarea rows={2} placeholder="যেমন: নিজে একটা বাইকের চেইন আর ব্রেক পুরো সার্ভিস করতে পারবে।" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="final" render={({ field }) => (
                <FormItem><FormLabel>ফাইনাল প্রজেক্ট</FormLabel><FormControl><Textarea rows={2} placeholder="প্যানেল ইন্টারভিউ এই কাজ নিয়েই হবে।" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </section>

            <section className="rounded-2xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">সপ্তাহ ধরে ক্লাস</h2>
                <button type="button" onClick={() => lessons.append(lesson())} disabled={lessons.fields.length >= 24} className={mediaButton({ variant: "quiet", size: "sm" })}>
                  <Plus aria-hidden /> ক্লাস যোগ
                </button>
              </div>
              <ol className="space-y-3">
                {lessons.fields.map((f, i) => (
                  <li key={f.id} className="grid gap-2 rounded-xl bg-black/40 p-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_9.5rem_auto] sm:items-start">
                    <span className="inline-flex h-11 items-center text-sm font-bold text-signal-orange">সপ্তাহ <Num value={i + 1} /></span>
                    <div className="space-y-2">
                      <FormField control={form.control} name={`lessons.${i}.title`} render={({ field }) => (
                        <FormItem><FormLabel className="sr-only">সপ্তাহ {i + 1}-এর বিষয়</FormLabel><FormControl><Input placeholder="এই সপ্তাহের বিষয়" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`lessons.${i}.homework`} render={({ field }) => (
                        <FormItem><FormLabel className="sr-only">হোমওয়ার্ক</FormLabel><FormControl><Input placeholder="হোমওয়ার্ক (ঐচ্ছিক)" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name={`lessons.${i}.mode`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">কীভাবে</FormLabel>
                        <FormControl>
                          <select {...field} className={selectClass}>
                            {(Object.keys(MODES) as Mode[]).map((m) => <option key={m} value={m}>{MODES[m]}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <button type="button" onClick={() => lessons.remove(i)} disabled={lessons.fields.length === 1} className={mediaButton({ variant: "ghost", size: "icon" })} aria-label={`সপ্তাহ ${i + 1} মুছুন`}>
                      <Trash2 aria-hidden />
                    </button>
                  </li>
                ))}
              </ol>
              {form.formState.errors.lessons?.root?.message || form.formState.errors.lessons?.message ? (
                <p role="alert" className="mt-3 text-sm text-crimson-bright">{form.formState.errors.lessons?.root?.message ?? form.formState.errors.lessons?.message}</p>
              ) : null}
            </section>

            <button type="submit" className={mediaButton({ variant: "primary", size: "lg" })}>প্যানেলে জমা দিন</button>
          </form>
        </Form>

        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
          <p className="text-sm font-semibold text-white/80">শিক্ষার্থীরা যেভাবে দেখবে</p>
          <CourseCard course={preview} preview />
          <div className="rounded-2xl bg-text-primary p-4 text-sm ring-1 ring-white/12">
            {preview.fee > 0 ? (
              <>
                <p className="flex justify-between"><span className="text-white/75">প্রতি শিক্ষার্থী আপনি পান</span><span className="font-semibold text-white"><Taka amount={fees.sellerReceives} /></span></p>
                <p className="mt-1 flex justify-between"><span className="text-white/75">শিক্ষার্থী দেয়</span><span className="font-semibold text-white"><Taka amount={fees.buyerPays} /></span></p>
                <p className="mt-1 flex justify-between"><span className="text-white/75">সব আসন ভরলে</span><span className="font-semibold text-signal-orange"><Taka amount={fees.sellerReceives * preview.seats} /></span></p>
              </>
            ) : (
              <p className="text-white/85">বিনা ফির কোর্স — শিক্ষার্থীদের কোনো খরচ নেই।</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
