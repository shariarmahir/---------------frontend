"use client";

import { useState } from "react";
import { Award, CalendarCheck, Flag, Hammer, PenLine, Ticket, Video } from "lucide-react";
import { toast } from "sonner";
import { courseTimeline, type Academy, type Course } from "@/lib/media/academy";
import { classSessions, dhakaDay, seatsLeft, slotOf } from "@/lib/media/batch";
import { GOALS } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { twoDigits } from "../catalogue/band";
import { secondaryBtn } from "../catalogue/buttons";
import { EnrolButton } from "../catalogue/enrol-button";
import { defaultBatch, useCourseBatches } from "../classroom/use-batches";
import { updateAcademy, useAcademy } from "../use-academy";

const DAY = 86_400_000;

/**
 * "আজ থেকে চল্লিশ দিন", in two ruled cells. On the left the learner picks a
 * course and writes, in a line, who they will be at the end; on the right
 * the road is drawn with the real dates of the soonest open batch — today,
 * admission, the first class and its weekly slot, the project and panel
 * days, and graduation, where their own line waits. The line is kept on
 * this device; the button is the way in.
 */
export function FutureCells({ academy, courses }: { academy: Academy; courses: Course[] }) {
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
  const field = `dream-${academy.id}`;

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
    { Icon: Award, when: t ? <DateText iso={t.ends} /> : "—", title: "সমাবর্তন", body: line.trim() ? <>“{line.trim()}”</> : course.outcome, last: true },
  ];

  return (
    <div className="grid gap-px border-t border-(--c-line) bg-(--c-line) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div data-reveal className="bg-(--c-bg) p-6 md:p-10">
        <fieldset>
          <legend className="hud text-(--c-faint)">কোন কোর্স?</legend>
          <div className="mt-3 flex flex-wrap gap-px border border-(--c-line) bg-(--c-line)">
            {courses.map((c) => {
              const on = c.id === course.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(c.id)}
                  className={cn("flex-1 basis-48 px-4 py-3 text-left text-sm font-semibold transition-colors duration-150", on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)")}
                >
                  <span className="hud block font-mono tracking-[0.06em] opacity-60">{c.id}</span>
                  {c.title.split(" — ")[0]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label htmlFor={field} className="hud mt-8 block text-(--c-faint)">
          চল্লিশ দিন পর আমি…
        </label>
        <textarea
          id={field}
          rows={3}
          maxLength={140}
          value={line}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={course.outcome}
          className="mt-3 w-full resize-none border border-(--c-line-strong) bg-(--c-bg-sunken) px-4 py-3 text-base leading-relaxed text-(--c-ink-strong) transition-colors duration-150 placeholder:text-(--c-faint) focus:border-(--c-signal) focus:outline-none"
        />
        {goal && <p className="mt-2 text-sm text-(--c-muted)">আপনার স্বপ্ন ছিল “{GOALS[goal]}” — সেটা মাথায় রেখে লিখুন।</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="button" onClick={keep} className={secondaryBtn}>
            <Flag className="size-4" aria-hidden />
            লক্ষ্যটা লিখে রাখুন
          </button>
          {hydrated && saved && !draft && <span className="hud text-(--c-faint)">লিখে রাখা আছে</span>}
        </div>
      </div>

      <div data-reveal className="flex flex-col bg-(--c-bg)">
        {batch && days !== null && (
          <p className="hud flex flex-wrap items-center gap-2 border-b border-(--c-line) px-6 py-3 text-(--c-ink) md:px-10">
            <CalendarCheck className="size-4 shrink-0 text-(--c-signal)" aria-hidden />
            {days > 0 ? (
              <>
                ব্যাচ <Num value={batch.n} /> শুরু আর <Num value={days} /> দিন পর · আসন বাকি <Num value={seatsLeft(batch)} />টি
              </>
            ) : (
              <>
                ব্যাচ <Num value={batch.n} /> চলছে — আজ ভর্তি হলে পরের ক্লাস থেকেই
              </>
            )}
          </p>
        )}
        <ol className="flex-1">
          {stops.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 border-b border-(--c-line) px-6 py-5 last:border-b-0 md:px-10">
              <span className={cn("grid size-10 place-items-center border", s.last ? "border-transparent bg-(--c-signal) text-black" : "border-(--c-line) text-(--c-accent-ink)")}>
                <s.Icon className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="hud flex items-center gap-3 text-(--c-faint)">
                  <span>{twoDigits(i + 1)}</span>
                  <span className="text-(--c-accent-ink)">{s.when}</span>
                </p>
                <p className="display mt-1 text-lg text-(--c-ink-strong)">{s.title}</p>
                <p className={cn("mt-1 text-sm leading-relaxed", s.last ? "font-semibold text-(--c-ink)" : "text-(--c-muted)")}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-4 border-t border-(--c-line) px-6 py-5 md:px-10">
          <EnrolButton course={course} />
          <span className="text-sm text-(--c-muted)">{course.title}</span>
        </div>
      </div>
    </div>
  );
}
