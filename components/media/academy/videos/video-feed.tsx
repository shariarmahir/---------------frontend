"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, CheckCircle2, ChevronRight, Plus, Search, SearchX } from "lucide-react";
import { courses, departments, getCourse } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { SCHOOLS, canWatch, freeClassDone, weekOf, type ClassVideo, type School } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Num } from "../../ui/numerals";
import { useTeacher } from "../desk/use-teacher";
import { useAcademy } from "../use-academy";
import { UploadDialog } from "./upload-dialog";
import { useVideos } from "./use-videos";
import { ShortCard, VideoCard } from "./video-card";

const NOW = DEMO_NOW.toISOString();
const THIS_WEEK = weekOf(NOW);
/** Teachers who owe a free class a week: everyone with a running course. */
const DUTY = [...new Set(courses.map((c) => c.teacher))];
const schoolOf = new Map(courses.map((c) => [c.id, departments.find((d) => d.id === c.dept)?.school]));
const SCHOOL_CHIPS = (Object.keys(SCHOOLS) as School[]).filter((s) => departments.some((d) => d.school === s));

type Chip = "all" | "free" | "paid" | "week" | School;

/**
 * ক্লাস ভিডিও, laid out like a video site's home: a search bar and a row of
 * chips on top, then a grid of classes with a shelf of shorts after the
 * first rows. Free classes play for everyone; a course video for those in
 * the course. A teacher puts videos up from here, and is reminded while
 * this week's free class is still owed.
 */
export function VideoFeed() {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const videos = useVideos();
  const enrolled = useAcademy((a) => a.enrolled);
  const t = useTeacher();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const [upload, setUpload] = useState(params.get("upload") === "1");
  const chips = useRef<HTMLDivElement>(null);

  const teaching = Boolean(t.record && t.live.length);
  const owes = teaching && !freeClassDone(videos, t.handle, NOW);
  const done = DUTY.filter((h) => freeClassDone(videos, h, NOW)).length;

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase();
    return videos.filter((v) => {
      if (words) {
        const hay = `${v.title} ${personOrThrow(v.teacher).nameBn} ${v.course} ${getCourse(v.course)?.title ?? ""}`.toLowerCase();
        if (!hay.includes(words)) return false;
      }
      if (chip === "free") return v.access === "free";
      if (chip === "paid") return v.access === "paid";
      if (chip === "week") return weekOf(v.at) === THIS_WEEK || v.at > NOW;
      if (chip !== "all") return schoolOf.get(v.course) === chip;
      return true;
    });
  }, [videos, q, chip]);

  const classes = shown.filter((v) => !v.short);
  const shorts = shown.filter((v) => v.short);
  const locked = (v: ClassVideo) => hydrated && !canWatch(v, enrolled, t.handle);
  const chipList: { id: Chip; label: string }[] = [
    { id: "all", label: "সব" },
    { id: "free", label: "বিনামূল্যে" },
    { id: "paid", label: "কোর্সের ভিডিও" },
    { id: "week", label: "এ সপ্তাহের" },
    ...SCHOOL_CHIPS.map((s) => ({ id: s, label: SCHOOLS[s] })),
  ];

  const grid = (list: ClassVideo[], from: number) => (
    <ul className="grid gap-x-4 gap-y-9 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {list.map((v, i) => (
        <motion.li
          key={v.id}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -5% 0px" }}
          transition={{ delay: ((from + i) % 4) * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <VideoCard video={v} locked={locked(v)} />
        </motion.li>
      ))}
    </ul>
  );

  return (
    <div className="-mt-6">
      <div className="sticky top-0 z-20 -mx-3 bg-black px-3 pt-4 pb-3 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="hidden shrink-0 text-xl font-bold text-white md:block">ক্লাস ভিডিও</h1>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mx-auto flex min-w-0 flex-1 md:max-w-xl">
            <label htmlFor="video-q" className="sr-only">ভিডিও খুঁজুন</label>
            <input
              id="video-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ক্লাস, শিক্ষক বা কোর্স খুঁজুন"
              className="h-10 min-w-0 flex-1 rounded-l-full border border-white/20 bg-black px-4 text-[15px] text-white placeholder:text-white/45 focus-visible:border-signal-orange focus-visible:outline-none"
            />
            <button type="submit" className="grid h-10 w-14 shrink-0 place-items-center rounded-r-full border border-l-0 border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-16">
              <Search className="size-5" aria-hidden />
              <span className="sr-only">খুঁজুন</span>
            </button>
          </form>
          {hydrated && teaching && (
            <button type="button" onClick={() => setUpload(true)} className="relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:px-4">
              <Plus className="size-5" aria-hidden />
              <span className="hidden sm:inline">তৈরি করুন</span>
              <span className="sr-only sm:hidden">ভিডিও তুলুন</span>
              {owes && <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-signal-orange ring-2 ring-black" aria-label="এ সপ্তাহের বিনামূল্যের ক্লাস বাকি" />}
            </button>
          )}
        </div>

        <div className="relative mt-3">
          <div ref={chips} role="toolbar" aria-label="ভিডিও বাছাই" className="flex gap-3 overflow-x-auto scroll-smooth pr-10 scrollbar-none">
            {chipList.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={chip === c.id}
                onClick={() => setChip(c.id)}
                className={cn("h-8 shrink-0 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors", chip === c.id ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20")}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => chips.current?.scrollBy({ left: 240 })}
            className="absolute top-0 right-0 hidden size-8 place-items-center rounded-full bg-black text-white shadow-[-16px_0_16px_0_var(--color-black)] hover:bg-white/10 sm:grid"
          >
            <ChevronRight className="size-5" aria-hidden />
            <span className="sr-only">আরও বাছাই</span>
          </button>
        </div>
      </div>

      {hydrated && owes && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-signal-orange px-4 py-3 text-text-primary">
          <CalendarClock className="size-5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 text-sm font-semibold">এ সপ্তাহের বিনামূল্যের ক্লাস এখনো দেননি — সপ্তাহ শেষ শুক্রবার রাতে। প্রতি সপ্তাহে একটা, সবার জন্য।</p>
          <button type="button" onClick={() => setUpload(true)} className={mediaButton({ variant: "tile", size: "sm" })}>
            এখনই তুলুন
          </button>
        </div>
      )}

      <p className="mt-3 mb-5 flex items-center gap-2 text-sm text-white/70">
        <CheckCircle2 className="size-4 shrink-0 text-bdgreen-500" aria-hidden />
        এ সপ্তাহে <Num value={done} />/<Num value={DUTY.length} /> জন শিক্ষক বিনামূল্যের ক্লাস দিয়েছেন — সবার জন্য, বিনা ফিতে
      </p>

      {classes.length === 0 && shorts.length === 0 ? (
        <div className="mx-auto mt-16 max-w-sm text-center">
          <SearchX className="mx-auto size-10 text-white/50" aria-hidden />
          <p className="mt-3 font-semibold text-white">কোনো ভিডিও মিলল না</p>
          <p className="mt-1 text-sm text-white/65">অন্য শব্দে খুঁজুন, বা “সব” বাছুন।</p>
        </div>
      ) : (
        <>
          {grid(classes.slice(0, 8), 0)}
          {shorts.length > 0 && (
            <section aria-labelledby="shorts" className="my-10 border-y border-white/12 py-8">
              <h2 id="shorts" className="mb-5 flex items-center gap-2.5 text-xl font-bold text-white">
                <ShortsMark /> ছোট ক্লাস
              </h2>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {shorts.slice(0, 6).map((v, i) => (
                  <li key={v.id} className={cn(i >= 2 && "hidden sm:block", i === 3 && "sm:hidden lg:block", i >= 4 && "sm:hidden 2xl:block")}>
                    <ShortCard video={v} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {grid(classes.slice(8), 8)}
        </>
      )}

      {teaching && <UploadDialog open={upload} onOpenChange={setUpload} owes={owes} />}
    </div>
  );
}

/** The shelf's mark: a gold tile with a play triangle that nudges forward. */
function ShortsMark() {
  const reduce = useReducedMotion();
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-signal-orange" aria-hidden>
      <motion.svg viewBox="0 0 12 12" className="size-3.5" animate={reduce ? undefined : { x: [0, 2, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M2 1 L11 6 L2 11 Z" className="fill-text-primary" />
      </motion.svg>
    </span>
  );
}
