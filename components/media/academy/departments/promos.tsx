"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, ChevronRight, MapPin, Wrench } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { departments, getDepartment, teacherRecords, workshops } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { DateText, Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { Reveal } from "../home/motion-bits";
import { BulbIcon, CertIcon, PresenterIcon } from "../home/motion-icons";
import { standingOf } from "../parts";
import { DeptIcon } from "./dept-icons";
import { GLYPH } from "./role-art";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Two promo banners ─────────────────────────────────────────────── */

/**
 * The pair of wide promos: the next workshop with seats left, on white with
 * its picture cut into a swoosh and icons bobbing; and the invitation to
 * teach, on ink with a gold slab behind the photo.
 */
export function Promos() {
  const next = [...workshops].filter((w) => w.at > DEMO_NOW.toISOString() && w.taken < w.seats).sort((a, b) => a.at.localeCompare(b.at))[0];
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const show = !!reduce || seen;
  const dept = next && getDepartment(next.dept);

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-2">
      {next && dept && (
        <article className="relative flex min-h-56 overflow-hidden rounded-3xl bg-white">
          <div className="relative z-10 flex max-w-[58%] flex-col justify-center p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-bold text-m-ink">
              <span className="grid size-8 place-items-center rounded-lg bg-m-card/8">
                <DeptIcon dept={dept.id} school={dept.school} className="size-6" />
              </span>
              {dept.name}
            </p>
            <h3 className="mt-3 text-xl leading-snug font-bold text-balance text-m-ink sm:text-2xl">{next.title}</h3>
            <p className="mt-2 text-sm text-m-ink/75">
              <DateText iso={next.at} /> · {next.place} · {next.fee === 0 ? "বিনা ফি" : <Taka amount={next.fee} />} · <Num value={next.seats - next.taken} />টি আসন বাকি
            </p>
            <Link href={`/media/academy/dept/${dept.id}`} className={mediaButton({ variant: "outline", className: "group/btn mt-5 self-start border-m-ink/50 text-m-ink hover:border-m-card hover:bg-m-card/8" })}>
              আসন নিন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
            </Link>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[46%]" aria-hidden>
            <motion.span className="absolute -top-8 -right-16 block aspect-square w-[120%] rounded-full bg-m-blue-soft" initial={reduce ? false : { scale: 0.5, opacity: 0 }} animate={show ? { scale: 1, opacity: 1 } : undefined} transition={{ duration: 0.9, ease }} />
            <motion.span className="absolute right-[8%] bottom-0 block h-[86%] w-[70%] overflow-hidden rounded-t-full" initial={reduce ? false : { y: 40, opacity: 0 }} animate={show ? { y: 0, opacity: 1 } : undefined} transition={{ duration: 0.8, delay: 0.2, ease }}>
              <Image src={next.image} alt="" fill sizes="240px" className="object-cover" />
            </motion.span>
            {[
              { Icon: GLYPH[dept.id] ?? Wrench, cls: "top-[14%] right-[6%]" },
              { Icon: CalendarDays, cls: "top-[46%] left-[4%]" },
              { Icon: MapPin, cls: "bottom-[10%] right-[4%]" },
            ].map(({ Icon, cls }, i) => (
              <motion.span
                key={i}
                className={cn("absolute grid size-11 place-items-center rounded-full bg-m-card text-m-blue ring-3 ring-white", cls)}
                initial={reduce ? false : { scale: 0 }}
                animate={show ? { scale: 1, y: reduce ? 0 : [0, -5, 0] } : undefined}
                transition={{ scale: { delay: 0.6 + i * 0.15, type: "spring", stiffness: 320, damping: 15 }, y: { duration: 2.6 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
              >
                <Icon className="size-5" />
              </motion.span>
            ))}
          </div>
        </article>
      )}

      <article className="relative flex min-h-56 overflow-hidden rounded-3xl bg-m-card ring-1 ring-m-ink/10 shadow-m-tile">
        <div className="relative z-10 flex max-w-[60%] flex-col justify-center p-6 sm:p-8">
          <p className="text-lg leading-none font-extrabold text-m-blue">
            কাণ্ডারী <span className="font-semibold text-m-ink">শিক্ষক</span>
          </p>
          <h3 className="mt-3 text-xl leading-snug font-bold text-balance text-m-ink sm:text-2xl">আপনার দক্ষতা শেখান, সপ্তাহে একটা ক্লাস সবার জন্য খুলে দিন</h3>
          <Link href="/media/academy/teach" className={mediaButton({ className: "group/btn mt-5 self-start" })}>
            শিক্ষক হিসেবে আবেদন <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%]" aria-hidden>
          <motion.span className="absolute inset-y-0 -right-6 block w-[85%] bg-m-yellow [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" initial={reduce ? false : { x: "40%" }} animate={show ? { x: 0 } : undefined} transition={{ duration: 0.8, ease }} />
          <motion.span className="absolute right-[10%] bottom-0 block h-[84%] w-[66%] overflow-hidden rounded-t-[2rem] ring-4 ring-m-card" initial={reduce ? false : { y: 50 }} animate={show ? { y: 0 } : undefined} transition={{ duration: 0.8, delay: 0.25, ease }}>
            <Image src="/media/challenge-hackathon.webp" alt="" fill sizes="220px" className="object-cover" />
          </motion.span>
        </div>
      </article>
    </div>
  );
}

/* ── Teachers as partner pills ─────────────────────────────────────── */

/** "শিখুন … কাছে": every panel-passed teacher as a pill, best first, scrolling sideways. */
export function TeacherPills() {
  const track = useRef<HTMLUListElement>(null);
  const [end, setEnd] = useState(false);
  const ranked = [...teacherRecords].sort((a, b) => standingOf(b).points.total - standingOf(a).points.total);
  return (
    <section aria-labelledby="pills-title">
      <h2 id="pills-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        শিখুন <Num value={teacherRecords.length} /> জন প্যানেল-পাস শিক্ষক আর <Num value={departments.length} />টি বিভাগের কাছে
      </h2>
      <div className="relative mt-4">
        <ul
          ref={track}
          onScroll={(e) => setEnd(e.currentTarget.scrollLeft + e.currentTarget.clientWidth >= e.currentTarget.scrollWidth - 8)}
          className="-mx-3 flex gap-2.5 overflow-x-auto px-3 pb-1 scrollbar-none sm:mx-0 sm:px-0 sm:pr-12"
        >
          {ranked.map((t) => {
            const p = personOrThrow(t.handle);
            return (
              <li key={t.handle} className="shrink-0">
                <Link href={`/media/academy/teachers/${t.handle}`} className="flex h-12 items-center gap-2.5 rounded-full bg-m-card pr-4 pl-1.5 text-sm font-semibold text-m-ink ring-1 ring-m-ink/13 transition-colors hover:ring-m-blue/60">
                  <PersonAvatar person={p} size="sm" />
                  {p.nameBn}
                  <BadgeCheck className="size-4 text-m-ink/60" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
          className={cn("absolute top-1/2 right-0 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-m-ink text-m-on shadow-[0_8px_20px_-6px_rgb(16_24_40/0.27)] transition-opacity sm:grid", end && "pointer-events-none opacity-0")}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </section>
  );
}

/* ── Three doors ───────────────────────────────────────────────────── */

const DOORS = [
  { href: "/media/academy/departments#departments", label: "নতুন পেশা শুরু করুন", Icon: BulbIcon },
  { href: "/media/academy/teach?dept=new", label: "দল নিয়ে বিভাগ খুলুন", Icon: PresenterIcon },
  { href: "/media/academy/exam", label: "ফাইনাল দিয়ে সার্টিফিকেট", Icon: CertIcon },
];

/** Three wide doors, each with its moving icon and speed lines that run on hover. */
export function Doors() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {DOORS.map(({ href, label, Icon }, i) => (
        <li key={href}>
          <Reveal delay={i * 0.08}>
            <Link href={href} className="group relative flex h-28 items-center justify-between overflow-hidden rounded-2xl bg-m-card px-5 ring-1 ring-m-ink/10 transition-colors hover:ring-m-blue/50 shadow-m-tile">
              <span className="relative z-10 text-lg font-bold text-m-ink group-hover:text-m-blue sm:text-xl">{label}</span>
              <span className="relative grid size-20 shrink-0 place-items-center">
                <svg viewBox="0 0 120 60" className="absolute -left-16 h-12 w-28 transition-transform duration-500 ease-out group-hover:-translate-x-3 motion-reduce:transition-none" aria-hidden>
                  {[10, 22, 34, 46].map((y, k) => (
                    <rect key={y} x={k * 10} y={y} width={90 - k * 14} height="3" rx="1.5" className="fill-m-yellow/40" />
                  ))}
                </svg>
                <span className="relative grid size-16 place-items-center rounded-2xl bg-white shadow-m-tile transition-transform duration-300 group-hover:-rotate-6">
                  <Icon className="size-11" />
                </span>
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/* ── Categories ────────────────────────────────────────────────────── */

/** Every department as a chip with its glyph. */
export function Categories() {
  return (
    <section aria-labelledby="cats-title">
      <h2 id="cats-title" className="text-xl font-bold text-m-ink sm:text-2xl">
        বিভাগ অন্বেষণ
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {departments.map((d) => {
          const Glyph = GLYPH[d.id];
          return (
            <li key={d.id}>
              <Link href={`/media/academy/dept/${d.id}`} className="group inline-flex h-10 items-center gap-2 rounded-lg bg-m-card px-3.5 text-sm font-semibold text-m-ink ring-1 ring-m-ink/13 transition-colors hover:bg-m-blue-soft hover:ring-m-blue/50">
                {Glyph && <Glyph className="size-4 text-m-blue transition-transform group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none" aria-hidden />}
                {d.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
