"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { courses, getDepartment } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { COURSE_DAYS, LEVELS, SCHOOLS, type Course, type School } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../../ui/button-styles";
import { Compact, Num } from "../../../ui/numerals";
import { DeptIcon } from "../../departments/dept-icons";
import { ratingOf } from "../../departments/parts";

const SHOWN = 3;
const today = DEMO_NOW.toISOString().slice(0, 10);
/** The three courses most learners joined, across every school. */
const POPULAR = new Set([...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 3).map((c) => c.id));

const bySchool = (s: School) => courses.filter((c) => getDepartment(c.dept)?.school === s).sort((a, b) => b.enrolled - a.enrolled);
const SCHOOL_TABS = (Object.keys(SCHOOLS) as School[]).filter((s) => bySchool(s).length > 0);

/**
 * The course site's grey panel: a short pitch on the left, schools as pill
 * tabs over three course cards on the right, and "আরও দেখুন" to open the
 * rest of that school.
 */
export function SkillsPanel({ graduates }: { graduates: number }) {
  const reduce = useReducedMotion();
  const [school, setSchool] = useState<School>(SCHOOL_TABS[0]);
  const [all, setAll] = useState(false);
  const list = bySchool(school);
  const shown = all ? list : list.slice(0, SHOWN);
  const more = list.length - SHOWN;

  return (
    <section aria-labelledby="skills" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <div className="grid gap-8 rounded-3xl bg-m-ground px-5 py-7 ring-1 ring-m-ink/6 sm:px-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-center lg:gap-10">
        <div>
          <h2 id="skills" className="text-2xl leading-snug font-bold text-balance text-m-ink">
            নিয়োগকর্তারা যে দক্ষতা খোঁজেন, তা-ই শিখুন
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-m-ink/80">
            <Num value={graduates} /> জন গ্র্যাজুয়েট পেশাদারদের প্যানেলের সামনে নিজের কাজ দেখিয়ে সনদ পেয়েছেন — নাম উঠেছে প্রকাশ্য বোর্ডে।
          </p>
          <Link href="/media/academy/videos" className="group mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-m-blue hover:underline">
            বিনামূল্যে প্রথম ক্লাস দেখুন <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>

        <div className="min-w-0">
          <div role="tablist" aria-label="ধারা" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 scrollbar-none">
            {SCHOOL_TABS.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={s === school}
                onClick={() => {
                  setSchool(s);
                  setAll(false);
                }}
                className={cn(
                  "h-9 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                  s === school ? "bg-m-ink text-m-on" : "bg-white text-m-ink ring-1 ring-m-ink/20 hover:ring-m-ink/45",
                )}
              >
                {SCHOOLS[s]}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={school}
              role="tabpanel"
              aria-label={SCHOOLS[school]}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {shown.map((c) => (
                <li key={c.id}>
                  <PlusCourseCard course={c} />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>

          {more > 0 && (
            <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className={mediaButton({ variant: "outline", size: "sm", className: "mt-5" })}>
              {all ? "কম দেখুন" : <>আরও <Num value={more} />টি দেখুন</>}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/** A course card as the course site draws it: picture, the department's mark and academy, title, stars and kind, and up to two tags. */
export function PlusCourseCard({ course: c }: { course: Course }) {
  const dept = getDepartment(c.dept);
  const rating = ratingOf(c);
  const tags: { label: string; tone: string }[] = [];
  if (POPULAR.has(c.id)) tags.push({ label: "জনপ্রিয়", tone: "bg-m-blue-soft text-m-blue-deep" });
  if (c.fee === 0) tags.push({ label: "বিনা ফি", tone: "bg-m-green-soft text-m-green" });
  else if (c.starts > today) tags.push({ label: "নতুন ব্যাচ", tone: "text-m-ink ring-1 ring-m-ink/30" });
  else tags.push({ label: "ফ্রি ক্লাস", tone: "bg-m-amber-soft text-m-gold" });

  return (
    <Link
      href={`/media/academy/course/${c.id}`}
      className="group flex h-full flex-col rounded-2xl bg-white p-2 ring-1 ring-m-ink/12 transition-[box-shadow,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-m-lift focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-m-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="relative block aspect-[16/9] overflow-hidden rounded-xl bg-m-ground">
        <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 15rem, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
      </span>
      <span className="mt-3 flex items-center gap-2 px-1.5">
        {dept && (
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white ring-1 ring-m-ink/14">
            <DeptIcon dept={dept.id} school={dept.school} className="size-5" />
          </span>
        )}
        <span className="truncate text-sm text-m-ink/80">{dept?.academy.name}</span>
      </span>
      <span className="mt-2 line-clamp-2 px-1.5 text-[15px] leading-snug font-bold text-m-ink group-hover:underline group-hover:underline-offset-2">{c.title}</span>
      <span className="mt-1.5 block px-1.5 text-xs leading-relaxed text-m-ink/65">
        {rating && (
          <span className="whitespace-nowrap">
            <Star className="mr-0.5 inline size-3.5 fill-m-yellow align-[-2px] text-m-gold" aria-hidden />
            <Num value={rating.avg} decimals={1} /> (<Compact n={rating.count} />)
          </span>
        )}
        {rating && " · "}
        {LEVELS[c.level]} · <Num value={COURSE_DAYS} /> দিনের কোর্স
      </span>
      <span className="mt-auto flex flex-wrap gap-1.5 px-1.5 pt-3 pb-1.5">
        {tags.map((t) => (
          <span key={t.label} className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", t.tone)}>
            {t.label}
          </span>
        ))}
      </span>
    </Link>
  );
}
