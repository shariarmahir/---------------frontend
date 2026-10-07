"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Award, ChevronRight, House, MapPin, Wallet, Wifi } from "lucide-react";
import { coursesOf, deptLikes, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { DEPT_KINDS, SCHOOLS, type Department } from "@/lib/media/academy";
import { mediaButton } from "../../ui/button-styles";
import { Num, Taka } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { DeptIcon } from "../departments/dept-icons";
import { GLYPH } from "../departments/role-art";

const ease = [0.22, 1, 0.36, 1] as const;

/** The skills the department's teachers had verified by the community, most-rated first. */
export function skillsOf(dept: Department): string[] {
  const all = dept.teachers.flatMap((h) => personOrThrow(h).skills).sort((a, b) => b.raters - a.raters);
  return [...new Set(all.map((s) => s.skill))].slice(0, 8);
}

/**
 * The top of a department, as a course site opens a role: breadcrumb, the
 * name, who it suits in bold, what it is, the skills it needs — and on the
 * right a great fan sweeping open with the department's moving icon in a
 * white tile. Under it, the facts at a glance.
 */
export function DeptHero({ dept }: { dept: Department }) {
  return (
    <>
      <section aria-labelledby="dept-title" className="-mx-3 overflow-hidden border-b border-white/12 px-3 sm:-mx-6 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
          <div className="min-w-0 py-8 lg:py-12">
            <nav aria-label="পথ" className="flex flex-wrap items-center gap-2 text-sm text-white/75">
              <Link href="/media/academy" className="hover:text-white">
                <House className="size-4.5" aria-hidden />
                <span className="sr-only">একাডেমি</span>
              </Link>
              <ChevronRight className="size-4 text-white/45" aria-hidden />
              <Link href="/media/academy/departments" className="hover:text-white">
                বিভাগ ও কোর্স
              </Link>
              <ChevronRight className="size-4 text-white/45" aria-hidden />
              <span aria-current="page" className="text-white">
                {dept.name}
              </span>
            </nav>
            <h1 id="dept-title" className="mt-5 text-3xl leading-tight font-bold text-balance text-white sm:text-[2.6rem]">
              {dept.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-snug font-bold text-white">যদি আপনি {deptLikes[dept.id]} ভালোবাসেন — এই বিভাগ আপনার জন্য।</p>
            <p className="mt-3 max-w-xl leading-relaxed text-white/80">{dept.blurb}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              <span className="font-bold text-white">যে দক্ষতা গড়বেন:</span> {skillsOf(dept).join(", ")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#join" className={mediaButton()}>
                যোগ দিন — বিনামূল্যে
              </a>
              <Link href={`/media/academy/teach?dept=${dept.id}`} className={mediaButton({ variant: "quiet" })}>
                এখানে শেখান
              </Link>
            </div>
          </div>
          <HeroFan dept={dept} />
        </div>
      </section>
      <Glance dept={dept} />
    </>
  );
}

/** The big fan: a coloured sector opening from the lower right, an arc tracing it, a glyph, and the white icon tile rising. */
function HeroFan({ dept }: { dept: Department }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const show = !!reduce || seen;
  const Glyph = GLYPH[dept.id];
  const CX = 470;
  const CY = 480;
  const pt = (r: number, d: number) => `${(CX + r * Math.cos((d * Math.PI) / 180)).toFixed(1)} ${(CY + r * Math.sin((d * Math.PI) / 180)).toFixed(1)}`;
  const sector = (r: number, a: number, b: number) => `M${CX} ${CY} L${pt(r, a)} A${r} ${r} 0 0 1 ${pt(r, b)} Z`;
  const arc = (r: number, a: number, b: number) => `M${pt(r, a)} A${r} ${r} 0 0 1 ${pt(r, b)}`;

  // The fans turn about the circle's centre (470, 480) of the 520×440 drawing: 90.4% across, 109.1% down.
  const pivot = { transformOrigin: "90.4% 109.1%" };
  const layer = "absolute inset-0 size-full";

  return (
    <div ref={ref} className="relative -mr-3 ml-auto hidden aspect-[520/440] w-full max-w-[32rem] self-end sm:-mr-6 lg:block" aria-hidden>
      <svg viewBox="0 0 520 440" className={layer}>
        <path d={sector(440, 196, 300)} className="fill-white/5" />
      </svg>
      <motion.div className={layer} style={pivot} initial={reduce ? false : { rotate: -28, opacity: 0 }} animate={show ? { rotate: 0, opacity: 1 } : undefined} transition={{ duration: 1, ease }}>
        <svg viewBox="0 0 520 440" className="size-full">
          <path d={sector(380, 200, 292)} className="fill-bd-green" />
        </svg>
      </motion.div>
      <motion.div className={layer} style={pivot} initial={reduce ? false : { rotate: -40, opacity: 0 }} animate={show ? { rotate: 0, opacity: 1 } : undefined} transition={{ duration: 1.15, delay: 0.15, ease }}>
        <svg viewBox="0 0 520 440" className="size-full">
          <path d={sector(380, 266, 292)} className="fill-signal-orange" />
        </svg>
      </motion.div>
      <svg viewBox="0 0 520 440" className={layer}>
        <motion.path d={arc(408, 198, 300)} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-white/50" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.3, delay: 0.3, ease }} />
        <motion.path d={arc(425, 210, 290)} fill="none" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" className="stroke-white/35" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.5, delay: 0.45, ease }} />
      </svg>
      {Glyph && (
        <motion.span className="absolute top-[42%] left-[16%] grid size-16 place-items-center text-white" initial={reduce ? false : { scale: 0, rotate: -20 }} animate={show ? { scale: 1, rotate: 0 } : undefined} transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 14 }}>
          <motion.span className="inline-grid" animate={show && !reduce ? { y: [0, -6, 0] } : undefined} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}>
            <Glyph className="size-14" strokeWidth={1.8} />
          </motion.span>
        </motion.span>
      )}
      <motion.span
        className="absolute right-[12%] bottom-0 block w-[46%]"
        initial={reduce ? false : { y: "40%", opacity: 0 }}
        animate={show ? { y: "8%", opacity: 1 } : undefined}
        transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 17 }}
      >
        <span className="grid aspect-square place-items-center rounded-[2rem] bg-white shadow-tile ring-8 ring-black">
          <DeptIcon dept={dept.id} school={dept.school} className="size-[68%]" />
        </span>
      </motion.span>
    </div>
  );
}

/** Who teaches, where classes happen, what it costs, what you leave with. */
function Glance({ dept }: { dept: Department }) {
  const fees = coursesOf(dept.id).map((c) => c.fee);
  const low = fees.length ? Math.min(...fees) : 0;
  const high = fees.length ? Math.max(...fees) : 0;
  const graduates = dept.teachers.reduce((n, h) => n + (teacherRecord(h)?.graduates ?? 0), 0);
  const cell = "bg-black p-5";
  const head = "text-xs font-bold text-signal-orange";
  return (
    <section aria-label="এক নজরে" className="mx-auto mt-8 grid max-w-7xl gap-px overflow-hidden rounded-2xl bg-white/12 ring-1 ring-white/12 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cell}>
        <p className={head}>কারা শেখান</p>
        <div className="mt-3 flex -space-x-2">
          {dept.teachers.map((h) => (
            <Link key={h} href={`/media/academy/teachers/${h}`} aria-label={`${personOrThrow(h).nameBn}-এর চ্যানেল`} className="rounded-full hover:z-10">
              <PersonAvatar person={personOrThrow(h)} className="ring-2 ring-black" />
            </Link>
          ))}
        </div>
        <p className="mt-2 text-sm text-white/85">{dept.teachers.map((h) => personOrThrow(h).nameBn).join(", ")}</p>
        <p className="text-xs text-white/65">
          {DEPT_KINDS[dept.kind]} · {SCHOOLS[dept.school]}
        </p>
      </div>
      <div className={cell}>
        <p className={head}>ক্লাস কোথায়</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-white/90">
          <Wifi className="size-4 shrink-0 text-signal-orange" aria-hidden /> ভিডিও আর লাইভ — ফোনেই
        </p>
        {dept.place && (
          <p className="mt-2 flex items-start gap-2 text-sm text-white/90">
            <MapPin className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden /> হাতে-কলমে: {dept.place}
          </p>
        )}
      </div>
      <div className={cell}>
        <p className={head}>খরচ</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-white/90">
          <Wallet className="size-4 shrink-0 text-signal-orange" aria-hidden /> যোগ দেওয়া বিনামূল্যে
        </p>
        <p className="mt-2 text-sm text-white/90">
          কোর্স{" "}
          {high === 0 ? (
            <span className="font-semibold text-bdgreen-500">বিনা ফি</span>
          ) : low === high ? (
            <Taka amount={low} />
          ) : (
            <>
              {low === 0 ? "বিনা ফি" : <Taka amount={low} />} থেকে <Taka amount={high} />
            </>
          )}
        </p>
        <p className="text-xs text-white/65">ফি এসক্রোতে, ক্লাস হলে শিক্ষক পান</p>
      </div>
      <div className={cell}>
        <p className={head}>শেষে কী পাবেন</p>
        <p className="mt-3 flex items-start gap-2 text-sm text-white/90">
          <Award className="mt-0.5 size-4 shrink-0 text-signal-orange" aria-hidden /> প্যানেল ইন্টারভিউ আর যাচাইযোগ্য KTA সার্টিফিকেট
        </p>
        <p className="mt-2 text-xs text-white/65">
          এ পর্যন্ত <Num value={graduates} /> জন উত্তীর্ণ
        </p>
      </div>
    </section>
  );
}
