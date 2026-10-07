"use client";

import Link from "next/link";
import { getCourse } from "@/data/media/academy";
import { progressOf } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { DateText } from "../ui/numerals";
import { useAcademy } from "./use-academy";

/** The viewer's courses and how close each is to its final. */
export function MyFinals() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const admissions = useAcademy((a) => a.admissions);
  if (!hydrated) return null;

  const rows = Object.entries(enrolled).flatMap(([code, e]) => {
    const course = getCourse(code);
    return course ? [{ course, e }] : [];
  });

  if (rows.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-white/80">
        এখনো কোনো কোর্সে ভর্তি নেই।{" "}
        {Object.values(admissions).some((a) => a.fastTrack) ? "অভিজ্ঞতার স্বীকৃতি পেয়েছেন — বিভাগের একটা কোর্সে ঢুকে প্রজেক্ট জমা দিলেই ইন্টারভিউ।" : "কোর্স শেষে এখানে ফাইনালের অবস্থা দেখবেন।"}{" "}
        <Link href="/media/academy#courses" className="font-semibold text-signal-orange hover:underline">কোর্স দেখুন</Link>
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/10">
      {rows.map(({ course, e }) => {
        const fast = Boolean(admissions[course.dept]?.fastTrack);
        const ready = progressOf(course, e).eligible || (fast && Boolean(e.project));
        return (
          <li key={course.id}>
            <Link href={`/media/academy/course/${course.id}#final`} className="group flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="font-semibold text-white group-hover:text-signal-orange">{course.title}</span>
              <span className="text-sm text-white/80">
                {e.interview ? <>ইন্টারভিউ <DateText iso={e.interview} time /></> : ready ? <span className="text-signal-orange">সময় বেছে নিন</span> : "প্রস্তুতি চলছে"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
