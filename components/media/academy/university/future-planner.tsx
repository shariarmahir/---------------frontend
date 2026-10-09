"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, CalendarCheck, Flag, Hammer, PenLine, Ticket, Video } from "lucide-react";
import { toast } from "sonner";
import { COURSE_DAYS, courseTimeline, type Academy, type Course } from "@/lib/media/academy";
import { classSessions, dhakaDay, seatsLeft, slotOf } from "@/lib/media/batch";
import { GOALS } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { CheckoutButton } from "../cart";
import { defaultBatch, useCourseBatches } from "../classroom/use-batches";
import { updateAcademy, useAcademy } from "../use-academy";

const DAY = 86_400_000;

/**
 * "আজ থেকে চল্লিশ দিন" — the learner picks a course and writes, in a line,
 * who they will be at the end. The road is drawn with the real dates of the
 * soonest open batch: today, admission, the first class, the weekly slot,
 * the project and panel days, and graduation, where their own line waits.
 * The line is kept on this device; the button is the way in.
 */
export function FuturePlanner({ academy, courses }: { academy: Academy; courses: Course[] }) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const saved = useAcademy((a) => a.dreams?.[academy.id]);
  const goal = useAcademy((a) => a.finder?.goal);
  const [picked, setPicked] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const course = courses.find((c) => c.id === (picked ?? (hydrated ? saved?.course : undefined))) ?? courses[0];
  const line = draft ?? (hydrated ? saved?.line : "") ?? "";
  const batch = defaultBatch(useCourseBatches(course.id));
  const today = dhakaDay(new Date());
  const t = batch ? courseTimeline(batch.starts) : null;
  const first = batch ? classSessions(batch)[0] : null;
  const days = batch ? Math.round((Date.parse(`${batch.starts}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY) : null;

  function keep() {
    const text = line.trim();
    if (text.length < 4) {
      toast.error("এক লাইনে লিখুন — চল্লিশ দিন পর আপনি কী পারবেন");
      return;
    }
    updateAcademy((a) => ({ ...a, dreams: { ...(a.dreams ?? {}), [academy.id]: { line: text.slice(0, 140), course: course.id, at: new Date().toISOString() } } }));
    setDraft(null);
    toast.success("লক্ষ্যটা লিখে রাখা হলো", { description: "ভর্তির পর ক্লাসরুমে আর সমাবর্তনের পাতায় এটা আপনাকে মনে করিয়ে দেবে।" });
  }

  const stops = [
    { Icon: PenLine, when: <DateText iso={today} />, title: "আজ — স্বপ্নটা লিখলেন", body: "এই পাতাতেই, এক লাইনে।" },
    { Icon: Ticket, when: "যেকোনো দিন", title: "ভর্তি", body: "এক ফর্ম — নাম, মোবাইল, ব্যাচ আর পেমেন্ট।" },
    { Icon: Video, when: first ? <DateText iso={first.at} time weekday /> : "—", title: "প্রথম ক্লাস", body: batch ? <>প্রতি সপ্তাহে {slotOf(batch.day, batch.time)}</> : "নতুন ব্যাচ খুললেই তারিখ" },
    { Icon: Hammer, when: t ? <><DateText iso={t.final.from} /> – <DateText iso={t.final.to} /></> : "—", title: "প্রজেক্ট ও প্যানেল", body: course.final },
    { Icon: Award, when: t ? <DateText iso={t.ends} /> : "—", title: "সমাবর্তন", body: line.trim() ? <>“{line.trim()}”</> : course.outcome, gold: true },
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-m-lift ring-1 ring-m-ink/7">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="blue-band relative p-6 sm:p-8">
          <p className="relative text-sm font-bold text-m-yellow">ভবিষ্যৎ</p>
          <h2 id="future-title" className="relative mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-bold">
            আজ থেকে <Num value={COURSE_DAYS} /> দিন — নিজের ভবিষ্যৎ আঁকুন
          </h2>
          <p className="relative mt-2 text-[15px] text-white/80">কোর্স বাছুন, এক লাইনে লিখুন শেষে আপনি কী পারবেন। পাশে আসল তারিখে আপনার পথ।</p>

          <fieldset className="relative mt-6">
            <legend className="mb-2 text-sm font-semibold text-white/85">কোন কোর্স?</legend>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <button key={c.id} type="button" aria-pressed={c.id === course.id} onClick={() => setPicked(c.id)} className={cn("rounded-full px-3.5 py-2 text-left text-sm font-semibold transition-colors", c.id === course.id ? "bg-white text-m-blue shadow-m-tile" : "bg-white/12 text-white ring-1 ring-white/25 hover:bg-white/20")}>
                  {c.title.split(" — ")[0]}
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor={`dream-${academy.id}`} className="relative mt-6 block text-sm font-semibold text-white/85">
            <Num value={COURSE_DAYS} /> দিন পর আমি…
          </label>
          <textarea
            id={`dream-${academy.id}`}
            rows={2}
            maxLength={140}
            value={line}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={course.outcome}
            className="relative mt-2 w-full resize-none rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed text-m-ink shadow-m-tile placeholder:text-m-ink/40 focus:ring-3 focus:ring-m-yellow/60 focus:outline-none"
          />
          {goal && <p className="relative mt-2 text-xs text-white/70">আপনার স্বপ্ন ছিল “{GOALS[goal]}” — সেটা মাথায় রেখে লিখুন।</p>}
          <div className="relative mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={keep} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold text-white ring-1 ring-white/35 hover:bg-white/25">
              <Flag className="size-4" aria-hidden /> লক্ষ্যটা লিখে রাখুন
            </button>
            {saved && !draft && <span className="text-xs text-white/70">লিখে রাখা আছে</span>}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {batch && days !== null && (
            <p className={cn("mb-6 flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold", days > 0 ? "bg-m-amber-soft text-m-ink" : "bg-m-green-soft text-m-ink")}>
              <CalendarCheck className="size-4.5 shrink-0 text-m-gold" aria-hidden />
              {days > 0 ? (
                <>
                  এখনই সময় — ব্যাচ <Num value={batch.n} /> শুরু আর <Num value={days} /> দিন পর, আসন বাকি <Num value={seatsLeft(batch)} />টি
                </>
              ) : (
                <>ব্যাচ <Num value={batch.n} /> চলছে — আজ ভর্তি হলে পরের ক্লাস থেকেই শুরু</>
              )}
            </p>
          )}
          <ol className="relative">
            <span aria-hidden className="absolute top-5 bottom-5 left-5 w-0.5 bg-linear-to-b from-m-blue via-m-yellow to-m-green" />
            {stops.map((s, i) => (
              <motion.li
                key={s.title}
                className="relative flex gap-4 pb-6 last:pb-0"
                initial={reduce ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.08 }}
              >
                <span className={cn("relative z-10 grid size-10 shrink-0 place-items-center rounded-full ring-4 ring-white", s.gold ? "bg-m-yellow text-m-ink" : "bg-m-blue text-m-on")}>
                  <s.Icon className="size-4.5" aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-m-blue">{s.when}</p>
                  <p className="font-bold text-m-ink">{s.title}</p>
                  <p className={cn("mt-0.5 text-sm leading-relaxed", s.gold ? "font-semibold text-m-ink" : "text-m-ink/65")}>{s.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-m-ink/6 pt-6">
            <CheckoutButton course={course} className="h-12 px-6 text-base" />
            <span className="text-sm text-m-ink/60">{course.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
