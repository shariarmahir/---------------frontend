"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Award, BadgeCheck, ChevronRight, Flag, GraduationCap, Hammer, MapPin, ShieldCheck, Sparkles, Star, UserRound, UsersRound, Video } from "lucide-react";
import { board, coursesOf, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { CLASS_MINUTES, COURSE_DAYS, DEPT_KINDS, LEVELS, type Academy, type Level } from "@/lib/media/academy";
import { GOALS, fitScore } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { CourseTabs } from "../course/course-tabs";
import { DeptFooter } from "../departments/dept-footer";
import { DeptIcon } from "../departments/dept-icons";
import { RememberAcademy } from "../departments/recent";
import { JOURNEY_QA } from "../finder/journey-faq";
import type { AcademyFacts } from "../finder/facts";
import { Faq } from "../home/plus/faq";
import { PlusCourseCard } from "../home/plus/skills-panel";
import { Voices, type Voice } from "../home/plus/voices";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { FuturePlanner } from "./future-planner";

const TABS = [
  { id: "about", label: "পরিচিতি" },
  { id: "teachers", label: "শিক্ষক" },
  { id: "departments", label: "বিভাগ ও কোর্স" },
  { id: "future", label: "ভবিষ্যৎ" },
  { id: "stories", label: "গল্প" },
  { id: "faq", label: "প্রশ্ন" },
];
const WRAP = "mx-auto max-w-6xl px-4 sm:px-6";
const H2 = "text-[clamp(1.5rem,3vw,2.1rem)] leading-tight font-bold text-balance text-m-ink";
const LEVEL_ORDER: Level[] = ["foundation", "intermediate", "advanced"];

/**
 * An academy's own page, the way a university introduces itself: who they
 * are and why their skill matters, the teachers, the departments and their
 * courses (with a level chooser), the learner's future drawn in dates, the
 * stories of those who passed, and the usual questions. Step ২ of the road.
 */
export function AcademyView({ academy: a, facts: f }: { academy: Academy; facts: AcademyFacts }) {
  const hydrated = useHydrated();
  const first = a.departments[0];
  const media = useAcademy((s) => s.academyMedia[first.id]);
  const finder = useAcademy((s) => s.finder);
  const cover = (hydrated && media?.photo) || f.courses[0]?.image;
  const logo = hydrated ? media?.logo : undefined;
  const bestDept = finder?.goal ? [...a.departments].sort((x, y) => fitScore(y.fit, finder) - fitScore(x.fit, finder))[0] : undefined;
  const passes = board.filter((s) => s.certificate && f.courses.some((c) => c.id === s.course));
  const places = [...new Set(a.departments.map((d) => d.place).filter(Boolean))] as string[];

  return (
    <>
      <RememberAcademy id={a.id} />
      <div className="-mx-3 -mt-6 bg-m-canvas pb-24 sm:-mx-6">
        {/* Hero: the academy's picture behind, its mark, name and promise in front. */}
        <section aria-labelledby="academy-name" className="relative isolate overflow-hidden bg-m-blue-night text-white">
          {cover && <Image src={cover} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(0_31_107/0.96)_25%,rgb(1_63_208/0.72)_65%,rgb(1_63_208/0.35))]" />
          <div className={`${WRAP} pt-6 pb-12 sm:pb-16`}>
            <nav aria-label="অবস্থান" className="flex flex-wrap items-center gap-1 text-sm text-white/75">
              <Link href="/media/academy" className="hover:text-white hover:underline">
                একাডেমি খুঁজুন
              </Link>
              <ChevronRight className="size-4" aria-hidden />
              <span className="font-semibold text-white">{a.name}</span>
            </nav>
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end">
              <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[1.6rem] bg-white shadow-m-lift ring-4 ring-white/30">
                {logo ? <Image src={logo} alt="" width={96} height={96} unoptimized className="size-full object-cover" /> : <DeptIcon dept={first.id} school={first.school} className="size-14" />}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 font-bold ring-1 ring-white/25">
                    {a.kind === "team" ? <UsersRound className="size-3.5" aria-hidden /> : <UserRound className="size-3.5" aria-hidden />}
                    {DEPT_KINDS[a.kind]}
                  </span>
                  <span className="text-white/75">
                    প্রতিষ্ঠা <DateText iso={a.founded} />
                  </span>
                </p>
                <h1 id="academy-name" className="mt-2 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] font-bold text-balance">
                  {a.name}
                </h1>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/90">{a.about}</p>

            {bestDept && finder?.goal && (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-m-yellow px-3.5 py-1.5 text-sm font-bold text-m-ink">
                <Sparkles className="size-4" aria-hidden /> আপনার স্বপ্ন “{GOALS[finder.goal]}” — {bestDept.name} বিভাগ সবচেয়ে মেলে
              </p>
            )}

            <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "বিভাগ", v: <Num value={a.departments.length} /> },
                { k: "কোর্স", v: <Num value={f.courses.length} /> },
                { k: "গ্র্যাজুয়েট", v: <Num value={f.graduates} /> },
                { k: "রেটিং", v: f.rating.count ? <span className="inline-flex items-center gap-1"><Num value={f.rating.avg} /><Star className="size-5 fill-m-yellow text-m-yellow" aria-hidden /></span> : "নতুন" },
              ].map(({ k, v }) => (
                <div key={k} className="flex flex-col-reverse rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
                  <dt className="mt-1 text-xs font-semibold text-white/75">{k}</dt>
                  <dd className="text-2xl leading-none font-bold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#departments" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-m-yellow px-6 text-[15px] font-bold text-m-ink shadow-m-tile transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
                বিভাগ ও কোর্স দেখুন <ArrowRight className="size-4.5" aria-hidden />
              </a>
              <a href="#future" className="inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-[15px] font-bold text-white ring-1 ring-white/50 hover:bg-white/10">
                <Flag className="size-4.5" aria-hidden /> নিজের ভবিষ্যৎ আঁকুন
              </a>
              <span className="flex items-center gap-2 pl-1">
                <span className="flex -space-x-2" aria-hidden>
                  {a.teachers.slice(0, 5).map((h) => (
                    <PersonAvatar key={h} person={personOrThrow(h)} size="sm" className="ring-2 ring-m-blue-night" />
                  ))}
                </span>
                <span className="text-sm text-white/80">
                  <Num value={a.teachers.length} /> জন শিক্ষক
                </span>
              </span>
            </div>
          </div>
        </section>

        <CourseTabs tabs={TABS} />

        {/* পরিচিতি: who they are, why the skill matters, how they teach, what they have done. */}
        <section id="about" aria-labelledby="about-title" className={`${WRAP} scroll-mt-16 pt-14`}>
          <p className="text-sm font-bold text-m-blue">পরিচিতি</p>
          <h2 id="about-title" className={cn(H2, "mt-1")}>
            কেন এই একাডেমি, কেন এই দক্ষতা
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {a.departments.map((d) => (
                <article key={d.id} className="rounded-3xl bg-white p-5 shadow-m-tile ring-1 ring-m-ink/7 sm:p-6">
                  <p className="flex items-center gap-2 text-sm font-bold text-m-blue">
                    <DeptIcon dept={d.id} school={d.school} className="size-6" /> {d.name}
                  </p>
                  <p className="mt-2 text-[17px] leading-relaxed text-m-ink/85">{d.blurb}</p>
                  <p className="mt-4 text-sm font-semibold text-m-ink">কোর্স শেষে আপনি পারবেন</p>
                  <ul className="mt-2 space-y-2">
                    {coursesOf(d.id).map((c) => (
                      <li key={c.id} className="flex gap-2 text-[15px] leading-relaxed text-m-ink/80">
                        <BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-m-green" aria-hidden /> {c.outcome}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { Icon: Video, t: <>প্রতি সপ্তাহে <Num value={CLASS_MINUTES} /> মিনিটের লাইভ ক্লাস</>, s: "রেকর্ডিংও থাকে" },
                  { Icon: Hammer, t: places.length ? "হাতে-কলমের কর্মশালা" : "নিজের হাতে প্রজেক্ট", s: places[0] ?? "শেষে প্যানেলের সামনে" },
                  { Icon: Award, t: "দুই পরীক্ষকের প্যানেল", s: "পাস করলে যাচাইযোগ্য সনদ" },
                  { Icon: ShieldCheck, t: "ফি এসক্রোতে", s: "ক্লাস হলে শিক্ষক পান" },
                ].map(({ Icon, t, s }, i) => (
                  <div key={i} className={cn("rounded-2xl p-4 ring-1 ring-m-ink/6", i % 3 === 0 ? "bg-m-blue-soft" : "bg-white shadow-m-tile")}>
                    <Icon className="size-5 text-m-blue" aria-hidden />
                    <p className="mt-2 text-sm leading-snug font-bold text-m-ink">{t}</p>
                    <p className="mt-0.5 text-xs text-m-ink/60">{s}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-m-blue-night p-5 text-white shadow-m-lift sm:p-6">
                <p className="text-sm font-bold text-m-yellow">যা করে দেখিয়েছে</p>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    [f.graduates, "গ্র্যাজুয়েট"],
                    [passes.length, "বোর্ডে সনদ"],
                    [f.stories, "সফলতার গল্প"],
                  ].map(([n, k]) => (
                    <div key={k as string} className="flex flex-col-reverse">
                      <dt className="mt-1 text-xs text-white/70">{k}</dt>
                      <dd className="text-3xl leading-none font-bold">
                        <Num value={n as number} />
                      </dd>
                    </div>
                  ))}
                </dl>
                {places.length > 0 && (
                  <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-sm text-white/80">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-m-yellow" aria-hidden /> {places.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* শিক্ষক */}
        <section id="teachers" aria-labelledby="teachers-title" className={`${WRAP} scroll-mt-16 pt-20`}>
          <p className="text-sm font-bold text-m-blue">শিক্ষক</p>
          <h2 id="teachers-title" className={cn(H2, "mt-1")}>
            যাঁরা পড়াবেন — প্যানেল ইন্টারভিউ পেরিয়ে আসা
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {a.teachers.map((h) => (
              <li key={h}>
                <TeacherCard handle={h} />
              </li>
            ))}
          </ul>
        </section>

        {/* বিভাগ ও কোর্স */}
        <Departments academy={a} />

        {/* ভবিষ্যৎ */}
        <section id="future" aria-labelledby="future-title" className={`${WRAP} scroll-mt-16 pt-20`}>
          <FuturePlanner academy={a} courses={f.courses} />
        </section>

        {/* গল্প */}
        <section id="stories" className="scroll-mt-16">
          <Stories academy={a} passes={passes.map((p) => ({ learner: p.learner, course: p.course, project: p.project, certificate: p.certificate! }))} />
        </section>

        <section id="faq" className="scroll-mt-16">
          <Faq items={JOURNEY_QA} title="প্রশ্ন আছে?" />
        </section>

        <section aria-labelledby="next-step" className={`${WRAP} pt-20`}>
          <div className="flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-m-blue-soft p-6 ring-1 ring-m-blue/15 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-sm font-bold text-m-blue">পরের ধাপ · ৩</p>
              <h2 id="next-step" className="mt-1 text-2xl font-bold text-m-ink">
                {a.departments.length > 1 ? "একটা বিভাগ বেছে নিন" : `${first.name} বিভাগে ঢুকুন`}
              </h2>
              <p className="mt-1 text-[15px] text-m-ink/70">
                তারপর নিজের স্তরের কোর্স, এক ফর্মে ভর্তি — <Num value={COURSE_DAYS} /> দিনের যাত্রা শুরু।
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.departments.map((d) => (
                <Link key={d.id} href={`/media/academy/dept/${d.id}`} className={mediaButton({ size: "lg" })}>
                  {d.name} <ArrowRight aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      <DeptFooter />
    </>
  );
}

function TeacherCard({ handle }: { handle: string }) {
  const p = personOrThrow(handle);
  const r = teacherRecord(handle);
  const standing = r ? standingOf(r) : null;
  return (
    <Link href={`/media/academy/teachers/${handle}`} className="group flex h-full flex-col items-center rounded-3xl bg-white p-5 text-center shadow-m-tile ring-1 ring-m-ink/7 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-m-lift motion-reduce:transition-none">
      <PersonAvatar person={p} size="xl" className="ring-4 ring-m-blue-soft" />
      <p className="mt-4 font-bold text-m-ink group-hover:text-m-blue">{p.nameBn}</p>
      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-m-ink/60">{r?.title ?? p.headline}</p>
      {standing && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <TierBadge tier={standing.tier} />
          {r!.rating.count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-m-ink">
              <Star className="size-3.5 fill-m-yellow text-m-yellow" aria-hidden /> <Num value={r!.rating.avg} />
            </span>
          )}
        </div>
      )}
      {r && (
        <p className="mt-auto pt-4 text-xs text-m-ink/55">
          <GraduationCap className="mr-1 inline size-3.5 text-m-blue" aria-hidden />
          <Num value={r.graduates} /> জন পাস করেছেন
        </p>
      )}
    </Link>
  );
}

/** Each department with its three courses; "আপনি কোথায় আছেন?" lights the course for that level. */
function Departments({ academy: a }: { academy: Academy }) {
  const [level, setLevel] = useState<Level | null>(null);
  return (
    <section id="departments" aria-labelledby="departments-title" className={`${WRAP} scroll-mt-16 pt-20`}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-m-blue">ধাপ ৩ আর ৪ · বিভাগ ও কোর্স</p>
          <h2 id="departments-title" className={cn(H2, "mt-1")}>
            {a.departments.length > 1 ? (
              <>
                <Num value={a.departments.length} />টি বিভাগ, প্রতিটিতে তিনটি কোর্স
              </>
            ) : (
              "এক বিভাগ, তিনটি কোর্স"
            )}
          </h2>
        </div>
        <div role="group" aria-label="আপনার স্তর" className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-m-ink/70">আপনি কোথায় আছেন?</span>
          {LEVEL_ORDER.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel((x) => (x === l ? null : l))} className={cn("h-10 rounded-full px-4 text-sm font-semibold transition-colors", level === l ? "bg-m-blue text-m-on shadow-m-tile" : "bg-white text-m-ink/75 ring-1 ring-m-ink/10 hover:ring-m-blue/40")}>
              {LEVELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {a.departments.map((d) => {
          const list = [...coursesOf(d.id)].sort((x, y) => LEVEL_ORDER.indexOf(x.level) - LEVEL_ORDER.indexOf(y.level));
          return (
            <div key={d.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/7">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-m-blue-soft">
                    <DeptIcon dept={d.id} school={d.school} className="size-8" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold text-m-ink">{d.name}</span>
                    <span className="block truncate text-sm text-m-ink/60">{d.blurb}</span>
                  </span>
                </span>
                <Link href={`/media/academy/dept/${d.id}`} className={mediaButton({ variant: "outline", size: "sm" })}>
                  বিভাগের পাতা <ArrowRight aria-hidden />
                </Link>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => (
                  <li key={c.id} className={cn("relative rounded-[1.4rem] transition-opacity duration-300", level && (c.level === level ? "ring-3 ring-m-blue ring-offset-4 ring-offset-m-canvas" : "opacity-55"))}>
                    {level === c.level && (
                      <span className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-m-blue px-2.5 py-1 text-xs font-bold text-m-on shadow-m-tile">
                        <Sparkles className="size-3.5" aria-hidden /> আপনার স্তর
                      </span>
                    )}
                    <PlusCourseCard course={c} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stories({ academy: a, passes }: { academy: Academy; passes: { learner: string; course: string; project: string; certificate: string }[] }) {
  const voices: Voice[] = a.teachers.flatMap((h) =>
    (teacherRecord(h)?.stories ?? []).map((st) => ({
      name: st.name,
      text: st.text,
      from: `শিক্ষক ${personOrThrow(h).nameBn}`,
      certificate: passes.find((p) => p.learner === st.name)?.certificate,
    })),
  );
  if (voices.length === 0 && passes.length === 0) return null;
  return (
    <>
      {voices.length > 0 && <Voices voices={voices} title="যাঁরা এখান থেকে পাস করেছেন" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" />}
      {passes.length > 0 && (
        <div className={`${WRAP} pt-8`}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {passes.map((p) => (
              <li key={p.certificate} className="flex gap-3 rounded-2xl bg-white p-4 shadow-m-tile ring-1 ring-m-ink/7">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-m-amber-soft text-m-gold">
                  <Award className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-m-ink">{p.learner}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-m-ink/70">{p.project}</span>
                  <span className="mt-1 block font-mono text-xs text-m-blue">{p.certificate}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
