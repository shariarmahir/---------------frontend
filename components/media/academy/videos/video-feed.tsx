"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Plus, Search, SearchX } from "lucide-react";
import { courses, departments, getCourse } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { SCHOOLS, canWatch, freeClassDone, weekOf, type ClassVideo, type School } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { Band, BandTitle, Turn } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { blankFill, lineupGrid } from "../catalogue/fill-row";
import { CatalogueRuler } from "../catalogue/ruler";
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
 * ক্লাস ভিডিও, in the catalogue's bands: the promise (a free class from
 * every teacher every week) and how many kept it, a search and a ruled strip
 * of filters over the grid of classes, and the shorts. Free classes play for
 * everyone; a course video for those in the course. A teacher puts videos
 * up from here, and is reminded while this week's free class is owed.
 */
export function VideoFeed() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const videos = useVideos();
  const enrolled = useAcademy((a) => a.enrolled);
  const t = useTeacher();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const [upload, setUpload] = useState(params.get("upload") === "1");

  const teaching = hydrated && Boolean(t.record && t.live.length);
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

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band
        id="intro"
        n={1}
        label="ক্লাস ভিডিও"
        now
        note={
          <>
            এ সপ্তাহে <Num value={done} />/<Num value={DUTY.length} /> জন শিক্ষক দিয়েছেন
          </>
        }
      >
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            প্রতি সপ্তাহে একটা <Turn>বিনামূল্যের</Turn> ক্লাস।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted)">
            প্রত্যেক শিক্ষক সপ্তাহে একটা পুরো ক্লাস সবার জন্য খুলে দেন — কে কীভাবে শেখান, ভর্তির আগেই দেখে নিন। কোর্সের বাকি ভিডিও ভর্তিদের জন্য।
          </p>
          <p data-reveal data-in className="hud mt-5 flex items-center gap-2 text-(--c-good)">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            এ সপ্তাহে <Num value={done} />/<Num value={DUTY.length} /> জন শিক্ষক বিনামূল্যের ক্লাস দিয়েছেন
          </p>
          {teaching && (
            <div data-reveal data-in className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => setUpload(true)} className={owes ? primaryBtn : secondaryBtn}>
                <Plus className="size-4" aria-hidden />
                ভিডিও তুলুন
              </button>
            </div>
          )}
        </div>
        {owes && (
          <p className="flex flex-wrap items-center gap-3 border-t border-(--c-line) bg-(--c-signal) px-6 py-3 text-sm font-semibold text-black md:px-10">
            <CalendarClock className="size-4.5 shrink-0" aria-hidden />এ সপ্তাহের বিনামূল্যের ক্লাস এখনো দেননি — সপ্তাহ শেষ শুক্রবার রাতে।
          </p>
        )}
      </Band>

      <Band
        id="classes"
        n={2}
        label="ক্লাস"
        note={
          <>
            <Num value={classes.length} />
            টি ভিডিও
          </>
        }
      >
        <form role="search" onSubmit={(e) => e.preventDefault()} className="flex border-b border-(--c-line)">
          <label htmlFor="video-q" className="sr-only">
            ভিডিও খুঁজুন
          </label>
          <span className="grid w-14 shrink-0 place-items-center text-(--c-faint) md:w-18" aria-hidden>
            <Search className="size-5" />
          </span>
          <input
            id="video-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ক্লাস, শিক্ষক বা কোর্স খুঁজুন"
            className="h-14 min-w-0 flex-1 bg-transparent pr-6 text-lg text-(--c-ink-strong) placeholder:text-(--c-faint) focus-visible:outline-none"
          />
        </form>
        <div role="toolbar" aria-label="ভিডিও বাছাই" className="flex gap-px overflow-x-auto border-b border-(--c-line) bg-(--c-line) scrollbar-none">
          {chipList.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={chip === c.id}
              onClick={() => setChip(c.id)}
              className={cn(
                "hud h-11 shrink-0 px-5 font-bold whitespace-nowrap transition-colors duration-150 first:pl-6 md:first:pl-10",
                chip === c.id ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)",
              )}
            >
              {c.label}
            </button>
          ))}
          <span aria-hidden className="flex-1 bg-(--c-bg)" />
        </div>

        {classes.length === 0 ? (
          <div className="mx-auto max-w-sm px-6 py-20 text-center">
            <SearchX className="mx-auto size-10 text-(--c-faint)" aria-hidden />
            <p className="display mt-4 text-xl text-(--c-ink-strong)">কোনো ভিডিও মিলল না</p>
            <p className="mt-1 text-sm text-(--c-muted)">অন্য শব্দে খুঁজুন, বা “সব” বাছুন।</p>
          </div>
        ) : (
          <div className="@container">
            <ul data-reveal-group className={lineupGrid}>
              {classes.map((v) => (
                <li key={v.id} data-reveal className="bg-(--c-bg) p-5">
                  <VideoCard video={v} locked={locked(v)} />
                </li>
              ))}
              <li aria-hidden className={cn("bg-(--c-bg)", blankFill(classes.length))} />
            </ul>
          </div>
        )}
      </Band>

      {shorts.length > 0 && (
        <Band id="shorts" n={3} label="ছোট ক্লাস" note="এক মিনিটের কম">
          <ul data-reveal-group className="grid grid-cols-2 gap-px bg-(--c-line) sm:grid-cols-3 lg:grid-cols-6">
            {shorts.slice(0, 6).map((v) => (
              <li key={v.id} data-reveal className="bg-(--c-bg) p-4">
                <ShortCard video={v} />
              </li>
            ))}
          </ul>
        </Band>
      )}

      <CatalogueFooter />
      {teaching && <UploadDialog open={upload} onOpenChange={setUpload} owes={owes} />}
    </CatalogueRoot>
  );
}
