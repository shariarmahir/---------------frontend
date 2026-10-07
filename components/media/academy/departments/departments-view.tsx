"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, History, Info, X } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { classVideos, courses, coursesOf, departments, getCourse } from "@/data/media/academy";
import { useAuth } from "@/lib/auth/client";
import { LEVELS, SCHOOLS, progressOf, weekOf, type Course, type Level, type School } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { Reveal } from "../home/motion-bits";
import { useAcademy } from "../use-academy";
import { AudienceStrip, DeptFooter } from "./dept-footer";
import { ExploreNav } from "./explore-nav";
import { HeroDeck } from "./hero-deck";
import { ChipBand, CourseTile, RowPanel, VideoTile, courseRow, ratingOf, videoRow, type BandTab } from "./parts";
import { Categories, Doors, Promos, TeacherPills } from "./promos";
import { Faq, Outcome, Voices } from "./proof";
import { useRecentCourses } from "./recent";
import { RoleCard } from "./role-card";

const THIS_WEEK = weekOf(DEMO_NOW.toISOString());
const NEW_DEPT = "/media/academy/teach?dept=new";
const schoolOf = (c: Course) => departments.find((d) => d.id === c.dept)!.school;
const SCHOOL_LIST = (Object.keys(SCHOOLS) as School[]).filter((s) => courses.some((c) => schoolOf(c) === s));
const byRating = (a: Course, b: Course) => (ratingOf(b)?.avg ?? 0) - (ratingOf(a)?.avg ?? 0);
const FREE_CLASSES = classVideos.filter((v) => v.access === "free" && !v.short).sort((a, b) => b.at.localeCompare(a.at));
const STEP = 4;
const BANNER_KEY = "academy-depts-banner";

/**
 * বিভাগ ও কোর্স, laid out section by section like a big course site's home:
 * who it is for, its own bar with a wide menu and search, a welcome, a
 * notice, the carousel, what you looked at, new and popular, three tabbed
 * bands, two promos, the teachers, three doors, categories, trending lists,
 * the departments as role cards, the outcome, learners' words, starting a
 * department, questions, and the big footer.
 */
export function DepartmentsView() {
  const [school, setSchool] = useState<string>(SCHOOL_LIST[0]);
  const [shown, setShown] = useState(STEP);

  const levelTabs: BandTab[] = (Object.keys(LEVELS) as Level[]).map((l) => ({
    id: l,
    label: LEVELS[l],
    items: courses
      .filter((c) => c.level === l)
      .sort(byRating)
      .map((c) => ({ key: c.id, node: <CourseTile course={c} /> })),
  }));
  const schoolTabs: BandTab[] = SCHOOL_LIST.map((s) => ({
    id: s,
    label: SCHOOLS[s],
    items: courses
      .filter((c) => schoolOf(c) === s)
      .sort(byRating)
      .map((c) => ({ key: c.id, node: <CourseTile course={c} /> })),
  }));
  const freeTabs: BandTab[] = SCHOOL_LIST.map((s) => ({
    id: s,
    label: SCHOOLS[s],
    items: FREE_CLASSES.filter((v) => getCourse(v.course) && schoolOf(getCourse(v.course)!) === s).map((v) => ({ key: v.id, node: <VideoTile video={v} surface="black" /> })),
  })).filter((t) => t.items.length);

  return (
    <div>
      <AudienceStrip />
      <ExploreNav onSchool={setSchool} onAllDepts={() => setShown(departments.length)} />
      <Welcome />
      <div className="mx-auto max-w-7xl space-y-14 pt-8 pb-16">
        <Notice />
        <HeroDeck />
        <ChipBand id="by-level" tone="green" title="যে স্তরেই থাকুন, এখান থেকে শুরু" body="একদম নতুন, কিছুটা জানেন, বা অভিজ্ঞ — ভর্তি পরীক্ষা ঠিক করে দেয় কোন স্তরে বসবেন।" cta={{ href: "/media/academy/admission", label: "ভর্তি পরীক্ষা দিন" }} tabs={levelTabs} />
        <Promos />
        <TeacherPills />
        <Doors />
        <Categories />
        <ChipBand id="job-ready" tone="gold" title="কাজের জন্য তৈরি হন" body="আগে অভিজ্ঞতা লাগবে না — বেশির ভাগ কোর্স শুরু হয় একদম গোড়া থেকে।" cta={{ href: "#departments", label: "সব বিভাগ" }} tabs={schoolTabs} tab={school} onTab={setSchool} />
        <Trending />
        <Resume />
        <ChipBand id="free" tone="ink" title="বিনামূল্যে শিখুন, প্রতি সপ্তাহে" body="প্রত্যেক শিক্ষক সপ্তাহে একটা পুরো ক্লাস সবার জন্য খুলে দেন। আগে দেখুন, পছন্দ হলে ভর্তি হন।" cta={{ href: "/media/academy/videos", label: "সব ক্লাস ভিডিও" }} tabs={freeTabs} />
        <NewAndPopular />
        <Roles shown={shown} setShown={setShown} />
        <Outcome />
        <Voices />
        <StartCta />
        <Faq />
      </div>
      <DeptFooter />
    </div>
  );
}

/* ── Welcome and notice ────────────────────────────────────────────── */

function Welcome() {
  const hydrated = useHydrated();
  const { account } = useAuth();
  const name = hydrated && account ? account.name.split(" ")[0] : "";
  return (
    <section className="-mx-3 bg-bd-green px-3 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 py-7">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">স্বাগতম{name && `, ${name}`}</h1>
        <p className="text-sm font-semibold text-white/85">
          <Num value={departments.length} />টি বিভাগ · <Num value={courses.length} />টি কোর্স · প্রতি সপ্তাহে বিনামূল্যের ক্লাস
        </p>
      </div>
    </section>
  );
}

/** The weekly free class, said once; closing it keeps it closed for this visit. */
function Notice() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after mount; storage is not there on the server
      setOpen(sessionStorage.getItem(BANNER_KEY) !== "closed");
    } catch {
      setOpen(true);
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(BANNER_KEY, "closed");
    } catch {
      /* private mode: it just comes back next visit */
    }
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside aria-label="জানা দরকার" initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
          <div className="flex items-start gap-3 rounded-2xl bg-text-primary px-5 py-4 ring-1 ring-white/12">
            <Info className="mt-0.5 size-5 shrink-0 fill-signal-orange text-text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">প্রতি সপ্তাহে প্রত্যেক শিক্ষকের একটা ক্লাস বিনামূল্যে</p>
              <p className="mt-0.5 text-sm text-white/80">
                ভর্তির আগে দেখে নিন কে কেমন শেখান।{" "}
                <Link href="/media/academy/videos" className="font-semibold text-signal-orange hover:underline">
                  ক্লাস ভিডিও দেখুন
                </Link>{" "}
                — পছন্দ হলে বিভাগে যোগ দিন।
              </p>
            </div>
            <button type="button" onClick={close} className="grid size-8 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
              <X className="size-5" aria-hidden />
              <span className="sr-only">বন্ধ করুন</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ── Resume your exploration ───────────────────────────────────────── */

/**
 * What you were looking at: the courses you are in (with how far along),
 * the course pages you opened last on this device, and courses like them.
 */
function Resume() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const admissions = useAcademy((a) => a.admissions);
  const recent = useRecentCourses();
  const mine = hydrated ? Object.entries(enrolled).flatMap(([id, e]) => (getCourse(id) ? [{ course: getCourse(id)!, e }] : [])) : [];

  // Like what you looked at: the same departments first, then the same schools; never what is already shown.
  const seenIds = new Set([...recent.map((c) => c.id), ...mine.map((m) => m.course.id)]);
  const seedDepts = new Set([...recent.map((c) => c.dept), ...(hydrated ? Object.keys(admissions) : [])]);
  const seedSchools = new Set(courses.filter((c) => seedDepts.has(c.dept)).map(schoolOf));
  const similar = courses
    .filter((c) => !seenIds.has(c.id))
    .map((c) => ({ c, rank: seedDepts.has(c.dept) ? 0 : seedSchools.has(schoolOf(c)) ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || byRating(a.c, b.c))
    .slice(0, 3)
    .map((x) => x.c);

  return (
    <section id="my-learning" aria-labelledby="resume-title" className="scroll-mt-20">
      <h2 id="resume-title" className="flex items-center gap-2.5 text-xl font-bold text-white sm:text-2xl">
        আবার শুরু করুন <History className="size-5 text-white/70" aria-hidden />
      </h2>

      {mine.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mine.map(({ course, e }) => {
            const p = progressOf(course, e);
            const pct = Math.round((p.attended / course.lessons.length) * 100);
            return (
              <li key={course.id}>
                <Link href={`/media/academy/course/${course.id}`} className="group flex gap-4 rounded-2xl bg-text-primary p-3 ring-1 ring-white/12 transition-colors hover:ring-signal-orange/50">
                  <span className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={course.image} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-white/60">চলছে · {course.id}</span>
                    <span className="block truncate font-bold text-white group-hover:text-signal-orange">{course.title}</span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-signal-orange" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="mt-1 block text-xs text-white/65">
                      <Num value={p.attended} />/<Num value={course.lessons.length} /> সপ্তাহ · {p.eligible ? "ফাইনালের জন্য তৈরি" : "চলছে"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RowPanel title="সম্প্রতি দেখেছেন" rows={recent.slice(0, 3).map(courseRow)} empty="কোনো কোর্সের পাতা খুললে সেটা এখানে থাকবে — এই ফোনে, শুধু আপনার জন্য।" />
        <RowPanel title={recent.length || seedDepts.size ? "আপনার আগ্রহের সাথে মেলে" : "শুরু করার জন্য ভালো"} rows={similar.map(courseRow)} delay={0.08} />
      </div>
    </section>
  );
}

/* ── New and popular, trending ─────────────────────────────────────── */

function NewAndPopular() {
  return (
    <section id="popular" aria-labelledby="popular-title" className="scroll-mt-20">
      <h2 id="popular-title" className="text-xl font-bold text-white sm:text-2xl">
        নতুন ও জনপ্রিয়
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <RowPanel title="সবচেয়ে জনপ্রিয়" href="#job-ready" rows={[...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 3).map(courseRow)} />
        <RowPanel title="এ সপ্তাহের বিনামূল্যের ক্লাস" href="/media/academy/videos" rows={FREE_CLASSES.filter((v) => weekOf(v.at) === THIS_WEEK).sort((a, b) => b.views - a.views).slice(0, 3).map(videoRow)} delay={0.08} />
        <RowPanel title="বিনা ফি ও শুরু থেকে" href="#by-level" rows={courses.filter((c) => c.level === "foundation").sort((a, b) => a.fee - b.fee || byRating(a, b)).slice(0, 3).map(courseRow)} delay={0.16} />
      </div>
    </section>
  );
}

/** The three schools with the most courses, each a list of its best-rated. */
function Trending() {
  const top = [...SCHOOL_LIST].sort((a, b) => courses.filter((c) => schoolOf(c) === b).length - courses.filter((c) => schoolOf(c) === a).length).slice(0, 3);
  return (
    <section aria-labelledby="trending-title">
      <h2 id="trending-title" className="text-xl font-bold text-white sm:text-2xl">
        এখন যা বেশি খোঁজা হচ্ছে
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {top.map((s, i) => {
          const first = departments.find((d) => d.school === s)!;
          return (
            <RowPanel key={s} title={SCHOOLS[s]} href={`/media/academy/dept/${first.id}`} rows={courses.filter((c) => schoolOf(c) === s).sort(byRating).slice(0, 3).map(courseRow)} delay={i * 0.08} />
          );
        })}
      </div>
    </section>
  );
}

/* ── Departments as role cards ─────────────────────────────────────── */

function Roles({ shown, setShown }: { shown: number; setShown: (n: number) => void }) {
  const hydrated = useHydrated();
  const admissions = useAcademy((a) => a.admissions);
  // Joined departments first, then the busiest.
  const order = [...departments].sort((a, b) => Number(hydrated && b.id in admissions) - Number(hydrated && a.id in admissions) || coursesOf(b.id).length - coursesOf(a.id).length);
  const left = order.length - shown;

  return (
    <section id="departments" aria-labelledby="roles-title" className="scroll-mt-20">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <h2 id="roles-title" className="text-xl font-bold text-white sm:text-2xl">
          আপনার দক্ষতায় এগিয়ে যান
        </h2>
        <button type="button" onClick={() => setShown(order.length)} className="text-sm font-semibold text-signal-orange hover:underline">
          সব দেখুন →
        </button>
      </div>
      <p className="mt-1 text-sm text-white/65">প্রতিটা বিভাগ দল বেঁধে চালান পেশাদারেরা — কোর্স শেষে প্রকাশ্য ফাইনাল আর সার্টিফিকেট।</p>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatePresence initial={false}>
          {order.slice(0, shown).map((d, i) => (
            <motion.li key={d.id} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay: (i % STEP) * 0.07, ease: [0.22, 1, 0.36, 1] }}>
              <RoleCard dept={d} tone={i % 2 ? "gold" : "green"} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {left > 0 ? (
          <>
            <button type="button" onClick={() => setShown(shown + STEP)} className={mediaButton({ variant: "outline" })}>
              আরও <Num value={Math.min(STEP, left)} />টি দেখুন
            </button>
            <button type="button" onClick={() => setShown(order.length)} className="text-sm font-semibold text-signal-orange hover:underline">
              সব বিভাগ দেখুন
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setShown(STEP)} className={mediaButton({ variant: "outline" })}>
            কম দেখান
          </button>
        )}
        <Link href={NEW_DEPT} className="ml-auto text-sm font-semibold text-white/75 hover:text-signal-orange">
          আপনার দক্ষতার বিভাগ নেই? খুলুন →
        </Link>
      </div>
    </section>
  );
}

/* ── Open one ──────────────────────────────────────────────────────── */

function StartCta() {
  return (
    <Reveal>
      <section id="start" aria-labelledby="start-title" className="grid scroll-mt-20 items-center gap-8 overflow-hidden rounded-3xl bg-text-primary p-6 ring-1 ring-white/12 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h2 id="start-title" className="text-2xl leading-snug font-extrabold text-white sm:text-3xl">
            দল আছে? <span className="text-signal-orange">নিজের বিভাগ খুলুন।</span>
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-white/75">
            বন্ধু বা সহকর্মীরা মিলে বিভাগ খুলুন — বিশ্ববিদ্যালয়ের অনুষদের মতো দল বেঁধে হাতে-কলমের দক্ষতা শেখান। প্রমাণ দিন, প্যানেলের ইন্টারভিউ দিন, তারপর প্রতি সপ্তাহে একটা ক্লাস সবার জন্য খুলে দিন।
          </p>
          <Link href={NEW_DEPT} className={mediaButton({ size: "lg", className: "group/btn mt-6" })}>
            বিভাগ খুলুন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <TeamForms />
      </section>
    </Reveal>
  );
}

/** Three people walking together, and a department rising over them with its flag. */
function TeamForms() {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const on = seen && !reduce;
  const loop = (times: number[]) => ({ duration: 3.2, times, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" as const });
  const people = [
    { from: -40, x: 46, tone: "fill-bd-green" },
    { from: 0, x: 80, tone: "fill-signal-orange" },
    { from: 40, x: 114, tone: "fill-white" },
  ];
  return (
    <svg ref={ref} viewBox="0 0 160 130" className="mx-auto w-full max-w-60" aria-hidden>
      <rect x="10" y="120" width="140" height="4" rx="2" className="fill-white/15" />
      <motion.g style={{ originX: 0.5, originY: 1 }} animate={on ? { scaleY: [0, 0, 1, 1, 0] } : { scaleY: 1 }} transition={loop([0, 0.35, 0.55, 0.92, 1])}>
        <rect x="42" y="44" width="76" height="34" rx="4" className="fill-bd-green" />
        <path d="M36 46 L80 20 L124 46 Z" className="fill-signal-orange" />
        {[54, 70, 86, 102].map((x) => (
          <rect key={x} x={x} y="52" width="5" height="22" rx="1.5" className="fill-white/85" />
        ))}
      </motion.g>
      <motion.g animate={on ? { y: [16, 16, 16, 0, 0, 16], opacity: [0, 0, 0, 1, 1, 0] } : { y: 0, opacity: 1 }} transition={loop([0, 0.4, 0.55, 0.65, 0.92, 1])}>
        <rect x="79" y="2" width="2.5" height="20" className="fill-white" />
        <path d="M81.5 3 h14 l-4 4 l4 4 h-14 Z" className="fill-white" />
      </motion.g>
      {people.map((p, i) => (
        <motion.g key={i} animate={on ? { x: [p.from, 0, 0, 0, p.from] } : { x: 0 }} transition={loop([0, 0.3, 0.6, 0.92, 1])}>
          <circle cx={p.x} cy="90" r="7" className={p.tone} />
          <rect x={p.x - 8} y="99" width="16" height="20" rx="7" className={p.tone} />
        </motion.g>
      ))}
    </svg>
  );
}
