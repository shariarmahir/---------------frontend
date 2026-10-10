"use client";

import Link from "next/link";
import { ArrowRight, Award, Check, Flag, GraduationCap } from "lucide-react";
import { board, departments, getCourse, getDepartment } from "@/data/media/academy";
import { MIN_ATTENDANCE, MIN_HOMEWORK, progressOf, type Course, type Enrollment } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { AssetCard, AssetGrid } from "../catalogue/asset-card";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { useAcademy } from "../use-academy";

const pct = (n: number) => Math.round(n * 100);
const mean = (m: number[]) => Math.round(m.reduce((a, b) => a + b, 0) / m.length);
const toneOf = (c?: Course) => departments.findIndex((d) => d.id === c?.dept);

/**
 * সমাবর্তন — step nine, the gown and the cap, in the catalogue's bands. For
 * each course the learner is in, the five boxes between them and
 * graduating, ticked as they fill, with the goal they wrote at the start;
 * then the graduates' wall from the public board, the way a convocation
 * reads out its names.
 */
export function GraduationView() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const dreams = useAcademy((a) => a.dreams);
  const mine = Object.entries(enrolled).flatMap(([id, e]) => {
    const c = getCourse(id);
    return c ? [{ course: c, e }] : [];
  });
  const wall = board.filter((s) => s.certificate && s.marks).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="সমাবর্তন" now note="পাঁচটা ঘর, তারপর সনদ">
        <div className="flex flex-col items-center px-6 py-16 text-center md:py-24">
          <span data-reveal data-in className="grid size-20 place-items-center bg-(--c-signal) text-black">
            <GraduationCap className="size-10" aria-hidden />
          </span>
          <BandTitle as="h1" now className="mt-8 max-w-4xl text-balance">
            গাউন-টুপির <Turn>দিন</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            হাজিরা, হোমওয়ার্ক, নিজের প্রজেক্ট আর প্যানেল — পাঁচটা ঘর পূরণ হলেই যাচাইযোগ্য সনদ, নাম ওঠে প্রকাশ্য বোর্ডে। কোথায় আছেন, নিচে দেখুন।
          </p>
        </div>
      </Band>

      {!hydrated ? (
        <Band id="mine" n={2} label="আমার পথ">
          <span aria-hidden className="block h-72 animate-pulse bg-(--c-bg-sunken)" />
        </Band>
      ) : mine.length === 0 ? (
        <Band id="mine" n={2} label="আমার পথ" note="ভর্তি দিয়ে শুরু">
          <div className="flex flex-col items-center px-6 py-16 text-center md:py-20">
            <h2 className="display text-3xl text-(--c-ink-strong)">
              পথ শুরু হয় <Turn>ভর্তি</Turn> দিয়ে।
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-(--c-muted)">একটা কোর্সে ভর্তি হলে এখানে আপনার পাঁচটা ঘর দেখা যাবে।</p>
            <Link href="/media/academy/courses" className={cn(primaryBtn, "mt-8")}>
              কোর্স দেখুন <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Band>
      ) : (
        <Band
          id="mine"
          n={2}
          label="আমার পথ"
          note={
            <>
              <Num value={mine.length} />
              টি কোর্স
            </>
          }
        >
          {mine.map(({ course, e }) => (
            <Road key={course.id} course={course} e={e} dream={dreams?.[getDepartment(course.dept)?.academy.id ?? ""]?.line} />
          ))}
        </Band>
      )}

      <Band id="wall" n={3} label="গ্র্যাজুয়েটদের দেয়াল" rulerLabel="দেয়াল" note="যাঁরা সম্প্রতি সনদ পেলেন">
        <AssetGrid count={wall.length}>
          {wall.map((s, i) => {
            const c = getCourse(s.course);
            return (
              <li key={s.id} style={toneStyle(toneOf(c))} className="tone bg-(--c-bg)">
                <AssetCard
                  kind={{
                    icon: Award,
                    label: (
                      <>
                        {s.district} · গড় <Num value={mean(s.marks!)} />
                      </>
                    ),
                  }}
                  n={i + 1}
                  title={<span className="turn text-3xl">{s.learner}</span>}
                  text={
                    <>
                      <p className="font-semibold text-(--c-app-ink)">{c?.title}</p>
                      <p className="mt-1.5">{s.project}</p>
                    </>
                  }
                  extra={
                    <p className="hud mt-4 flex flex-wrap gap-x-3 text-(--c-faint)">
                      <DateText iso={s.at} />
                      <span className="font-mono text-(--c-accent-ink)">{s.certificate}</span>
                    </p>
                  }
                  action={{ href: `/media/academy/exam?id=${s.certificate}#verify`, label: "সনদ যাচাই", icon: Award }}
                />
              </li>
            );
          })}
        </AssetGrid>
        <div className="border-t border-(--c-line) px-6 py-4 md:px-10">
          <Link href="/media/academy/exam#board" className="hud inline-flex items-center gap-1.5 font-bold text-(--c-accent-ink) underline-offset-4 hover:underline">
            প্রকাশ্য বোর্ড <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Band>

    </CatalogueRoot>
  );
}

/** One course's road to graduation: a meter of five, then the five boxes, ticked as they fill. */
function Road({ course, e, dream }: { course: Course; e: Enrollment; dream?: string }) {
  const p = progressOf(course, e);
  const att = p.attended / course.lessons.length;
  const hw = p.homeworkSet ? p.homeworkDone / p.homeworkSet : 1;
  const room = `/media/academy/classroom/${encodeURIComponent(e.batch ?? course.id)}`;
  const boxes = [
    {
      done: att >= MIN_ATTENDANCE,
      title: "হাজিরা",
      body: (
        <>
          <Num value={pct(att)} />% / লক্ষ্য <Num value={pct(MIN_ATTENDANCE)} />%
        </>
      ),
      href: room,
    },
    {
      done: hw >= MIN_HOMEWORK,
      title: "হোমওয়ার্ক",
      body: (
        <>
          <Num value={pct(hw)} />% / লক্ষ্য <Num value={pct(MIN_HOMEWORK)} />%
        </>
      ),
      href: room,
    },
    { done: Boolean(e.project), title: "প্রজেক্ট", body: e.project ? e.project.title : "শেষ দিনগুলোতে জমা", href: `/media/academy/course/${course.id}#curriculum` },
    { done: Boolean(e.interview), title: "প্যানেল", body: e.interview ? <DateText iso={e.interview} time /> : "প্রজেক্টের পর সময় বাছুন", href: `/media/academy/course/${course.id}#curriculum` },
    { done: false, title: "সনদ", body: "প্যানেলের ফলের পর", href: "/media/academy/exam" },
  ];
  const filled = boxes.filter((b) => b.done).length;

  return (
    <article style={toneStyle(toneOf(course))} className="tone border-b border-(--c-line) last:border-b-0">
      <div className="flex flex-wrap items-center gap-6 px-6 py-6 md:px-10">
        <p className="display shrink-0 text-5xl leading-none text-(--c-ink-strong)">
          <Num value={filled} />
          <span className="text-2xl text-(--c-faint)">
            /<Num value={boxes.length} />
          </span>
        </p>
        <div className="min-w-0 flex-1">
          <p className="hud text-(--c-app-ink)">{getDepartment(course.dept)?.academy.name}</p>
          <h2 className="display mt-1 text-2xl text-(--c-ink-strong)">{course.title}</h2>
          {dream && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-(--c-muted)">
              <Flag className="mt-0.5 size-4 shrink-0 text-(--c-signal)" aria-hidden /> আপনার লক্ষ্য: “{dream}”
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-px px-6 md:px-10" aria-hidden>
        {boxes.map((b) => (
          <span key={b.title} className={cn("h-1.5 flex-1", b.done ? "bg-(--c-app)" : "bg-(--c-line)")} />
        ))}
      </div>
      <ol className="mt-6 grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-5">
        {boxes.map((b, i) => (
          <li key={b.title}>
            <Link href={b.href} className="group flex h-full gap-4 bg-(--c-bg) p-5 transition-colors duration-150 hover:bg-(--c-bg-raised) sm:flex-col">
              <span className={cn("display grid size-10 shrink-0 place-items-center text-base", b.done ? "bg-(--c-good) text-black" : i === filled ? "bg-(--c-signal) text-black" : "border border-(--c-line) text-(--c-faint)")}>
                {b.done ? <Check className="size-5" strokeWidth={3} aria-label="হয়েছে" /> : i === boxes.length - 1 ? <Award className="size-5" aria-hidden /> : <Num value={i + 1} />}
              </span>
              <span className="min-w-0">
                <span className="display block text-lg text-(--c-ink-strong) underline-offset-4 group-hover:underline">{b.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-(--c-muted)">{b.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
