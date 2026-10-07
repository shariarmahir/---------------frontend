"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Binoculars, Rocket, Shuffle, TrendingUp, type LucideIcon } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { classVideos, coursesOf, departments, getCourse, teacherFollowers, teacherRecord, workshops, workshopsOf } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { LEVELS, MATERIAL_KINDS, durationText, type Department, type Level } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Compact, DateText, Num, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { AdmissionTest } from "../admission-test";
import { Reveal } from "../home/motion-bits";
import { RoleCard } from "../departments/role-card";
import { watchHref } from "../videos/video-card";
import { WorkshopBook } from "../workshop-book";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── What brings you here ──────────────────────────────────────────── */

type Purpose = "start" | "change" | "grow" | "hobby";
const PURPOSES: { id: Purpose; label: string; Icon: LucideIcon }[] = [
  { id: "start", label: "পেশা শুরু করতে", Icon: Rocket },
  { id: "change", label: "পেশা বদলাতে", Icon: Shuffle },
  { id: "grow", label: "এখনকার কাজে এগোতে", Icon: TrendingUp },
  { id: "hobby", label: "শখে শিখতে", Icon: Binoculars },
];

/**
 * "আজ কেন এসেছেন?" — four answers. Each turns the course list to the level
 * that suits it and says, in a line, what to do next.
 */
export function Purpose({ levels, onLevel }: { levels: Level[]; onLevel: (l: Level) => void }) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<Purpose | null>(null);
  const lowest = levels[0];
  const highest = levels[levels.length - 1];
  const hint: Record<Purpose, React.ReactNode> = {
    start: (
      <>
        “{LEVELS[lowest]}” স্তরের কোর্স ওপরে বেছে রাখলাম। আগে{" "}
        <a href="#join" className="font-semibold text-m-blue hover:underline">
          ভর্তি পরীক্ষা
        </a>{" "}
        দিন — দশ মিনিট, বিনামূল্যে।
      </>
    ),
    change: <>অন্য কাজ থেকে আসছেন? অভিজ্ঞতার প্রমাণ থাকলে ভর্তি পরীক্ষায় উপরের স্তরে বসতে পারেন। আপাতত “{LEVELS[lowest]}” দেখাচ্ছি।</>,
    grow:
      levels.length > 1 ? (
        <>কাজ জানেন, আরও এগোতে চান — “{LEVELS[highest]}” স্তরের কোর্স ওপরে বেছে রাখলাম।</>
      ) : (
        <>
          এই বিভাগে এখন শুধু “{LEVELS[highest]}” স্তরের কোর্স আছে। কাজ জানলে{" "}
          <a href="#join" className="font-semibold text-m-blue hover:underline">
            ভর্তি পরীক্ষায়
          </a>{" "}
          অভিজ্ঞতার প্রমাণ দিন — তিন বছরের বেশি কাজ আর প্রমাণ থাকলে সরাসরি ফাইনালে বসা যায়।
        </>
      ),
    hobby: (
      <>
        শখের জন্য প্রতি সপ্তাহের{" "}
        <a href="#resources" className="font-semibold text-m-blue hover:underline">
          বিনামূল্যের ক্লাসই
        </a>{" "}
        যথেষ্ট হতে পারে — ভর্তি ছাড়াই দেখা যায়।
      </>
    ),
  };

  function pick(p: Purpose) {
    setPicked(p);
    if (p === "grow") onLevel(highest);
    else if (p !== "hobby") onLevel(lowest);
  }

  return (
    <section aria-labelledby="purpose-title" className="rounded-3xl bg-m-card p-5 ring-1 ring-m-ink/13 sm:p-7 shadow-m-tile">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <h2 id="purpose-title" className="shrink-0 text-xl font-bold text-m-ink xl:mr-4">
          আজ কেন এসেছেন?
        </h2>
        <div role="radiogroup" aria-labelledby="purpose-title" className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PURPOSES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={picked === id}
              onClick={() => pick(id)}
              className={cn("group flex items-center gap-3 rounded-xl p-2 pr-4 text-left font-semibold ring-1 transition-colors", picked === id ? "bg-m-ink text-m-on ring-white" : "text-m-ink ring-m-ink/21 hover:bg-m-ink/4")}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg transition-transform group-hover:-rotate-6 motion-reduce:transition-none", picked === id ? "bg-m-card text-m-blue" : "bg-m-yellow text-m-ink")}>
                <Icon className="size-5" aria-hidden />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {picked && (
          <motion.p key={picked} initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease }} className="mt-4 text-sm text-m-ink/85" aria-live="polite">
            {hint[picked]}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Join ──────────────────────────────────────────────────────────── */

const JOIN_STEPS = [
  { title: "আপনার কথা ও চার প্রশ্ন", body: "কেন শিখতে চান, আগে কত বছর করেছেন — তারপর চারটি সহজ প্রশ্ন। দশ মিনিট, বিনামূল্যে।" },
  { title: "স্তর মিলিয়ে কোর্স", body: "শুরু থেকে, মাঝারি না অভিজ্ঞ — সেই অনুযায়ী কোর্স বাছুন; ফি শুধু কোর্সের।" },
  { title: "প্রথম ক্লাস অনলাইনে", body: "পরিচয় হয়ে গেলে লাইভ আর হাতে-কলমের ক্লাস; শেষে প্রজেক্ট আর প্যানেল।" },
];

export function Join({ dept }: { dept: Department }) {
  return (
    <section id="join" aria-labelledby="join-title" className="scroll-mt-20">
      <h2 id="join-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        ৩ ধাপে যোগ দিন
      </h2>
      <ol className="mt-4 mb-6 grid gap-3 sm:grid-cols-3">
        {JOIN_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-m-yellow text-sm font-bold text-m-ink">
              <Num value={i + 1} />
            </span>
            <span>
              <span className="block font-semibold text-m-ink">{s.title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-m-ink/75">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <AdmissionTest lockDept={dept.id} />
    </section>
  );
}

/* ── Workshops ─────────────────────────────────────────────────────── */

/** The department's hands-on workshops as cards, like a course site's degree cards — or, if it has none, what is coming elsewhere. */
export function Workshops({ dept }: { dept: Department }) {
  const [all, setAll] = useState(false);
  const own = workshopsOf(dept.id);
  const list = own.length ? own : workshops.filter((w) => w.at > DEMO_NOW.toISOString());
  const shown = all ? list : list.slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="ws-title">
      <h2 id="ws-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        হাতে-কলমে শিখুন — কর্মশালায়
      </h2>
      <p className="mt-1 text-sm text-m-ink/75">{own.length ? `ভিডিওতে বোঝার পর নিজের হাতে করে দেখুন${dept.place ? ` — ${dept.place}` : ""}। জায়গাটা প্যানেল নিজে গিয়ে নিরাপত্তা দেখে অনুমোদন দিয়েছে।` : "এই বিভাগের এখনো কর্মশালা নেই — অন্য বিভাগের আসন্ন কর্মশালাগুলো:"}</p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {shown.map((w, i) => {
          const host = personOrThrow(w.host);
          const left = w.seats - w.taken;
          return (
            <li key={w.id}>
              <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-2xl bg-m-card p-2 ring-1 ring-m-ink/13 shadow-m-tile">
                <span className="relative block aspect-video overflow-hidden rounded-xl">
                  <Image src={w.image} alt="" fill sizes="(min-width: 1280px) 18rem, (min-width: 640px) 45vw, 92vw" className="object-cover" />
                </span>
                <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
                  <p className="flex items-center gap-2 text-sm text-m-ink/80">
                    <PersonAvatar person={host} size="xs" /> <span className="truncate">{host.nameBn}</span>
                  </p>
                  <h3 className="mt-1.5 font-bold text-m-ink">{w.title}</h3>
                  <p className="mt-3 text-xs text-m-ink/60">
                    কর্মশালা · <DateText iso={w.at} /> · {w.place}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", left > 0 ? "text-m-ink ring-m-ink/26" : "text-m-ink/60 ring-m-ink/13")}>{left > 0 ? <><Num value={left} />টি আসন বাকি</> : "আসন পূর্ণ"}</span>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-m-ink ring-1 ring-m-ink/26">{w.fee === 0 ? "বিনা ফি" : "হাতে-কলমে"}</span>
                  </p>
                  <div className="mt-auto pt-4">
                    <WorkshopBook workshop={w} />
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
      {list.length > 4 && (
        <button type="button" onClick={() => setAll((a) => !a)} className={mediaButton({ variant: "outline", className: "mt-5" })}>
          {all ? "কম দেখান" : <>আরও <Num value={list.length - 4} />টি দেখুন</>}
        </button>
      )}
    </section>
  );
}

/* ── Learning resources ────────────────────────────────────────────── */

type Card = { key: string; href: string; title: string; body: string; meta: React.ReactNode };

/** "শেখার রিসোর্স": tabs over article-like cards — free classes, materials, teachers, final projects. */
export function Resources({ dept }: { dept: Department }) {
  const reduce = useReducedMotion();
  const { num } = useFormat();
  const list = coursesOf(dept.id);
  const tabs: { id: string; label: string; cards: Card[] }[] = [
    {
      id: "free",
      label: "বিনামূল্যের ক্লাস",
      cards: classVideos
        .filter((v) => v.access === "free" && !v.short && list.some((c) => c.id === v.course))
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((v) => ({
          key: v.id,
          href: watchHref(v),
          title: v.title,
          body: `“${getCourse(v.course)?.title}” কোর্সের সপ্তাহ ${num(v.week)}-এর পুরো ক্লাস — ভর্তি ছাড়াই দেখা যায়।`,
          meta: (
            <>
              <DateText iso={v.at} /> · {num(durationText(v.seconds))} · <Compact n={v.views} /> বার দেখা
            </>
          ),
        })),
    },
    {
      id: "materials",
      label: "উপকরণ",
      cards: list.flatMap((c) =>
        c.materials.map((m) => ({
          key: `${c.id}-${m.title}`,
          href: `/media/academy/course/${c.id}`,
          title: m.title,
          body: `“${c.title}” কোর্সের ${MATERIAL_KINDS[m.kind]} — ভর্তি হলে কোর্সের পাতা থেকে নামানো যায়।`,
          meta: (
            <>
              {MATERIAL_KINDS[m.kind]} · {m.size}
            </>
          ),
        })),
      ),
    },
    {
      id: "teachers",
      label: "শিক্ষক",
      cards: dept.teachers.map((h) => {
        const p = personOrThrow(h);
        return {
          key: h,
          href: `/media/academy/teachers/${h}`,
          title: p.nameBn,
          body: `${teacherRecord(h)?.title ?? p.headline}। ${p.bio}`,
          meta: (
            <>
              <Compact n={teacherFollowers(h)} /> অনুসারী · চ্যানেল দেখুন
            </>
          ),
        };
      }),
    },
    {
      id: "finals",
      label: "ফাইনাল প্রকল্প",
      cards: list.map((c) => ({
        key: c.id,
        href: `/media/academy/course/${c.id}`,
        title: c.title,
        body: c.final,
        meta: (
          <>
            {c.id} · প্যানেলের সামনে প্রকাশ্যে
          </>
        ),
      })),
    },
  ].filter((t) => t.cards.length);
  const [tab, setTab] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];
  if (!active) return null;

  return (
    <section id="resources" aria-labelledby="res-title" className="scroll-mt-20">
      <h2 id="res-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        শেখার রিসোর্স
      </h2>
      <div role="tablist" aria-label="রিসোর্স" className="mt-3 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active.id}
            onClick={() => setTab(t.id)}
            className={cn("relative h-9 rounded-full px-4 text-sm font-semibold transition-colors", t.id === active.id ? "text-m-ink" : "text-m-ink ring-1 ring-m-ink/26 hover:bg-m-ink/6")}
          >
            {t.id === active.id && <motion.span layoutId="res-tab" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul key={active.id} role="tabpanel" aria-label={active.label} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
          {active.cards.slice(0, 8).map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="group flex h-full min-h-56 flex-col rounded-2xl bg-m-card p-4 ring-1 ring-m-ink/13 transition-colors hover:ring-m-blue/50 shadow-m-tile">
                <h3 className="font-bold text-m-ink underline-offset-2 group-hover:underline">{c.title}</h3>
                <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-m-ink/70">{c.body}</p>
                <p className="mt-auto pt-4 text-xs text-m-ink/55">{c.meta}</p>
              </Link>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </section>
  );
}

/* ── Success stories ───────────────────────────────────────────────── */

export function Stories({ dept }: { dept: Department }) {
  const stories = dept.teachers.flatMap((h) => (teacherRecord(h)?.stories ?? []).map((s) => ({ ...s, handle: h })));
  if (stories.length === 0) return null;
  return (
    <section aria-labelledby="stories-title">
      <h2 id="stories-title" className="text-2xl font-bold text-m-ink sm:text-[1.9rem]">
        সফলতার গল্প
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stories.slice(0, 4).map((s, i) => {
          const course = coursesOf(dept.id).find((c) => c.teacher === s.handle);
          return (
            <li key={s.name}>
              <Reveal delay={i * 0.07} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/13 shadow-m-tile">
                  <figcaption className="flex items-center gap-3">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-m-blue-soft text-xl font-bold text-m-ink" aria-hidden>
                      {s.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-m-ink">{s.name}</span>
                      <span className="block text-sm leading-snug text-m-ink/65">{course?.title ?? `${personOrThrow(s.handle).nameBn}-এর কাছে`}</span>
                    </span>
                  </figcaption>
                  <blockquote className="mt-4 text-[15px] leading-relaxed text-m-ink/85">“{s.text}”</blockquote>
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Similar departments ───────────────────────────────────────────── */

/** On a band of its own: departments of the same school first, then the busiest others. */
export function Similar({ dept }: { dept: Department }) {
  const others = departments
    .filter((d) => d.id !== dept.id)
    .sort((a, b) => Number(b.school === dept.school) - Number(a.school === dept.school) || coursesOf(b.id).length - coursesOf(a.id).length)
    .slice(0, 4);
  return (
    <section aria-labelledby="similar-title" className="-mx-3 bg-m-blue-soft px-3 py-12 sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="similar-title" className="text-xl font-bold text-m-ink sm:text-2xl">
            {dept.name}-এর মতো আরও বিভাগ
          </h2>
          <Link href="/media/academy/departments#departments" className="group inline-flex items-center gap-1.5 font-semibold text-m-blue">
            সব বিভাগ <ArrowRight className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {others.map((d, i) => (
            <li key={d.id}>
              <RoleCard dept={d} tone={i % 2 ? "gold" : "green"} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The small print: where the numbers come from. */
export function Footnote() {
  return (
    <p className="mx-auto max-w-7xl py-8 text-xs leading-relaxed text-m-ink/55">
      রেটিং শিক্ষকের সব ক্লাসের গড় — কোর্স আলাদা করে নয়। আসন, ভর্তি আর দেখার সংখ্যা ডেমোর নমুনা তথ্য।
    </p>
  );
}
