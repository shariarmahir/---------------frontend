import Link from "next/link";
import { ArrowRight, Award, BookOpen, CalendarDays, Landmark, ShieldCheck, UsersRound, Video, type LucideIcon } from "lucide-react";
import { academies } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_COURSES, FINAL_DAYS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { Band, BandTitle, Lean, twoDigits } from "./band";
import { blockBtn, primaryBtn, secondaryBtn } from "./buttons";
import { CatalogueNav } from "./catalogue-nav";
import { CategoryStrip } from "./category-strip";
import { CatalogueRoot } from "./catalogue-root";
import { DeptCard } from "./dept-card";
import type { DeptEntry } from "./entries";
import { fillRow, lineupGrid } from "./fill-row";
import { CatalogueRuler } from "./ruler";
import { Tx } from "../../ui/language";

/** The rules every department keeps, each from the academy's own constants. */
const RULES: { Icon: LucideIcon; title: React.ReactNode; body: React.ReactNode }[] = [
  {
    Icon: BookOpen,
    title: <Tx k="ঠিক {0}টি কোর্স" v={[<Num key="n" value={DEPT_COURSES} />]} />,
    body: <Tx k="প্রতিটি বিভাগে তিনটি কোর্স, স্তর লেখা থাকে — শুরু থেকে, মাঝারি বা অভিজ্ঞ। যেখানে আছেন, সেখান থেকে ধরুন।" />,
  },
  {
    Icon: CalendarDays,
    title: <Tx k="{0} দিনে শেষ" v={[<Num key="n" value={COURSE_DAYS} />]} />,
    body: <Tx k="{0} সপ্তাহ ক্লাস, তারপর {1} দিন নিজের প্রজেক্ট আর প্যানেল। বছরের পর বছর নয়।" v={[<Num key="a" value={CLASS_WEEKS} />, <Num key="b" value={FINAL_DAYS} />]} />,
  },
  {
    Icon: UsersRound,
    title: <Tx k="ছোট ব্যাচ" />,
    body: (
      <Tx
        k="একক একাডেমিতে এক ব্যাচে বড়জোর {0} জন, দলীয় একাডেমিতে {1} জন — প্রত্যেকে শিক্ষকের চোখের সামনে।"
        v={[<Num key="a" value={BATCH_MAX.solo} />, <Num key="b" value={BATCH_MAX.team} />]}
      />
    ),
  },
  {
    Icon: Video,
    title: <Tx k="{0} মিনিটের লাইভ ক্লাস" v={[<Num key="n" value={CLASS_MINUTES} />]} />,
    body: <Tx k="সপ্তাহে একটা, রুটিনে ঠিক করা দিনে আর সময়ে। না ধরতে পারলে রেকর্ডিং আছে, হোমওয়ার্ক জমা ক্লাসরুমেই।" />,
  },
  {
    Icon: ShieldCheck,
    title: <Tx k="টাকা এসক্রোতে" />,
    body: <Tx k="প্রতিটি ক্লাস হলে সেই সপ্তাহের ভাগ শিক্ষক পান; ক্লাস না হলে সেই ভাগ আপনার কাছে ফেরত আসে।" />,
  },
  {
    Icon: Award,
    title: <Tx k="যাচাইযোগ্য সনদ" />,
    body: <Tx k="খাতার পরীক্ষা নয় — নিজের হাতের প্রজেক্ট আর দুই পরীক্ষকের প্যানেল। পাস করলে সনদের আইডি, নাম ওঠে প্রকাশ্য বোর্ডে।" />,
  },
];

/**
 * বিভাগ — step three of the road, laid out as a catalogue: every
 * department of every academy side by side on charcoal or ash, each card naming
 * the academy that runs it. A strip of their icons to jump to one, the
 * line-up, the rules they all keep, and the way on to the courses.
 */
export function DepartmentsView({ entries }: { entries: DeptEntry[] }) {
  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      <Band id="intro" rulerLabel="বিভাগ" now>
        <div className="px-6 py-14 md:px-10 md:py-20 lg:flex lg:aspect-[16/6] lg:flex-col lg:justify-center lg:py-10">
          <BandTitle as="h1" now>
            <Tx
              k="{0}টি বিভাগ। আপনার একটাই {1}।"
              v={[
                <Num key="n" value={entries.length} />,
                <Lean key="l">
                  <Tx k="পথ" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx
              k="কোড আর যন্ত্র, বাড়ির নকশা, গ্যারেজ আর রান্নাঘর, গান, রং আর তাঁত, ক্যামেরা, হিসাব, সাজ, মাঠ আর অঙ্ক। দেশের {0}টি একাডেমির সব বিভাগ এক জায়গায় — মনের মতোটায় ঢুকে কোর্স দেখুন।"
              v={[<Num key="n" value={academies.length} />]}
            />
          </p>
          <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
            <Link href="/media/academy/courses" className={primaryBtn}>
              <BookOpen className="size-4" aria-hidden />
              <Tx k="সব কোর্স দেখুন" />
            </Link>
            <Link href="/media/academy/academies" className={secondaryBtn}>
              <Landmark className="size-4" aria-hidden />
              <Tx k="একাডেমিগুলো দেখুন" />
            </Link>
          </div>
        </div>
      </Band>

      <CategoryStrip label="বিভাগে সরাসরি যান" items={entries.map(({ dept: d }, i) => ({ id: d.id, href: `#d-${d.id}`, name: d.name, dept: d.id, school: d.school, tone: i }))} />

      <Band id="lineup" n={2} label="সব বিভাগ" note="বিভাগে ঢুকে কোর্স দেখুন">
        <div className="@container">
          <div data-reveal-group className={lineupGrid}>
            {entries.map((entry, i) => (
              <DeptCard key={entry.dept.id} entry={entry} n={i + 1} />
            ))}
            <div data-reveal className={cn("flex flex-col bg-(--c-bg) p-6 md:p-8", fillRow(entries.length))}>
              <p className="hud text-(--c-faint)">
                <Tx k="এরপর" />
              </p>
              <h3 className="display mt-4 text-3xl leading-[1.12] text-(--c-ink-strong)">
                <Tx
                  k="আরও বিভাগ {0}।"
                  v={[
                    <Lean key="l">
                      <Tx k="আসছে" />
                    </Lean>,
                  ]}
                />
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-(--c-muted)">
                <Tx k="কোনো কাজে আপনার হাত পাকা? নিজের নামে বা বন্ধুদের নিয়ে একাডেমি খুলুন — প্রথম বিভাগ চালু হবে আপনার হাতেই।" />
              </p>
              <div className="mt-auto pt-8">
                <Link href="/media/academy/teach" className={blockBtn}>
                  <Tx k="একাডেমি খুলুন" />
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Band>

      <Band id="rules" n={3} label="নিয়ম" note="সব বিভাগে একই">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle>
            <Tx
              k="শেখার নিয়ম {0} এক।"
              v={[
                <Lean key="l">
                  <Tx k="সবখানে" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx k="যে বিভাগেই পড়ুন, শেখা চলে একই নিয়মে। ভর্তির আগেই জেনে নিন কী পাচ্ছেন।" />
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-3">
          {RULES.map(({ Icon, title, body }, i) => (
            <li key={i} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="flex size-10 items-center justify-center border border-(--c-line) text-(--c-accent-ink)">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              </div>
              <h3 className="display mt-6 text-2xl text-(--c-ink-strong)">{title}</h3>
              <p className="mt-2 leading-relaxed text-(--c-muted)">{body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="start" rulerLabel="এরপর কোর্স">
        <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
          <p className="hud text-(--c-faint)">
            <Tx k="একাডেমি → বিভাগ → কোর্স" />
          </p>
          <BandTitle className="mt-6 max-w-4xl text-5xl leading-[1.08] text-balance sm:text-6xl xl:text-7xl">
            <Tx
              k="বিভাগ দেখলেন, এবার {0}।"
              v={[
                <Lean key="l">
                  <Tx k="কোর্স" />
                </Lean>,
              ]}
            />
          </BandTitle>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            <Tx k="সব বিভাগের সব কোর্স পাশাপাশি — নিজের স্তর মিলিয়ে দেখুন, তারপর ভর্তি। কোনটা আপনার, বুঝতে না পারলে প্রথম পাতার তিন প্রশ্নের উত্তর দিন।" />
          </p>
          <div className="mt-10">
            <Link href="/media/academy/courses" className={primaryBtn}>
              <Tx k="কোর্সে চলুন" />
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Band>
    </CatalogueRoot>
  );
}
