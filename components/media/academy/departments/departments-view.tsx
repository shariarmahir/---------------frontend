"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, History, Info, X } from "lucide-react";
import { classVideos, courses, coursesOf, departments, getCourse } from "@/data/media/academy";
import { useAuth } from "@/lib/auth/client";
import { LEVELS, SCHOOLS, progressOf, type Course, type Department, type Level, type School } from "@/lib/media/academy";
import { bnDigits } from "@/lib/media/format";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { Reveal } from "../home/motion-bits";
import { useAcademy } from "../use-academy";
import { AudienceStrip, DeptFooter } from "./dept-footer";
import { ExploreNav } from "./explore-nav";
import { HeroDeck } from "./hero-deck";
import { ChipBand, DeptTile, VideoTile, deptRating, type BandTab } from "./parts";
import { PromoDeck } from "./promo-deck";
import { Categories, Doors, Promos, TeacherPills } from "./promos";
import { Outcome, Voices } from "./proof";
import { useRecentCourses, useRecentDepts } from "./recent";
import { RoleCard } from "./role-card";

const NEW_DEPT = "/media/academy/teach?dept=new";
const schoolOf = (c: Course) => departments.find((d) => d.id === c.dept)!.school;
const SCHOOL_LIST = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));
const byRating = (a: Department, b: Department) => (deptRating(b)?.avg ?? 0) - (deptRating(a)?.avg ?? 0);
const joinedOf = (d: Department) => coursesOf(d.id).reduce((n, c) => n + c.enrolled, 0);
/** Departments with a beginners' course, the cheapest such course first. */
const STARTERS = departments
  .flatMap((d) => {
    const fees = coursesOf(d.id).filter((c) => c.level === "foundation").map((c) => c.fee);
    return fees.length ? [{ d, fee: Math.min(...fees) }] : [];
  })
  .sort((a, b) => a.fee - b.fee || byRating(a.d, b.d))
  .map((x) => x.d);
const deptTiles = (list: Department[]) => [...list].sort(byRating).map((d) => ({ key: d.id, node: <DeptTile dept={d} /> }));
const FREE_CLASSES = classVideos.filter((v) => v.access === "free" && !v.short).sort((a, b) => b.at.localeCompare(a.at));
const STEP = 4;
const BANNER_KEY = "academy-depts-banner";

/**
 * বিভাগ (departments only — their courses live on each department page), laid out section by section like a big course site's home:
 * who it is for, its own bar with a wide menu and search, a welcome, a
 * notice, the carousel, three tabbed bands, two promos, the teachers, three
 * doors, categories, what is trending, new and popular (one tabbed row), what
 * you looked at,
 * the departments as role cards, the outcome, learners' words, starting a
 * department, and the big footer.
 */
export function DepartmentsView() {
  const [school, setSchool] = useState<string>(SCHOOL_LIST[0]);
  const [shown, setShown] = useState(STEP);

  // Every band on this page shows departments; their courses live on each department's own page.
  const levelTabs: BandTab[] = (Object.keys(LEVELS) as Level[])
    .map((l) => ({ id: l, label: LEVELS[l], items: deptTiles(departments.filter((d) => coursesOf(d.id).some((c) => c.level === l))) }))
    .filter((t) => t.items.length);
  const schoolTabs: BandTab[] = SCHOOL_LIST.map((s) => ({ id: s, label: SCHOOLS[s], items: deptTiles(departments.filter((d) => d.school === s)) }));
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
        <ChipBand id="by-level" tone="green" title="যে স্তরেই থাকুন, এখান থেকে শুরু" body="একদম নতুন, কিছুটা জানেন, বা অভিজ্ঞ — নিজের স্তরের কোর্স বেছে এক ফর্মেই ভর্তি হোন।" cta={{ href: "/media/academy/departments#departments", label: "কোর্স বেছে নিন" }} tabs={levelTabs} />
        <Promos />
        <TeacherPills />
        <Doors />
        <Categories />
        <ChipBand id="job-ready" tone="gold" title="কাজের জন্য তৈরি হন" body="আগে অভিজ্ঞতা লাগবে না — বেশির ভাগ কোর্স শুরু হয় একদম গোড়া থেকে।" cta={{ href: "#departments", label: "সব বিভাগ" }} tabs={schoolTabs} tab={school} onTab={setSchool} />
        <Trending />
        <PromoDeck />
        <Resume />
        <ChipBand id="free" tone="ink" title="বিনামূল্যে শিখুন, প্রতি সপ্তাহে" body="প্রত্যেক শিক্ষক সপ্তাহে একটা পুরো ক্লাস সবার জন্য খুলে দেন। আগে দেখুন, পছন্দ হলে ভর্তি হন।" cta={{ href: "/media/academy/videos", label: "সব ক্লাস ভিডিও" }} tabs={freeTabs} />
        <Roles shown={shown} setShown={setShown} />
        <Outcome />
        <Voices />
        <StartCta />
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
    <section className="blue-band -mx-3 px-3 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 py-7">
        <h1 className="text-2xl font-bold text-m-on sm:text-3xl">
          স্বাগতম{name && <span className="text-m-yellow">, {name}</span>}
        </h1>
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
          <div className="flex items-start gap-3 rounded-2xl bg-m-card px-5 py-4 ring-1 ring-m-ink/10 shadow-m-tile">
            <Info className="mt-0.5 size-5 shrink-0 fill-m-yellow text-m-ink" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-m-ink">প্রতি সপ্তাহে প্রত্যেক শিক্ষকের একটা ক্লাস বিনামূল্যে</p>
              <p className="mt-0.5 text-sm text-m-ink/80">
                ভর্তির আগে দেখে নিন কে কেমন শেখান।{" "}
                <Link href="/media/academy/videos" className="font-semibold text-m-blue hover:underline">
                  ক্লাস ভিডিও দেখুন
                </Link>{" "}
                — পছন্দ হলে বিভাগে যোগ দিন।
              </p>
            </div>
            <button type="button" onClick={close} className="grid size-8 shrink-0 place-items-center rounded-full text-m-ink/80 hover:bg-m-ink/6 hover:text-m-ink">
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

const tone = (i: number): "gold" | "green" => (i % 2 ? "gold" : "green");

/**
 * What you were looking at, as the same department cards as below: the
 * departments you study in (with how far along), the ones you opened last on
 * this device, and ones like them.
 */
function Resume() {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  const admissions = useAcademy((a) => a.admissions);
  const visitedDepts = useRecentDepts();
  const visitedCourses = useRecentCourses();
  // Departments opened, then the departments of courses opened — each once.
  const recent = [...new Set([...visitedDepts, ...visitedCourses.flatMap((c) => departments.find((d) => d.id === c.dept) ?? [])])];
  const mine = hydrated
    ? departments.flatMap((dept) => {
        const runs = coursesOf(dept.id).flatMap((course) => (enrolled[course.id] ? [{ course, p: progressOf(course, enrolled[course.id]) }] : []));
        return runs.length ? [{ dept, runs }] : [];
      })
    : [];

  // Like what you looked at: the same schools first; never what is already shown.
  const mineIds = new Set(mine.map((m) => m.dept.id));
  const seenRecent = recent.filter((d) => !mineIds.has(d.id));
  const shownIds = new Set([...mineIds, ...seenRecent.map((d) => d.id)]);
  const seedSchools = new Set([...recent.map((d) => d.school), ...(hydrated ? Object.keys(admissions).flatMap((id) => departments.find((d) => d.id === id)?.school ?? []) : [])]);
  const similar = departments
    .filter((d) => !shownIds.has(d.id))
    .map((d) => ({ d, rank: seedSchools.has(d.school) ? 0 : 1 }))
    .sort((a, b) => a.rank - b.rank || byRating(a.d, b.d))
    .map((x) => x.d);

  const cards = [
    ...mine.map(({ dept, runs }) => ({
      dept,
      note: `চলছে · ${bnDigits(runs.length)}টি কোর্স`,
      progress: { done: runs.reduce((n, r) => n + r.p.attended, 0), total: runs.reduce((n, r) => n + r.course.lessons.length, 0), ready: runs.some((r) => r.p.eligible) },
    })),
    ...seenRecent.map((dept) => ({ dept, note: "সম্প্রতি দেখেছেন", progress: undefined })),
    ...similar.map((dept) => ({ dept, note: seedSchools.size ? "আপনার আগ্রহের সাথে মেলে" : "শুরু করার জন্য ভালো", progress: undefined })),
  ].slice(0, Math.max(STEP, mine.length));

  return (
    <section id="my-learning" aria-labelledby="resume-title" className="scroll-mt-20">
      <h2 id="resume-title" className="flex items-center gap-2.5 text-xl font-bold text-m-ink sm:text-2xl">
        আবার শুরু করুন <History className="size-5 text-m-ink/70" aria-hidden />
      </h2>
      <p className="mt-1 text-sm text-m-ink/65">যেখানে ছিলেন, যা দেখেছেন আর যা আপনার পছন্দের সাথে মেলে — এই ফোনে, শুধু আপনার জন্য।</p>
      <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <li key={c.dept.id}>
            <Reveal delay={(i % STEP) * 0.07} className="h-full">
              <RoleCard dept={c.dept} tone={tone(i)} note={c.note} progress={c.progress} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Trending, new and popular — one section ───────────────────────── */

type Pick = { id: string; label: string; list: Department[] };
const PICKS: Pick[] = [
  { id: "popular", label: "সবচেয়ে জনপ্রিয়", list: [...departments].sort((a, b) => joinedOf(b) - joinedOf(a)) },
  { id: "new", label: "নতুন বিভাগ", list: [...departments].sort((a, b) => b.founded.localeCompare(a.founded)) },
  { id: "free", label: "বিনা ফি ও শুরু থেকে", list: STARTERS },
  { id: "rated", label: "সবচেয়ে বেশি রেটিং", list: [...departments].sort(byRating) },
];

/** What is looked at most, what just opened, where to start free, and the best rated — one tabbed row of department cards. */
function Trending() {
  const reduce = useReducedMotion();
  const [id, setId] = useState(PICKS[0].id);
  const pick = PICKS.find((p) => p.id === id) ?? PICKS[0];
  return (
    <section id="popular" aria-labelledby="trending-title" className="scroll-mt-20">
      <h2 id="trending-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        এখন যা বেশি খোঁজা হচ্ছে — নতুন ও জনপ্রিয়
      </h2>
      <div role="tablist" aria-label="এখন যা বেশি খোঁজা হচ্ছে" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pt-1 pb-1 scrollbar-none">
        {PICKS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === pick.id}
            onClick={() => setId(p.id)}
            className={cn("relative h-9 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors", p.id === pick.id ? "text-m-ink" : "text-m-ink ring-1 ring-m-ink/26 hover:bg-m-ink/6")}
          >
            {p.id === pick.id && <motion.span layoutId="trending-pill" className="absolute inset-0 rounded-full bg-m-yellow" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{p.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={pick.id}
          role="tabpanel"
          aria-label={pick.label}
          className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          initial="hide"
          animate="show"
          exit="hide"
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
        >
          {pick.list.slice(0, STEP).map((d, i) => (
            <motion.li key={d.id} variants={{ hide: { opacity: 0, y: reduce ? 0 : 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}>
              <RoleCard dept={d} tone={tone(i)} />
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
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
        <h2 id="roles-title" className="text-xl font-bold text-m-ink sm:text-2xl">
          আপনার দক্ষতায় এগিয়ে যান
        </h2>
        <button type="button" onClick={() => setShown(order.length)} className="text-sm font-semibold text-m-blue hover:underline">
          সব দেখুন →
        </button>
      </div>
      <p className="mt-1 text-sm text-m-ink/65">প্রতিটা বিভাগ দল বেঁধে চালান পেশাদারেরা — কোর্স শেষে প্রকাশ্য ফাইনাল আর সার্টিফিকেট।</p>
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
            <button type="button" onClick={() => setShown(order.length)} className="text-sm font-semibold text-m-blue hover:underline">
              সব বিভাগ দেখুন
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setShown(STEP)} className={mediaButton({ variant: "outline" })}>
            কম দেখান
          </button>
        )}
        <Link href={NEW_DEPT} className="ml-auto text-sm font-semibold text-m-ink/75 hover:text-m-blue">
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
      <section id="start" aria-labelledby="start-title" className="grid scroll-mt-20 items-center gap-8 overflow-hidden rounded-3xl bg-m-card p-6 ring-1 ring-m-ink/10 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] shadow-m-tile">
        <div className="min-w-0">
          <h2 id="start-title" className="text-2xl leading-snug font-extrabold text-m-ink sm:text-3xl">
            দল আছে? <span className="text-m-blue">নিজের বিভাগ খুলুন।</span>
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-m-ink/75">
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
    { from: -40, x: 46, tone: "fill-m-blue" },
    { from: 0, x: 80, tone: "fill-m-yellow" },
    { from: 40, x: 114, tone: "fill-m-ink" },
  ];
  return (
    <svg ref={ref} viewBox="0 0 160 130" className="mx-auto w-full max-w-60" aria-hidden>
      <rect x="10" y="120" width="140" height="4" rx="2" className="fill-m-ink/15" />
      <motion.g style={{ originX: 0.5, originY: 1 }} animate={on ? { scaleY: [0, 0, 1, 1, 0] } : { scaleY: 1 }} transition={loop([0, 0.35, 0.55, 0.92, 1])}>
        <rect x="42" y="44" width="76" height="34" rx="4" className="fill-m-blue" />
        <path d="M36 46 L80 20 L124 46 Z" className="fill-m-yellow" />
        {[54, 70, 86, 102].map((x) => (
          <rect key={x} x={x} y="52" width="5" height="22" rx="1.5" className="fill-m-ink/85" />
        ))}
      </motion.g>
      <motion.g animate={on ? { y: [16, 16, 16, 0, 0, 16], opacity: [0, 0, 0, 1, 1, 0] } : { y: 0, opacity: 1 }} transition={loop([0, 0.4, 0.55, 0.65, 0.92, 1])}>
        <rect x="79" y="2" width="2.5" height="20" className="fill-m-ink" />
        <path d="M81.5 3 h14 l-4 4 l4 4 h-14 Z" className="fill-m-ink" />
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
