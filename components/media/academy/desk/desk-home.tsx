"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ListChecks, Plus, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { board, getCourse } from "@/data/media/academy";
import { payoutOf, type Course } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useTeacher } from "./use-teacher";

/** শিক্ষক ডেস্ক: a teacher's courses, today's jobs, and the money as classes are held. */
export function DeskHome() {
  const hydrated = useHydrated();
  const t = useTeacher();
  const attendance = useAcademy((a) => a.attendance);
  const marks = useAcademy((a) => a.marks);
  const application = useAcademy((a) => a.application);

  if (!hydrated) return <Skeleton className="h-96 rounded-2xl bg-text-primary/40" />;

  if (!t.record) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl bg-text-primary p-6 text-center ring-1 ring-white/12 sm:p-8">
        <Presenter />
        <h1 className="mt-4 text-2xl font-bold text-white">ডেস্ক খোলে প্যানেল ইন্টারভিউয়ের পর</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {application ? "আপনার আবেদন জমা আছে। প্যানেল পাস করলেই এখানে কোর্স বানানো, হাজিরা আর উপকরণ খুলে যাবে।" : "শিক্ষক হতে আবেদন করুন — নমুনা ক্লাস আর প্যানেল ইন্টারভিউয়ের পর ডেস্ক আপনার।"}
        </p>
        <Link href="/media/academy/teach" className={mediaButton({ variant: "primary", className: "mt-5" })}>
          {application ? "আবেদনের অবস্থা" : "শিক্ষক হিসেবে আবেদন"} <ArrowRight aria-hidden />
        </Link>
      </section>
    );
  }

  const { points, tier } = standingOf(t.record);
  const held = (c: Course) => Object.keys(attendance[c.id] ?? {}).length;
  const students = t.live.reduce((n, c) => n + c.enrolled, 0);
  const lessons = t.live.reduce((n, c) => n + c.lessons.length, 0);
  const heldAll = t.live.reduce((n, c) => n + held(c), 0);
  const money = t.live.reduce((m, c) => {
    const p = payoutOf(c, held(c));
    return { released: m.released + p.released, waiting: m.waiting + p.waiting };
  }, { released: 0, waiting: 0 });
  const seats = board.filter((s) => !s.marks && getCourse(s.course)?.teacher === t.handle);
  const toMark = seats.filter((s) => !marks[s.id]);
  const nextWeeks = t.live
    .map((c) => ({ course: c, lesson: c.lessons.find((l) => !attendance[c.id]?.[l.week]) }))
    .filter((x) => x.lesson);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="live-in flex flex-wrap items-center gap-5 rounded-3xl bg-signal-orange p-5 text-text-primary sm:p-7">
        <PersonAvatar person={t.person} size="xl" className="ring-4 ring-text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">শিক্ষক ডেস্ক</p>
          <h1 className="text-[clamp(1.6rem,3.5vw,2.25rem)] leading-tight font-bold">{t.person.nameBn}</h1>
          <p className="mt-1 text-sm font-semibold">{t.record.title}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            <TierBadge tier={tier} /> <Num value={points.total} /> পয়েন্ট · {t.depts.map((d) => d.name).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/media/academy/desk/new" className={mediaButton({ variant: "tile", size: "lg" })}>
            <Plus aria-hidden /> নতুন কোর্স
          </Link>
          <Link href={`/media/academy/teachers/${t.handle}`} className={mediaButton({ size: "lg", className: "border-text-primary bg-transparent text-text-primary shadow-none hover:bg-text-primary/10" })}>
            আমার শিক্ষক-প্রোফাইল
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/12 lg:grid-cols-4">
        {[
          ["শিক্ষার্থী", <Num key="s" value={students} />, "সব কোর্স মিলিয়ে"],
          ["ক্লাস নেওয়া হয়েছে", <><Num key="h" value={heldAll} /> / <Num value={lessons} /></>, "হাজিরা জমা মানেই ক্লাস হয়েছে"],
          ["আয় ছাড় হয়েছে", <Taka key="r" amount={money.released} />, "প্রতিটি ক্লাসে সেই সপ্তাহের ভাগ"],
          ["এসক্রোতে অপেক্ষায়", <Taka key="w" amount={money.waiting} />, "বাকি ক্লাস হলে ছাড় পাবে"],
        ].map(([k, v, hint]) => (
          <div key={String(k)} className="bg-text-primary p-4 sm:p-5">
            <dt className="text-xs font-semibold text-white/70">{k}</dt>
            <dd className="mt-1 text-2xl font-bold text-white tabular-nums">{v}</dd>
            <dd className="mt-0.5 text-xs text-white/60">{hint}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="today">
        <h2 id="today" className="mb-3 text-lg font-bold text-white">আজকের কাজ</h2>
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12">
          {nextWeeks.map(({ course, lesson }) => (
            <li key={course.id}>
              <Link href={`/media/academy/desk/${course.id}`} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 sm:px-5">
                <ListChecks className="size-5 shrink-0 text-signal-orange" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white group-hover:text-signal-orange">সপ্তাহ <Num value={lesson!.week} />-এর হাজিরা নিন — {lesson!.title}</span>
                  <span className="text-xs text-white/65">{course.id} · {course.title}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
          {toMark.length > 0 && (
            <li>
              <Link href="/media/academy/panel" className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 sm:px-5">
                <ClipboardCheck className="size-5 shrink-0 text-signal-orange" aria-hidden />
                <span className="min-w-0 flex-1 font-semibold text-white group-hover:text-signal-orange"><Num value={toMark.length} />টি ফাইনাল ইন্টারভিউয়ে নম্বর দেওয়া বাকি</span>
                <ArrowRight className="size-4 shrink-0 text-white/60" aria-hidden />
              </Link>
            </li>
          )}
          {t.record.complaints.open > 0 && (
            <li className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <ShieldAlert className="size-5 shrink-0 text-signal-orange" aria-hidden />
              <span className="text-sm text-white/85"><Num value={t.record.complaints.open} />টি অভিযোগ প্যানেলের কাছে — আপনার বক্তব্য চাওয়া হবে। কে লিখেছেন, তা দেখানো হয় না।</span>
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="my-courses">
        <h2 id="my-courses" className="mb-3 text-lg font-bold text-white">আমার কোর্স</h2>
        <ul className="space-y-3">
          {t.live.map((c) => <CourseRow key={c.id} course={c} held={held(c)} />)}
        </ul>
      </section>

      {t.drafts.length > 0 && (
        <section aria-labelledby="drafts">
          <h2 id="drafts" className="mb-3 text-lg font-bold text-white">প্যানেলের অনুমোদনের অপেক্ষায়</h2>
          <ul className="space-y-3">
            {t.drafts.map((c) => <CourseRow key={c.id} course={c} held={0} draft />)}
          </ul>
        </section>
      )}
    </div>
  );
}

function CourseRow({ course, held, draft }: { course: Course; held: number; draft?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-2xl bg-text-primary p-3 ring-1 ring-white/12 sm:flex-nowrap sm:p-4">
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-black">
        <Image src={course.image} alt="" fill sizes="7rem" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-bold text-signal-orange">{course.id}</p>
        <p className="truncate font-semibold text-white">{course.title}</p>
        <p className="mt-0.5 text-xs text-white/70">
          {draft ? "জমা হয়েছে · প্যানেল ৭২ ঘণ্টায় দেখবে" : <><Num value={course.enrolled} /> / <Num value={course.seats} /> আসন{course.nextLive && <> · পরের ক্লাস <DateText iso={course.nextLive} time /></>}</>}
        </p>
        {!draft && (
          <div className="mt-2 flex gap-1" aria-label={`${course.lessons.length}টির মধ্যে ${held}টি ক্লাস হয়েছে`}>
            {course.lessons.map((l, i) => <span key={l.week} className={cn("h-1.5 flex-1 rounded-full", i < held ? "bg-signal-orange" : "bg-white/12")} />)}
          </div>
        )}
      </div>
      <Link href={`/media/academy/desk/${course.id}`} className={mediaButton({ variant: draft ? "quiet" : "primary", size: "sm" })}>
        {draft ? "উপকরণ যোগ করুন" : "হাজিরা ও উপকরণ"}
      </Link>
    </li>
  );
}

/** A small board-and-pointer glyph for the closed desk. */
function Presenter() {
  return (
    <svg viewBox="0 0 64 48" className="mx-auto h-14 text-signal-orange" aria-hidden>
      <rect x="6" y="4" width="52" height="30" rx="4" className="fill-current" />
      <rect x="11" y="9" width="42" height="20" rx="2" className="fill-bd-green-dark" />
      <path d="M17 23 L27 15 L35 21 L47 12" className="fill-none stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="29" y="34" width="6" height="10" className="fill-current" />
      <rect x="20" y="43" width="24" height="3" rx="1.5" className="fill-current" />
    </svg>
  );
}
