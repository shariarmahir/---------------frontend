import Link from "next/link";
import { ArrowRight, Building2, Sparkles, Ticket } from "lucide-react";
import { academies, departments } from "@/data/media/academy";
import { CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, FINAL_DAYS, LEVELS, type Level } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";
import { DeptIcon } from "../departments/dept-icons";
import { Band, BandTitle, Lean, twoDigits } from "./band";
import { blockBtn, primaryBtn, secondaryBtn } from "./buttons";
import { CatalogueFooter } from "./catalogue-footer";
import { CatalogueNav } from "./catalogue-nav";
import { CatalogueRoot } from "./catalogue-root";
import { CourseLineup } from "./course-lineup";
import type { CourseEntry } from "./entries";
import { CatalogueRuler } from "./ruler";
import { ShareRow } from "./share-row";
import { toneStyle } from "./tones";

const LEVEL_ORDER: Level[] = ["foundation", "intermediate", "advanced"];
const LEVEL_NOTE: Record<Level, string> = {
  foundation: "শূন্য থেকে — আগে কিছু জানা লাগে না।",
  intermediate: "হাতে কিছু কাজ আছে — এবার পেশাদারের মতো।",
  advanced: "পেশায় আছেন — বড় কাজ, কঠিন সমস্যা।",
};

/** A course's forty days, from the academy's own constants: the weeks of classes, then the project and the panel, then graduation. */
const DAYS: { from: number; to: number; title: React.ReactNode; body: React.ReactNode }[] = [
  ...Array.from({ length: CLASS_WEEKS }, (_, w) => ({
    from: w * 7 + 1,
    to: (w + 1) * 7,
    title: (
      <>
        সপ্তাহ <Num value={w + 1} />
      </>
    ),
    body: w === 0 ? <><Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস, সঙ্গে বাড়ির কাজ।</> : "ক্লাস, বাড়ির কাজ, আর শিক্ষকের মন্তব্য।",
  })),
  { from: CLASS_WEEKS * 7 + 1, to: COURSE_DAYS, title: "প্রজেক্ট ও প্যানেল", body: <><Num value={FINAL_DAYS} /> দিনে নিজের হাতে ফাইনাল প্রজেক্ট, তারপর দুই পরীক্ষকের প্যানেল।</> },
  { from: COURSE_DAYS, to: COURSE_DAYS, title: "সমাবর্তন", body: "পাস করলে যাচাইযোগ্য সনদ, নাম ওঠে প্রকাশ্য বোর্ডে।" },
];

/**
 * কোর্স বাছুন — step four of the road, laid out like the department
 * catalogue: every course of every academy side by side, department by
 * department, each card naming its academy. A strip of departments to jump
 * to, the line-up with "আপনি কোথায় আছেন?", the three levels, a course's
 * forty days, and the way on to admission.
 */
export function CoursesView({ entries }: { entries: CourseEntry[] }) {
  const firstOf = new Map<string, string>();
  for (const e of entries) if (!firstOf.has(e.dept.id)) firstOf.set(e.dept.id, e.course.id);

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      <Band
        id="intro"
        n={1}
        label="কোর্স বাছুন"
        now
        note={
          <>
            <Num value={entries.length} />টি কোর্স · <Num value={departments.length} />টি বিভাগ · <Num value={academies.length} />টি একাডেমি
          </>
        }
      >
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            <Num value={entries.length} />টি কোর্স। নিজের <Lean>স্তরে</Lean> শুরু।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            প্রতিটি কোর্স <Num value={COURSE_DAYS} /> দিনের — <Num value={CLASS_WEEKS} /> সপ্তাহ ক্লাস, তারপর নিজের প্রজেক্ট আর প্যানেল। সব একাডেমির সব কোর্স এখানে, বিভাগ ধরে সাজানো। স্তর বেছে নিলে আপনারগুলো আলাদা হয়ে উঠবে।
          </p>
          <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
            <a href="#lineup" className={primaryBtn}>
              <Sparkles className="size-4" aria-hidden />
              স্তর মিলিয়ে দেখুন
            </a>
            <Link href="/media/academy/departments" className={secondaryBtn}>
              <Building2 className="size-4" aria-hidden />
              সব বিভাগ
            </Link>
          </div>
          <ShareRow text="কাণ্ডারী তৈরি একাডেমির সব কোর্স — নিজের স্তরে শুরু করুন" className="mt-6" />

          <nav aria-label="বিভাগের কোর্সে যান" data-reveal data-in className="mt-12">
            <ul className="flex flex-wrap gap-x-3 gap-y-6 sm:gap-x-5">
              {departments.map((d, i) =>
                firstOf.has(d.id) ? (
                  <li key={d.id} style={toneStyle(i)} className="tone">
                    <a href={`#c-${firstOf.get(d.id)}`} className="group flex w-18 flex-col items-center gap-2 sm:w-20">
                      <span className="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none sm:size-20 sm:rounded-[1.3rem]">
                        <DeptIcon dept={d.id} school={d.school} className="size-9 sm:size-12" />
                      </span>
                      <span className="line-clamp-2 text-center text-xs leading-snug font-medium text-(--c-muted) transition-colors group-hover:text-(--c-app-ink)">{d.name}</span>
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>
        </div>
      </Band>

      <Band id="lineup" n={2} label="সব কোর্স" note="বিভাগ ধরে সাজানো, প্রতিটি বিভাগে তিনটি">
        <CourseLineup
          entries={entries}
          last={
            <>
              <p className="hud text-(--c-faint)">এরপর</p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                নিজের কোর্স <Lean>খুলুন</Lean>।
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
                যে কাজ আপনি ভালো পারেন, সেটা <Num value={COURSE_DAYS} /> দিনের কোর্সে সাজিয়ে পড়ান — নিজের নামে বা বন্ধুদের নিয়ে একাডেমি খুলে।
              </p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/teach" className={blockBtn}>
                  একাডেমি খুলুন
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </>
          }
        />
      </Band>

      <Band id="levels" n={3} label="স্তর" note="ভর্তি পরীক্ষা স্তর ঠিক করে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            তিন <Lean>স্তর</Lean>, একই নিয়ম।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            প্রতিটি কোর্সে স্তর লেখা থাকে। ভর্তির সময় চার প্রশ্নের ভর্তি পরীক্ষা মিলিয়ে দেয়, আপনি ঠিক জায়গায় বসছেন কি না।
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3">
          {LEVEL_ORDER.map((l, i) => {
            const list = entries.filter((e) => e.course.level === l);
            return (
              <li key={l} data-reveal className="flex flex-col bg-(--c-bg) p-6 md:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
                  <p className="hud text-(--c-muted)">
                    <Num value={list.length} />টি কোর্স
                  </p>
                </div>
                <h3 className="display mt-6 text-3xl text-(--c-ink-strong)">{LEVELS[l]}</h3>
                <p className="mt-2 leading-relaxed text-(--c-muted)">{LEVEL_NOTE[l]}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5 pt-1">
                  {list.map((e) => (
                    <li key={e.course.id} style={toneStyle(e.tone)} className="tone">
                      <a
                        href={`#c-${e.course.id}`}
                        title={e.course.title}
                        className="hud block border border-(--c-line) px-1.5 py-px font-mono tracking-[0.06em] text-(--c-app-ink) transition-colors duration-150 hover:border-transparent hover:bg-(--c-app) hover:text-black"
                      >
                        {e.course.id}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Band>

      <Band id="days" n={4} label="চল্লিশ দিন" note="প্রতিটি কোর্স একই ছন্দে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            <Num value={COURSE_DAYS} /> দিন, <Lean>একটাই</Lean> ছন্দ।
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            যে কোর্সই নিন, শুরু থেকে সমাবর্তন পর্যন্ত পথটা এক। বছরের পর বছর নয় — দেড় মাসেরও কম।
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {DAYS.map((d, i) => (
            <li key={i} data-reveal style={toneStyle(i)} className="tone flex flex-col bg-(--c-bg) p-6 last:sm:col-span-2 last:md:col-span-2 last:lg:col-span-1">
              <span aria-hidden className="h-1 w-8 bg-(--c-app)" />
              <p className="hud mt-5 text-(--c-faint)">
                দিন <Num value={d.from} />
                {d.to !== d.from && (
                  <>
                    –<Num value={d.to} />
                  </>
                )}
              </p>
              <h3 className="display mt-2 text-xl text-(--c-ink-strong)">{d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--c-muted)">{d.body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="start" rulerLabel="শুরু করুন">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">
            ধাপ <Num value={4} /> থেকে ধাপ <Num value={5} />
          </p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            কোর্স বাছুন, <Lean>ভর্তি</Lean> হোন।
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">পছন্দের কোর্সে ঢুকে “ভর্তি হোন” চাপুন — এক ফর্মে নাম, মোবাইল, ব্যাচ আর পেমেন্ট। ফি থাকে এসক্রোতে, ক্লাস হলে তবেই শিক্ষক পান।</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/media/academy/checkout" className={primaryBtn}>
              <Ticket className="size-4" aria-hidden />
              ভর্তির ফর্ম
            </Link>
            <Link href="/media/academy/departments" className={secondaryBtn}>
              সব বিভাগ
            </Link>
          </div>
        </div>
      </Band>

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
