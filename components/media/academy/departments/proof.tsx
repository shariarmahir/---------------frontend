"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { teacherRecords } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
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
      <section ref={ref} aria-labelledby="outcome-title" className="relative grid min-h-64 items-center overflow-hidden rounded-3xl bg-m-blue-soft p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative z-10 max-w-xl">
          <h2 id="outcome-title" className="text-2xl leading-snug font-bold text-m-ink sm:text-3xl">
            <span className="text-m-blue">
              <CountUp value={GRADUATES} />
            </span>{" "}
            জন শিক্ষার্থী প্যানেলের সামনে ফাইনাল দিয়ে পাস করেছেন
          </h2>
          <p className="mt-3 leading-relaxed text-m-ink/80">ফাইনাল হয় বহিরাগত পরীক্ষকসহ প্যানেলে, নিজের হাতে করা প্রকল্প দেখিয়ে। ফল আর সার্টিফিকেট থাকে প্রকাশ্য বোর্ডে।</p>
          <Link href="/media/academy/exam" className="group mt-5 inline-flex items-center gap-1.5 font-bold text-m-ink hover:text-m-blue">
            ফাইনাল বোর্ড দেখুন <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-16 -bottom-24 hidden size-[22rem] md:block" aria-hidden>
          <circle cx="100" cy="100" r="84" fill="none" strokeWidth="22" className="stroke-m-ink" />
          <motion.circle cx="100" cy="100" r="84" fill="none" strokeWidth="22" strokeLinecap="round" className="stroke-m-yellow" style={{ rotate: -90, originX: "50%", originY: "50%" }} initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 0.78 } : undefined} transition={{ duration: 1.6, ease }} />
          <motion.circle cx="100" cy="100" r="58" fill="none" strokeWidth="10" className="stroke-m-blue" style={{ rotate: -90, originX: "50%", originY: "50%" }} initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 0.55 } : undefined} transition={{ duration: 1.4, delay: 0.3, ease }} />
          <motion.circle cx="100" cy="100" r="98" fill="none" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" className="stroke-m-ink/50" animate={show && !reduce ? { rotate: 360 } : undefined} style={{ originX: "50%", originY: "50%" }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
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
      <h2 id="voices-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        কেন মানুষ কাণ্ডারী একাডেমি বেছে নেন
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {voices.map((v, i) => (
          <li key={v.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 shadow-m-tile">
                <figcaption className="flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-m-blue-soft text-xl font-bold text-m-ink" aria-hidden>
                    {v.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-m-ink">{v.name}</span>
                    <Link href={`/media/academy/teachers/${v.handle}`} className="block text-xs leading-snug text-m-ink/65 hover:text-m-blue">
                      {v.teacher}-এর কাছে শিখেছেন
                    </Link>
                  </span>
                </figcaption>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-m-ink/85">“{v.text}”</blockquote>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
