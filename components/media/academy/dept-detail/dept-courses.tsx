"use client";

import { coursesOf } from "@/data/media/academy";
import { LEVELS, type Department, type Level } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";
import { Reveal } from "../home/motion-bits";
import { CourseTile } from "../departments/parts";

/**
 * Every course of this department, beginners' first, as the same cards the
 * departments page used to carry — each with "কোর্স দেখুন". The departments
 * page shows departments only; their courses are here.
 */
export function DeptCourses({ dept }: { dept: Department }) {
  const order = Object.keys(LEVELS) as Level[];
  const list = [...coursesOf(dept.id)].sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || a.id.localeCompare(b.id));
  return (
    <section id="all-courses" aria-labelledby="courses-title" className="scroll-mt-20">
      <h2 id="courses-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        এই বিভাগের কোর্স
      </h2>
      <p className="mt-1 text-sm text-m-ink/75">
        {list.length ? (
          <>
            <Num value={list.length} />টি কোর্স — যেকোনোটা খুলে সপ্তাহ ধরে কী শেখানো হয়, ফি আর আসন দেখুন।
          </>
        ) : (
          "প্রথম কোর্স প্যানেলের অনুমোদনের অপেক্ষায় — অনুমোদন পেলে এখানে আসবে।"
        )}
      </p>
      {list.length > 0 && (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c, i) => (
            <li key={c.id}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <CourseTile course={c} cta />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
