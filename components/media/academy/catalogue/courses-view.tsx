import Link from "next/link";
import { ArrowRight, Building2, Sparkles, Ticket } from "lucide-react";
import { departments } from "@/data/media/academy";
import { CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, FINAL_DAYS, LEVELS, type Level } from "@/lib/media/academy";
import { Num } from "../../ui/numerals";
import { Band, BandTitle, Lean, twoDigits } from "./band";
import { blockBtn, primaryBtn, secondaryBtn } from "./buttons";
import { CatalogueNav } from "./catalogue-nav";
import { CategoryStrip } from "./category-strip";
import { CatalogueRoot } from "./catalogue-root";
import { CourseLineup } from "./course-lineup";
import type { CourseEntry } from "./entries";
import { CatalogueRuler } from "./ruler";
import { toneStyle } from "./tones";
import { Tx } from "../../ui/language";

const LEVEL_ORDER: Level[] = ["foundation", "intermediate", "advanced"];
const LEVEL_NOTE: Record<Level, React.ReactNode> = {
  foundation: <Tx k="শূন্য থেকে — আগে কিছু জানা লাগে না।" />,
  intermediate: <Tx k="হাতে কিছু কাজ আছে — এবার পেশাদারের মতো।" />,
  advanced: <Tx k="পেশায় আছেন — বড় কাজ, কঠিন সমস্যা।" />,
};

/** A course's forty days, from the academy's own constants: the weeks of classes, then the project and the panel, then graduation. */
const DAYS: { from: number; to: number; title: React.ReactNode; body: React.ReactNode }[] = [
  ...Array.from({ length: CLASS_WEEKS }, (_, w) => ({
    from: w * 7 + 1,
    to: (w + 1) * 7,
    title: (
      <>
        <Tx k="সপ্তাহ {0}" v={[<Num key="n" value={w + 1} />]} />
      </>
    ),
    body: w === 0 ? <Tx k="{0} মিনিটের লাইভ ক্লাস, সঙ্গে বাড়ির কাজ।" v={[<Num key="n" value={CLASS_MINUTES} />]} /> : <Tx k="ক্লাস, বাড়ির কাজ, আর শিক্ষকের মন্তব্য।" />,
  })),
  {
    from: CLASS_WEEKS * 7 + 1,
    to: COURSE_DAYS,
    title: <Tx k="প্রজেক্ট ও প্যানেল" />,
    body: <Tx k="{0} দিনে নিজের হাতে ফাইনাল প্রজেক্ট, তারপর দুই পরীক্ষকের প্যানেল।" v={[<Num key="n" value={FINAL_DAYS} />]} />,
  },
  { from: COURSE_DAYS, to: COURSE_DAYS, title: <Tx k="সমাবর্তন" />, body: <Tx k="পাস করলে যাচাইযোগ্য সনদ, নাম ওঠে প্রকাশ্য বোর্ডে।" /> },
];

/**
 * কোর্স — step four of the road, laid out like the department
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
      <Band id="intro" rulerLabel="কোর্স" now>
        <div className="px-6 py-14 md:px-10 md:py-20 lg:flex lg:aspect-[16/6] lg:flex-col lg:justify-center lg:py-10">
          <BandTitle as="h1" now>
            <Tx
              k="{0}টি কোর্স। নিজের {1} শুরু।"
              v={[
                <Num key="n" value={entries.length} />,
                <Lean key="l">
                  <Tx k="স্তরে" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx
              k="প্রতিটি কোর্স {0} দিনের — {1} সপ্তাহ ক্লাস, তারপর নিজের প্রজেক্ট আর প্যানেল। সব একাডেমির সব কোর্স এখানে, বিভাগ ধরে সাজানো। স্তর বেছে নিলে আপনারগুলো আলাদা হয়ে উঠবে।"
              v={[<Num key="a" value={COURSE_DAYS} />, <Num key="b" value={CLASS_WEEKS} />]}
            />
          </p>
          <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
            <a href="#lineup" className={primaryBtn}>
              <Sparkles className="size-4" aria-hidden />
              <Tx k="স্তর মিলিয়ে দেখুন" />
            </a>
            <Link href="/media/academy/departments" className={secondaryBtn}>
              <Building2 className="size-4" aria-hidden />
              <Tx k="সব বিভাগ" />
            </Link>
          </div>
        </div>
      </Band>

      <CategoryStrip
        label="বিভাগের কোর্সে যান"
        items={departments.flatMap((d, i) => (firstOf.has(d.id) ? [{ id: d.id, href: `#c-${firstOf.get(d.id)}`, name: d.name, dept: d.id, school: d.school, tone: i }] : []))}
      />

      <Band id="lineup" n={2} label="সব কোর্স" note="বিভাগ ধরে সাজানো, প্রতিটি বিভাগে তিনটি">
        <CourseLineup
          entries={entries}
          last={
            <>
              <p className="hud text-(--c-faint)">
                <Tx k="এরপর" />
              </p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                <Tx
                  k="নিজের কোর্স {0}।"
                  v={[
                    <Lean key="l">
                      <Tx k="খুলুন" />
                    </Lean>,
                  ]}
                />
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
                <Tx k="যে কাজ আপনি ভালো পারেন, সেটা {0} দিনের কোর্সে সাজিয়ে পড়ান — নিজের নামে বা বন্ধুদের নিয়ে একাডেমি খুলে।" v={[<Num key="n" value={COURSE_DAYS} />]} />
              </p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/teach" className={blockBtn}>
                  <Tx k="একাডেমি খুলুন" />
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </>
          }
        />
      </Band>

      <Band id="levels" n={3} label="স্তর" note="প্রতিটি কোর্সে স্তর লেখা থাকে">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            <Tx
              k="তিন {0}, একই নিয়ম।"
              v={[
                <Lean key="l">
                  <Tx k="স্তর" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx k="যেখানে আছেন, সেখান থেকে ধরুন। এক বিভাগের তিনটি কোর্স একটার পর একটা নিলে পুরো দক্ষতা গড়ে ওঠে।" />
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
                    <Tx k="{0}টি কোর্স" v={[<Num key="n" value={list.length} />]} />
                  </p>
                </div>
                <h3 className="display mt-6 text-3xl text-(--c-ink-strong)">
                  <Tx k={LEVELS[l]} />
                </h3>
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
            <Tx
              k="{0} দিন, {1} ছন্দ।"
              v={[
                <Num key="n" value={COURSE_DAYS} />,
                <Lean key="l">
                  <Tx k="একটাই" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx k="যে কোর্সই নিন, শুরু থেকে সমাবর্তন পর্যন্ত পথটা এক। বছরের পর বছর নয় — দেড় মাসেরও কম।" />
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {DAYS.map((d, i) => (
            <li key={i} data-reveal style={toneStyle(i)} className="tone flex flex-col bg-(--c-bg) p-6 last:sm:col-span-2 last:md:col-span-2 last:lg:col-span-1">
              <span aria-hidden className="h-1 w-8 bg-(--c-app)" />
              <p className="hud mt-5 text-(--c-faint)">
                <Tx k="দিন {0}" v={[<Num key="n" value={d.from} />]} />
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
            <Tx k="কোর্স → ভর্তি → ক্লাস" />
          </p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            <Tx
              k="কোর্স দেখলেন, এবার {0}।"
              v={[
                <Lean key="l">
                  <Tx k="ভর্তি" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx k="পছন্দের কোর্সে ঢুকে “ভর্তি হোন” চাপুন — এক ফর্মে নাম, মোবাইল, ব্যাচ আর পেমেন্ট। ফি থাকে এসক্রোতে, ক্লাস হলে তবেই শিক্ষক পান।" />
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/media/academy/checkout" className={primaryBtn}>
              <Ticket className="size-4" aria-hidden />
              <Tx k="ভর্তির ফর্ম" />
            </Link>
            <Link href="/media/academy/departments" className={secondaryBtn}>
              <Tx k="সব বিভাগ" />
            </Link>
          </div>
        </div>
      </Band>
    </CatalogueRoot>
  );
}
