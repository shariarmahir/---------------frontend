"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { courses, teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { DISTINCTION, MIN_ATTENDANCE, MIN_HOMEWORK, PASS_MARK, REVIEW_AT } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { CountUp, Reveal } from "../home/motion-bits";

const ease = [0.22, 1, 0.36, 1] as const;
const GRADUATES = teacherRecords.reduce((n, t) => n + t.graduates, 0);

/* ── Outcome band ──────────────────────────────────────────────────── */

/** The wide outcome band: how many have passed a public final, and a ring that fills while it counts. */
export function Outcome() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const show = !!reduce || seen;
  return (
    <Reveal>
      <section ref={ref} aria-labelledby="outcome-title" className="relative grid min-h-64 items-center overflow-hidden rounded-3xl bg-bd-green-dark p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative z-10 max-w-xl">
          <h2 id="outcome-title" className="text-2xl leading-snug font-bold text-white sm:text-3xl">
            <span className="text-signal-orange">
              <CountUp value={GRADUATES} />
            </span>{" "}
            জন শিক্ষার্থী প্যানেলের সামনে ফাইনাল দিয়ে পাস করেছেন
          </h2>
          <p className="mt-3 leading-relaxed text-white/80">ফাইনাল হয় বহিরাগত পরীক্ষকসহ প্যানেলে, নিজের হাতে করা প্রকল্প দেখিয়ে। ফল আর সার্টিফিকেট থাকে প্রকাশ্য বোর্ডে।</p>
          <Link href="/media/academy/exam" className="group mt-5 inline-flex items-center gap-1.5 font-bold text-white hover:text-signal-orange">
            ফাইনাল বোর্ড দেখুন <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-16 -bottom-24 hidden size-[22rem] md:block" aria-hidden>
          <circle cx="100" cy="100" r="84" fill="none" strokeWidth="22" className="stroke-text-primary" />
          <motion.circle cx="100" cy="100" r="84" fill="none" strokeWidth="22" strokeLinecap="round" className="stroke-signal-orange" style={{ rotate: -90, originX: "50%", originY: "50%" }} initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 0.78 } : undefined} transition={{ duration: 1.6, ease }} />
          <motion.circle cx="100" cy="100" r="58" fill="none" strokeWidth="10" className="stroke-bd-green" style={{ rotate: -90, originX: "50%", originY: "50%" }} initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 0.55 } : undefined} transition={{ duration: 1.4, delay: 0.3, ease }} />
          <motion.circle cx="100" cy="100" r="98" fill="none" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" className="stroke-white/50" animate={show && !reduce ? { rotate: 360 } : undefined} style={{ originX: "50%", originY: "50%" }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
        </svg>
      </section>
    </Reveal>
  );
}

/* ── Why people choose ─────────────────────────────────────────────── */

/** Four learners in their own words — the first story from four different teachers. */
export function Voices() {
  const voices = teacherRecords
    .filter((t) => t.stories.length)
    .slice(0, 4)
    .map((t) => ({ ...t.stories[0], teacher: personOrThrow(t.handle).nameBn, handle: t.handle }));
  return (
    <section aria-labelledby="voices-title">
      <h2 id="voices-title" className="text-xl font-bold text-white sm:text-2xl">
        কেন মানুষ কাণ্ডারী একাডেমি বেছে নেন
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {voices.map((v, i) => (
          <li key={v.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
                <figcaption className="flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-bd-green text-xl font-bold text-white" aria-hidden>
                    {v.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-white">{v.name}</span>
                    <Link href={`/media/academy/teachers/${v.handle}`} className="block text-xs leading-snug text-white/65 hover:text-signal-orange">
                      {v.teacher}-এর কাছে শিখেছেন
                    </Link>
                  </span>
                </figcaption>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-white/85">“{v.text}”</blockquote>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Questions ─────────────────────────────────────────────────────── */

const POPULAR = [...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 3);

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "সার্টিফিকেট কীভাবে পাওয়া যায়?",
    a: (
      <>
        ক্লাসের অন্তত <Num value={MIN_ATTENDANCE * 100} />% উপস্থিতি, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ আর একটা ফাইনাল প্রকল্প জমা দিলে প্যানেলের সামনে ফাইনাল। গড় <Num value={PASS_MARK} /> পেলে পাস, <Num value={DISTINCTION} /> পেলে কৃতিত্বসহ।
      </>
    ),
  },
  { q: "নিয়োগকর্তারা এই সার্টিফিকেট কেন বিশ্বাস করবেন?", a: "ফাইনাল হয় বহিরাগত পরীক্ষকসহ প্যানেলে, নিজের হাতে করা প্রকল্প দেখিয়ে। প্রতিটা সার্টিফিকেটের আলাদা নম্বর থাকে, আর ফল থাকে প্রকাশ্য বোর্ডে।" },
  { q: "বিনামূল্যে কিছু শেখা যায়?", a: "হ্যাঁ। প্রত্যেক শিক্ষক প্রতি সপ্তাহে একটা পুরো ক্লাস সবার জন্য খুলে দেন — ক্লাস ভিডিও পাতায় সব আছে। কয়েকটা কোর্সের ফি-ও নেই।" },
  { q: "ফি দিলে টাকা কোথায় যায়?", a: "ফি এসক্রোতে থাকে। সপ্তাহের ক্লাস হলে শিক্ষক পান, না হলে টাকা ফেরত। সঙ্গে ৫% সার্ভিস চার্জ।" },
  { q: "সবচেয়ে জনপ্রিয় কোর্স কোনগুলো?", a: <>এখন সবচেয়ে বেশি ভর্তি: {POPULAR.map((c) => c.title).join(", ")}।</> },
  {
    q: "শিক্ষক খারাপ শেখালে কী করব?",
    a: (
      <>
        শিক্ষকের পাতা থেকে নাম গোপন রেখে অভিযোগ করুন। <Num value={REVIEW_AT} />টি অভিযোগ প্রমাণিত হলে শিক্ষকতা থামে, প্যানেল আবার যাচাই করে।
      </>
    ),
  },
  { q: "নিজের বিভাগ কীভাবে খুলব?", a: "একা বা দল মিলে কাজের প্রমাণ দিয়ে আবেদন করুন। প্যানেলের ইন্টারভিউ আর নমুনা ক্লাস পাস করলে বিভাগ খোলে।" },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const base = useId();
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-xl font-bold text-white sm:text-2xl">
        প্রায়ই যা জানতে চান
      </h2>
      <ul className="mt-4 border-t border-white/15">
        {FAQ.map((f, i) => {
          const on = open === i;
          return (
            <li key={f.q} className="border-b border-white/15">
              <h3>
                <button type="button" aria-expanded={on} aria-controls={`${base}-${i}`} onClick={() => setOpen(on ? null : i)} className="flex w-full items-center gap-3 py-3.5 text-left font-semibold text-white hover:text-signal-orange">
                  <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-300 motion-reduce:transition-none", on && "rotate-180")} aria-hidden />
                  {f.q}
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div id={`${base}-${i}`} initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.28, ease }} className="overflow-hidden">
                    <p className="max-w-3xl pb-4 pl-8 leading-relaxed text-white/80">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
