"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { coursesOf, departments, getDepartment } from "@/data/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { DeptIcon } from "./dept-icons";

export const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The opening carousel, as on a big course site: wide slides, two and a bit
 * in view, dots under them and a round arrow. Each slide has its own moving
 * picture that plays when it comes into view.
 */
export function HeroDeck() {
  return <Deck label="একাডেমিতে যা আছে" slides={[<MastersSlide key="m" />, <DeptSlide key="w" dept="web-ai" />, <KitchenSlide key="k" />]} />;
}

/** The carousel itself, for any set of slides built on `frame`: snap scrolling, dots and a round arrow. */
export function Deck({ slides, label }: { slides: React.ReactNode[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const step = (first?.offsetWidth ?? el.clientWidth) + 16;
    setAt(Math.min(slides.length - 1, Math.round(el.scrollLeft / step)));
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, [slides.length]);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function goTo(i: number) {
    const el = track.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (!el || !target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow = "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-m-ink text-m-on shadow-[0_10px_24px_-8px_rgb(16_24_40/0.27)] transition-[opacity,scale] hover:scale-105 sm:grid";

  return (
    <section aria-roledescription="carousel" aria-label={label}>
      <div className="relative">
        <ul ref={track} onScroll={measure} className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-4 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:scroll-px-0 sm:px-0">
          {slides.map((s, i) => (
            <li key={i} aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`} className="w-[88%] shrink-0 snap-start md:w-[calc((100%-1rem)/2.12)]">
              {s}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => goTo(Math.max(0, at - 1))} aria-label="আগের স্লাইড" className={cn(arrow, "-left-4", edge.start && "pointer-events-none opacity-0")}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => goTo(Math.min(slides.length - 1, at + 1))} aria-label="পরের স্লাইড" className={cn(arrow, "-right-4", edge.end && "pointer-events-none opacity-0")}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} type="button" onClick={() => goTo(i)} aria-label={`স্লাইড ${i + 1}`} aria-current={i === at} className="grid h-6 place-items-center">
            <span className={cn("block h-2 rounded-full transition-[width,background-color] duration-300", i === at ? "w-8 bg-m-blue" : "w-2 bg-m-ink/20 hover:bg-m-ink/40")} />
          </button>
        ))}
      </div>
    </section>
  );
}

export const frame = "relative flex h-full min-h-72 overflow-hidden rounded-3xl md:h-[20.5rem]";

export function useShow<T extends Element>() {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  return { ref, show: !!reduce || seen, reduce: !!reduce };
}

/* ── 1: the masters ────────────────────────────────────────────────── */

/** Ink slide: a photo in a ring, arcs drawing round it, three department icons floating up the arc. */
function MastersSlide() {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  const bubbles = ["kitchen", "web-ai", "motor"].map((id) => getDepartment(id)!);
  return (
    <div ref={ref} className={cn(frame, "bg-m-card ring-1 ring-m-ink/10")}>
      <div className="relative z-10 flex flex-col sm:max-w-[57%] justify-center p-6 sm:p-8">
        <h2 className="text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">যাঁরা কাজটা করেন, শিখুন তাঁদের কাছে</h2>
        <p className="mt-3 text-sm leading-relaxed text-m-ink/80">
          রাঁধুনি, মেকানিক, প্রকৌশলী, শিল্পী — প্যানেল-পাস পেশাদারদের <Num value={departments.length} />টি বিভাগ, শুরু থেকে অভিজ্ঞ সব স্তরে।
        </p>
        <a href="#departments" className={mediaButton({ variant: "outline", className: "group/btn mt-5 self-start border-m-ink/60 text-m-ink hover:border-white hover:bg-m-ink/6" })}>
          বিভাগগুলো দেখুন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </a>
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
          <Image src="/media/kacchi.webp" alt="" fill sizes="240px" className="object-cover" />
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

/* ── 2: one department, introduced ─────────────────────────────────── */

/** Gold slide: a department's mark, its courses, and a picture wired up with lines drawing between tiles. */
function DeptSlide({ dept: id }: { dept: string }) {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  const dept = getDepartment(id)!;
  const list = coursesOf(id);
  return (
    <div ref={ref} className={cn(frame, "bg-m-yellow")}>
      <div className="relative z-10 flex flex-col sm:max-w-[57%] justify-center p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold text-m-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-white">
            <DeptIcon dept={dept.id} school={dept.school} className="size-6" />
          </span>
          {dept.name}
        </p>
        <h2 className="mt-3 text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">কোড থেকে এআই — বানাতে বানাতে শিখুন</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-m-ink/85">{dept.blurb}</p>
        <Link href={`/media/academy/dept/${dept.id}`} className={mediaButton({ variant: "tile", className: "group/btn mt-5 self-start" })}>
          ভর্তি হন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] sm:block" aria-hidden>
        <svg viewBox="0 0 280 312" className="absolute inset-0 size-full" preserveAspectRatio="none">
          {["M20 0 V120 H70", "M150 312 V250 H250 V312", "M270 40 H230 V150"].map((d, i) => (
            <motion.path key={d} d={d} fill="none" strokeWidth="2.5" className="stroke-m-ink" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 0.9, delay: 0.3 + i * 0.25, ease }} />
          ))}
        </svg>
        {list.slice(0, 2).map((c, i) => (
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
          <DeptIcon dept="mechatronics" school="engineering" className="size-10" />
        </motion.span>
        <motion.span className="absolute right-[6%] bottom-[30%] rounded-full bg-m-card px-3 py-1.5 text-sm font-bold text-m-blue" initial={reduce ? false : { opacity: 0, x: 20 }} animate={show ? { opacity: 1, x: 0 } : undefined} transition={{ delay: 1.1, duration: 0.5, ease }}>
          <Num value={list.length} />টি কোর্স · প্রতি সপ্তাহে লাইভ
        </motion.span>
      </div>
    </div>
  );
}

/* ── 3: kitchen to business ────────────────────────────────────────── */

/** Green slide: the kitchen department, a plate in a circle, the pot steaming beside it. */
function KitchenSlide() {
  const { ref, show, reduce } = useShow<HTMLDivElement>();
  const dept = getDepartment("kitchen")!;
  return (
    <div ref={ref} className={cn(frame, "bg-m-blue-soft")}>
      <div className="relative z-10 flex flex-col sm:max-w-[57%] justify-center p-6 sm:p-8">
        <p className="flex items-center gap-2 text-sm font-bold text-m-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-white">
            <DeptIcon dept={dept.id} school={dept.school} className="size-6" />
          </span>
          {dept.name}
        </p>
        <h2 className="mt-3 text-2xl leading-tight font-bold text-balance text-m-ink xl:text-[1.75rem]">রান্নাঘর থেকে নিজের ব্যবসা</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-m-ink/85">{dept.blurb}</p>
        <Link href={`/media/academy/dept/${dept.id}`} className={mediaButton({ variant: "tile", className: "group/btn mt-5 self-start" })}>
          বিভাগ দেখুন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] sm:block" aria-hidden>
        <motion.span className="absolute top-1/2 right-[-12%] block aspect-square w-[95%] -translate-y-1/2 rounded-full bg-m-blue-soft" initial={reduce ? false : { scale: 0.6 }} animate={show ? { scale: 1 } : undefined} transition={{ duration: 0.9, ease }} />
        <motion.span className="absolute top-[18%] right-[8%] block aspect-square w-[64%] overflow-hidden rounded-full ring-4 ring-m-blue" initial={reduce ? false : { rotate: -25, opacity: 0 }} animate={show ? { rotate: 0, opacity: 1 } : undefined} transition={{ duration: 0.9, delay: 0.2, ease }}>
          <Image src="/media/tiffin.webp" alt="" fill sizes="200px" className="object-cover" />
        </motion.span>
        <motion.span className="absolute bottom-[10%] left-[6%] grid size-20 place-items-center rounded-2xl bg-white shadow-m-tile" initial={reduce ? false : { y: 30, opacity: 0 }} animate={show ? { y: 0, opacity: 1 } : undefined} transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 16 }}>
          <DeptIcon dept="kitchen" school="food" className="size-14" />
        </motion.span>
      </div>
    </div>
  );
}
