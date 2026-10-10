"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCourse } from "@/data/media/academy";
import { progressOf } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { DateText } from "../ui/numerals";
import { useAcademy } from "./use-academy";

/** The viewer's courses and how close each is to its final, as a ruled list. */
export function MyFinals() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const admissions = useAcademy((a) => a.admissions);
  if (!hydrated) return <span aria-hidden className="block h-24 animate-pulse bg-(--c-bg-sunken)" />;

  const rows = Object.entries(enrolled).flatMap(([code, e]) => {
    const course = getCourse(code);
    return course ? [{ course, e }] : [];
  });

  if (rows.length === 0) {
    return (
      <p className="leading-relaxed text-(--c-muted)">
        এখনো কোনো কোর্সে ভর্তি নেই। {Object.values(admissions).some((a) => a.fastTrack) ? "অভিজ্ঞতার স্বীকৃতি পেয়েছেন — বিভাগের একটা কোর্সে ঢুকে প্রজেক্ট জমা দিলেই ইন্টারভিউ।" : "কোর্স শেষে এখানে ফাইনালের অবস্থা দেখবেন।"}{" "}
        <Link href="/media/academy/courses" className="font-semibold text-(--c-accent-ink) underline-offset-4 hover:underline">
          কোর্স দেখুন
        </Link>
      </p>
    );
  }

  return (
    <ul className="border-t border-(--c-line)">
      {rows.map(({ course, e }) => {
        const fast = Boolean(admissions[course.dept]?.fastTrack);
        const ready = progressOf(course, e).eligible || (fast && Boolean(e.project));
        return (
          <li key={course.id} className="border-b border-(--c-line)">
            <Link href={`/media/academy/course/${course.id}#curriculum`} className="group flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="font-semibold text-(--c-ink-strong) underline-offset-4 group-hover:underline">{course.title}</span>
              <span className="hud flex items-center gap-1.5 text-(--c-muted)">
                {e.interview ? (
                  <>
                    ইন্টারভিউ <DateText iso={e.interview} time />
                  </>
                ) : ready ? (
                  <span className="font-bold text-(--c-signal)">সময় বেছে নিন</span>
                ) : (
                  "প্রস্তুতি চলছে"
                )}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
