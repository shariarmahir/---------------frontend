"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { getCourse, getDepartment } from "@/data/media/academy";
import { BATCH_MAX, CLASS_MINUTES, CLASS_WEEKS, COURSE_DAYS, DEPT_COURSES, FINAL_DAYS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { DeptIcon } from "./dept-icons";
import { Deck, ease, frame, useShow } from "./hero-deck";

const NEW_DEPT = "/media/academy/teach?dept=new";

/**
 * The second carousel, built like the opening one: ink, gold and green
 * slides with their own moving pictures. These three say how the academy
 * works — open your own, forty days to a skill, a free class every week.
 */
export function PromoDeck() {
  return <Deck label="একাডেমির খবর" slides={[<OpenSlide key="o" />, <FortySlide key="f" />, <FreeSlide key="c" />]} />;
}

/* ── 1: open your own academy ──────────────────────────────────────── */

/** Ink slide: a team photo in a ring, arcs drawing round it, three department icons floating up the arc. */
function OpenSlide() {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  const bubbles = ["music", "architecture", "textile"].map((id) => getDepartment(id)!);
  return (
    <div ref={ref} className={cn(frame, "bg-m-card ring-1 ring-m-ink/10")}>
      <div className="relative z-10 flex flex-col justify-center p-6 sm:max-w-[57%] sm:p-8">
        <h2 className="text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">নিজের একাডেমি খুলুন, একা বা দল বেঁধে</h2>
        <p className="mt-3 text-sm leading-relaxed text-m-ink/80">
          একটি বিভাগ, <Num value={DEPT_COURSES} />টি কোর্স। এক ব্যাচে একক একাডেমিতে <Num value={BATCH_MAX.solo} /> জন, দলীয়তে <Num value={BATCH_MAX.team} /> জন।
        </p>
        <Link href={NEW_DEPT} className={mediaButton({ variant: "outline", className: "group/btn mt-5 self-start border-m-ink/60 text-m-ink hover:border-white hover:bg-m-ink/6" })}>
          একাডেমি খুলুন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] sm:block" aria-hidden>
        <svg viewBox="0 0 300 312" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <motion.circle cx="200" cy="170" r="150" fill="none" strokeWidth="28" className="stroke-m-blue" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.2, ease }} />
          <motion.path d="M70 40 A150 150 0 0 1 300 60" fill="none" strokeWidth="18" strokeLinecap="round" className="stroke-m-yellow" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1, delay: 0.3, ease }} />
          {Array.from({ length: 9 }, (_, i) => (
            <motion.path key={i} d={`M${46 + i * 7} ${300 - i * 4} q40 -150 190 -${190 - i * 6}`} fill="none" strokeWidth="1.2" className="stroke-m-ink/20" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.4, delay: 0.2 + i * 0.05, ease }} />
          ))}
        </svg>
        <motion.span
          className="absolute top-[14%] left-[22%] block aspect-square w-[62%] overflow-hidden rounded-full ring-4 ring-m-card"
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={show ? { scale: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <Image src="/media/challenge-hackathon.webp" alt="" fill sizes="240px" className="object-cover" />
        </motion.span>
        {bubbles.map((d, i) => (
          <motion.span
            key={d.id}
            className="absolute right-[6%] grid size-14 place-items-center rounded-full bg-white ring-4 ring-m-blue"
            style={{ top: `${14 + i * 26}%` }}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={show ? { scale: 1, opacity: 1, y: reduce ? 0 : [0, -6, 0] } : undefined}
            transition={{ scale: { delay: 0.6 + i * 0.15, type: "spring", stiffness: 320, damping: 16 }, opacity: { delay: 0.6 + i * 0.15 }, y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: 1.4 } }}
          >
            <DeptIcon dept={d.id} school={d.school} className="size-9" />
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ── 2: forty days ─────────────────────────────────────────────────── */

/** Gold slide: forty days, five weeks of forty-minute classes and a project — two course covers wired up with lines. */
function FortySlide() {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  const covers = ["GTR-101", "MTH-101"].map((id) => getCourse(id)!);
  return (
    <div ref={ref} className={cn(frame, "bg-m-yellow")}>
      <div className="relative z-10 flex flex-col justify-center p-6 sm:max-w-[57%] sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold text-m-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-white">
            <DeptIcon dept="guitar" school="arts" className="size-6" />
          </span>
          প্রতিটা কোর্স একই নিয়মে
        </p>
        <h2 className="mt-3 text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">
          <Num value={COURSE_DAYS} /> দিনে একটা দক্ষতা — শিখুন, বানান, পাস করুন
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-m-ink/85">
          <Num value={CLASS_WEEKS} /> সপ্তাহ <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, তারপর <Num value={FINAL_DAYS} /> দিন প্রজেক্ট আর প্যানেল ইন্টারভিউ।
        </p>
        <Link href="/media/academy/admission" className={mediaButton({ variant: "tile", className: "group/btn mt-5 self-start" })}>
          ভর্তি পরীক্ষা দিন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] sm:block" aria-hidden>
        <svg viewBox="0 0 280 312" className="absolute inset-0 size-full" preserveAspectRatio="none">
          {["M20 0 V120 H70", "M150 312 V250 H250 V312", "M270 40 H230 V150"].map((d, i) => (
            <motion.path key={d} d={d} fill="none" strokeWidth="2.5" className="stroke-m-ink" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 0.9, delay: 0.3 + i * 0.25, ease }} />
          ))}
        </svg>
        {covers.map((c, i) => (
          <motion.span
            key={c.id}
            className={cn("absolute block aspect-[4/3] overflow-hidden rounded-xl ring-4 ring-m-blue", i === 0 ? "top-[14%] left-[22%] w-[52%]" : "bottom-[10%] left-[6%] w-[40%]")}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.2, ease }}
          >
            <Image src={c.image} alt="" fill sizes="200px" className="object-cover" />
          </motion.span>
        ))}
        <motion.span className="absolute top-[8%] right-[8%] grid size-14 place-items-center rounded-xl bg-m-card" initial={reduce ? false : { scale: 0 }} animate={show ? { scale: 1, rotate: reduce ? 0 : [0, -6, 0] } : undefined} transition={{ scale: { delay: 0.8, type: "spring", stiffness: 300, damping: 15 }, rotate: { duration: 2.4, repeat: Infinity, delay: 1.5 } }}>
          <DeptIcon dept="guitar" school="arts" className="size-10" />
        </motion.span>
        <motion.span className="absolute right-[6%] bottom-[30%] rounded-full bg-m-card px-3 py-1.5 text-sm font-bold text-m-blue" initial={reduce ? false : { opacity: 0, x: 20 }} animate={show ? { opacity: 1, x: 0 } : undefined} transition={{ delay: 1.1, duration: 0.5, ease }}>
          <Num value={COURSE_DAYS} /> দিন · <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস
        </motion.span>
      </div>
    </div>
  );
}

/* ── 3: a free class every week ────────────────────────────────────── */

/** Green slide: a free class in a circle, the play tile rising beside it. */
function FreeSlide() {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(frame, "bg-m-blue-soft")}>
      <div className="relative z-10 flex flex-col justify-center p-6 sm:max-w-[57%] sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold text-m-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-m-ink text-m-on">
            <Play className="size-4.5 fill-m-ink" aria-hidden />
          </span>
          ক্লাস ভিডিও
        </p>
        <h2 className="mt-3 text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">প্রতি সপ্তাহে একটা ক্লাস বিনামূল্যে</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-m-ink/85">প্রত্যেক শিক্ষক সপ্তাহে একটা পুরো ক্লাস সবার জন্য খুলে দেন — আগে দেখুন, পছন্দ হলে ভর্তি হন।</p>
        <Link href="/media/academy/videos" className={mediaButton({ variant: "tile", className: "group/btn mt-5 self-start" })}>
          ক্লাস ভিডিও দেখুন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] sm:block" aria-hidden>
        <motion.span className="absolute top-1/2 right-[-12%] block aspect-square w-[95%] -translate-y-1/2 rounded-full bg-m-blue-soft" initial={reduce ? false : { scale: 0.6 }} animate={show ? { scale: 1 } : undefined} transition={{ duration: 0.9, ease }} />
        <motion.span className="absolute top-[18%] right-[8%] block aspect-square w-[64%] overflow-hidden rounded-full ring-4 ring-m-blue" initial={reduce ? false : { rotate: -25, opacity: 0 }} animate={show ? { rotate: 0, opacity: 1 } : undefined} transition={{ duration: 0.9, delay: 0.2, ease }}>
          <Image src="/media/circuit.webp" alt="" fill sizes="200px" className="object-cover" />
        </motion.span>
        <motion.span className="absolute bottom-[10%] left-[6%] grid size-20 place-items-center rounded-2xl bg-white shadow-m-tile" initial={reduce ? false : { y: 30, opacity: 0 }} animate={show ? { y: 0, opacity: 1 } : undefined} transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 16 }}>
          <Play className="size-10 fill-m-blue text-m-blue" aria-hidden />
        </motion.span>
      </div>
    </div>
  );
}
