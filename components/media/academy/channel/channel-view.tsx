"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Link2, ListVideo, Play, Presentation, Quote, Search, SearchX, Upload, X } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { coursesBy, coursesOf, departments, deptsOfTeacher, getCourse, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, DEPT_KINDS, LEVELS, VIDEO_SORTS, canWatch, sortVideos, weekOf, type ClassVideo, type Course, type Department, type VideoSort, watchHref } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Ago, Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { AssetCard, AssetGrid } from "../catalogue/asset-card";
import { Band, twoDigits } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { blankFill, lineupGrid } from "../catalogue/fill-row";
import { CatalogueRuler } from "../catalogue/ruler";
import { TierTag } from "../catalogue/tier-tag";
import { toneStyle } from "../catalogue/tones";
import { useTeacher } from "../desk/use-teacher";
import { standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { ShortCard, Thumb, VideoCard } from "../videos/video-card";
import { CommentVotes } from "../videos/votes";
import { ChannelAbout } from "./channel-about";
import { ChannelCard } from "./channel-card";
import { ChannelRecord } from "./channel-record";
import { FollowButton, useFollowers } from "./follow";
import { Shelf, ShelfItem } from "./shelf";

type Tab = "home" | "videos" | "shorts" | "courses" | "stories" | "about" | "search";

const THIS_WEEK = weekOf(DEMO_NOW.toISOString());
const CARD_SIZES = "(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 78vw";
const toneOf = (dept?: string) => departments.findIndex((d) => d.id === dept);

/** A course's videos in playlist order: week by week, the earliest upload first. */
const playlist = (videos: ClassVideo[], course: string) => videos.filter((v) => v.course === course && !v.short).sort((a, b) => a.week - b.week || a.at.localeCompare(b.at));

/**
 * A teacher's channel, in the catalogue's bands: the face, the record in
 * numbers and the way to follow, with their course pictures fanned beside;
 * then a ruled strip of tabs — home (one section per department they teach
 * in, a shelf per course), videos, shorts, courses as playlists, their
 * learners' success, and the record behind them — and a search.
 */
export function ChannelView({ handle }: { handle: string }) {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const all = useVideos();
  const enrolled = useAcademy((a) => a.enrolled);
  const viewer = useTeacher().handle;
  const person = personOrThrow(handle);
  const record = teacherRecord(handle)!;
  const depts = deptsOfTeacher(handle);
  const courses = coursesBy(handle);
  const followers = useFollowers(handle);
  const [about, setAbout] = useState(false);

  const videos = useMemo(() => all.filter((v) => v.teacher === handle), [all, handle]);
  const full = videos.filter((v) => !v.short);
  const shorts = videos.filter((v) => v.short);
  const views = videos.reduce((n, v) => n + v.views, 0);
  const own = viewer === handle;
  const locked = (v: ClassVideo) => hydrated && !canWatch(v, enrolled, viewer);
  const tier = standingOf(record).tier;

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "হোম" },
    { id: "videos", label: "ভিডিও" },
    ...(shorts.length ? [{ id: "shorts" as const, label: "শর্টস" }] : []),
    { id: "courses", label: "কোর্স" },
    ...(record.stories.length ? [{ id: "stories" as const, label: "সফলতা" }] : []),
    { id: "about", label: "পরিচিতি" },
  ];
  const q = params.get("q")?.trim().slice(0, 60) ?? "";
  const asked = params.get("tab");
  const tab: Tab = q ? "search" : (tabs.find((t) => t.id === asked)?.id ?? "home");
  const tabLabel = tab === "search" ? "খোঁজ" : tabs.find((t) => t.id === tab)!.label;

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="শিক্ষক" now note={<>@{handle}</>}>
        <div style={toneStyle(toneOf(depts[0]?.id))} className="tone grid gap-12 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <PersonAvatar person={person} size="xl" className="size-24 shrink-0 text-4xl ring-2 ring-(--c-app) sm:size-32 sm:text-5xl" />
            <div data-reveal data-in className="min-w-0">
              <h1 className="display flex items-center gap-3 text-4xl leading-tight text-(--c-ink-strong) sm:text-5xl">
                <span className="min-w-0">{person.nameBn}</span>
                <BadgeCheck className="size-7 shrink-0 text-(--c-accent-ink)" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
              </h1>
              <p className="hud mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-(--c-muted)">
                <TierTag tier={tier} />
                <span>
                  <Compact n={followers} /> অনুসারী
                </span>
                <span>
                  <Num value={videos.length} />
                  টি ভিডিও
                </span>
              </p>
              <button type="button" onClick={() => setAbout(true)} className="group mt-4 flex w-full max-w-2xl min-w-0 items-baseline gap-1.5 text-left leading-relaxed text-(--c-muted)">
                <span className="line-clamp-2 min-w-0">
                  {record.title}। {person.bio}
                </span>
                <span className="shrink-0 font-semibold text-(--c-ink-strong) underline-offset-4 group-hover:underline">আরও</span>
              </button>
              {depts.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Link2 className="size-4 text-(--c-app-ink)" aria-hidden />
                  {depts.map((d) => (
                    <Link key={d.id} href={`/media/academy/dept/${d.id}`} className="font-semibold text-(--c-app-ink) underline-offset-4 hover:underline">
                      {d.name}
                    </Link>
                  ))}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {own ? (
                  <>
                    <Link href="/media/academy/videos?upload=1" className={cn(primaryBtn, "h-11")}>
                      <Upload className="size-4" aria-hidden /> ভিডিও তুলুন
                    </Link>
                    <Link href="/media/academy/classroom" className={cn(secondaryBtn, "h-11")}>
                      <Presentation className="size-4" aria-hidden /> আমার ক্লাসরুম
                    </Link>
                  </>
                ) : (
                  <FollowButton handle={handle} name={person.nameBn} className="h-11" />
                )}
              </div>
            </div>
          </div>
          <Fan depts={depts} courses={courses} />
        </div>
        <dl data-reveal-group className="grid grid-cols-2 gap-px border-t border-(--c-line) bg-(--c-line) md:grid-cols-4">
          {[
            { k: "অনুসারী", v: <Compact n={followers} /> },
            { k: "ভিডিও দেখা", v: <Compact n={views} /> },
            { k: "গ্র্যাজুয়েট", v: <Num value={record.graduates} /> },
            { k: "রেটিং", v: record.rating.count ? <Num value={record.rating.avg} decimals={1} /> : "নতুন" },
          ].map((s) => (
            <div key={s.k} data-reveal className="flex flex-col-reverse bg-(--c-bg) px-6 py-6 md:px-10">
              <dt className="hud mt-2 text-(--c-faint)">{s.k}</dt>
              <dd className="display text-4xl leading-none text-(--c-ink-strong)">{s.v}</dd>
            </div>
          ))}
        </dl>
        <TabBar handle={handle} tabs={tabs} tab={tab} q={q} />
      </Band>

      <Band id={`tab-${tab}`} n={2} label={tabLabel} note={person.nameBn}>
        {tab === "home" && <HomeTab handle={handle} all={all} full={full} shorts={shorts} depts={depts} courses={courses} locked={locked} />}
        {tab === "videos" && <VideosTab full={full} depts={depts} locked={locked} />}
        {tab === "shorts" && (
          <ul className="grid grid-cols-2 gap-px bg-(--c-line) sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {sortVideos(shorts, "latest").map((v) => (
              <li key={v.id} className="bg-(--c-bg) p-4">
                <ShortCard video={v} />
              </li>
            ))}
          </ul>
        )}
        {tab === "courses" && <CoursesTab handle={handle} depts={depts} courses={courses} videos={full} />}
        {tab === "stories" && <StoriesTab handle={handle} />}
        {tab === "about" && <ChannelRecord record={record} person={person} />}
        {tab === "search" && <SearchResults q={q} videos={videos} locked={locked} />}
      </Band>

      <CatalogueFooter />
      <ChannelAbout open={about} onOpenChange={setAbout} person={person} followers={followers} videos={videos.length} views={views} />
    </CatalogueRoot>
  );
}

/** Up to three of their course pictures, fanned and drifting a little; still when the viewer asks for less motion. */
function Fan({ depts, courses }: { depts: Department[]; courses: Course[] }) {
  const reduce = useReducedMotion();
  const pics = [...new Set([...courses.map((c) => c.image), ...depts.flatMap((d) => coursesOf(d.id).map((c) => c.image))])].slice(0, 3);
  const fan = [
    { rotate: -7, x: "-10rem", y: "0.75rem", z: 1 },
    { rotate: 2, x: "-5rem", y: "-0.5rem", z: 3 },
    { rotate: 8, x: "0rem", y: "1rem", z: 2 },
  ];
  return (
    <div className="relative hidden h-44 w-88 lg:block" aria-hidden>
      {pics.map((src, i) => (
        <span key={src} className="absolute top-1/2 right-0 block" style={{ zIndex: fan[i].z, transform: `translate(${fan[i].x}, calc(-50% + ${fan[i].y})) rotate(${fan[i].rotate}deg)` }}>
          <motion.span
            className="relative block aspect-video w-52 overflow-hidden border-2 border-(--c-bg) bg-(--c-bg-sunken) shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]"
            initial={reduce ? false : { opacity: 0, x: 60, scale: 0.9 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1, y: [0, -6, 0] }}
            transition={
              reduce
                ? undefined
                : { opacity: { duration: 0.5, delay: i * 0.12 }, x: { type: "spring", stiffness: 120, damping: 16, delay: i * 0.12 }, scale: { duration: 0.5, delay: i * 0.12 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: 0.8 } }
            }
          >
            <Image src={src} alt="" fill sizes="208px" className="object-cover" />
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────── */

/** The channel's parts as a ruled strip of links (each a shareable address), with a search at its end. */
function TabBar({ handle, tabs, tab, q }: { handle: string; tabs: { id: Tab; label: string }[]; tab: Tab; q: string }) {
  const router = useRouter();
  const path = usePathname();
  const [searching, setSearching] = useState(!!q);
  const input = useRef<HTMLInputElement>(null);
  const base = `/media/academy/teachers/${handle}`;

  useEffect(() => {
    if (searching) input.current?.focus();
  }, [searching]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = new FormData(e.currentTarget).get("q")?.toString().trim().slice(0, 60);
    if (text) router.push(`${path}?q=${encodeURIComponent(text)}`, { scroll: false });
  }

  return (
    <nav aria-label="চ্যানেলের ভাগ" className="flex flex-wrap gap-px border-t border-(--c-line) bg-(--c-line)">
      {tabs.map((t) => {
        const on = tab === t.id;
        return (
          <Link
            key={t.id}
            href={t.id === "home" ? base : `${base}?tab=${t.id}`}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={cn("hud flex h-11 items-center px-5 font-bold transition-colors duration-150 first:pl-6 md:first:pl-10", on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)")}
          >
            {t.label}
          </Link>
        );
      })}
      <div className="flex flex-1 items-stretch justify-end bg-(--c-bg)">
        {searching ? (
          <form role="search" onSubmit={submit} className="flex items-center gap-2 border-l border-(--c-line) pl-4">
            <Search className="size-4 text-(--c-faint)" aria-hidden />
            <label className="sr-only" htmlFor="channel-q">
              এই চ্যানেলে খুঁজুন
            </label>
            <input
              ref={input}
              id="channel-q"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={60}
              placeholder="এই চ্যানেলে খুঁজুন"
              onKeyDown={(e) => e.key === "Escape" && setSearching(false)}
              className="h-11 w-36 bg-transparent text-sm text-(--c-ink-strong) placeholder:text-(--c-faint) focus:outline-none sm:w-56"
            />
            <button
              type="button"
              onClick={() => {
                setSearching(false);
                if (q) router.push(base, { scroll: false });
              }}
              className="grid size-11 place-items-center text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
            >
              <X className="size-4" aria-hidden />
              <span className="sr-only">খোঁজা বন্ধ</span>
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setSearching(true)} className="grid size-11 place-items-center border-l border-(--c-line) text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
            <Search className="size-4.5" aria-hidden />
            <span className="sr-only">এই চ্যানেলে খুঁজুন</span>
          </button>
        )}
      </div>
    </nav>
  );
}

/* ── Home ──────────────────────────────────────────────────────────── */

function HomeTab({ handle, all, full, shorts, depts, courses, locked }: { handle: string; all: ClassVideo[]; full: ClassVideo[]; shorts: ClassVideo[]; depts: Department[]; courses: Course[]; locked: (v: ClassVideo) => boolean }) {
  const record = teacherRecord(handle)!;
  const person = personOrThrow(handle);
  const featured = sortVideos(
    full.filter((v) => v.access === "free"),
    "latest",
  )[0];

  // One section per department: a shelf per own course, or — for a member with no course of their own yet — the team's classes.
  const sections = depts
    .map((d) => {
      const shelves = courses
        .filter((c) => c.dept === d.id)
        .map((c) => ({ course: c, items: playlist(full, c.id) }))
        .filter((s) => s.items.length > 0);
      const team = shelves.length
        ? []
        : sortVideos(
            all.filter((v) => !v.short && v.teacher !== handle && getCourse(v.course)?.dept === d.id),
            "latest",
          );
      return { dept: d, shelves, team };
    })
    .filter((s) => s.shelves.length || s.team.length);

  const mates = [...new Set(depts.flatMap((d) => d.teachers))].filter((h) => h !== handle && teacherRecord(h));

  return (
    <div>
      {featured && <Featured video={featured} locked={locked(featured)} />}

      {sections.map(({ dept, shelves, team }) => (
        <section key={dept.id} aria-labelledby={`dept-${dept.id}`} style={toneStyle(toneOf(dept.id))} className="tone">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-(--c-line) bg-(--c-bg-raised) px-6 py-4 md:px-10">
            <span className="size-2.5 bg-(--c-app)" aria-hidden />
            <h2 id={`dept-${dept.id}`} className="display text-xl text-(--c-ink-strong)">
              {dept.name}
            </h2>
            <span className="hud border border-(--c-line) px-1.5 text-(--c-app-ink)">
              {dept.teachers[0] === handle ? "প্রধান" : "সদস্য"} · {DEPT_KINDS[dept.kind]}
            </span>
            <Link href={`/media/academy/dept/${dept.id}`} className="hud group ml-auto inline-flex items-center gap-1 text-(--c-muted) hover:text-(--c-ink-strong)">
              বিভাগের পাতা <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
          </div>

          {shelves.map(({ course, items }) => (
            <Shelf key={course.id} eyebrow={`${course.id} · ${LEVELS[course.level]}`} title={course.title} playAll={watchHref(items[0])} about={course.outcome}>
              {items.map((v) => (
                <ShelfItem key={v.id}>
                  <VideoCard video={v} locked={locked(v)} channel sizes={CARD_SIZES} />
                </ShelfItem>
              ))}
            </Shelf>
          ))}

          {team.length > 0 && (
            <Shelf title="দলের সাথীদের ক্লাস" about={`${person.nameBn} এই বিভাগের দলে আছেন; নিজের কোর্স এলে এখানে আসবে। ততক্ষণ দলের অন্যদের ক্লাস।`}>
              {team.map((v) => (
                <ShelfItem key={v.id}>
                  <VideoCard video={v} locked={locked(v)} sizes={CARD_SIZES} />
                </ShelfItem>
              ))}
            </Shelf>
          )}
        </section>
      ))}

      {shorts.length > 0 && (
        <Shelf title="শর্টস" tall>
          {sortVideos(shorts, "latest").map((v) => (
            <ShelfItem key={v.id} tall>
              <ShortCard video={v} />
            </ShelfItem>
          ))}
        </Shelf>
      )}

      {record.stories.length > 0 && (
        <Shelf title="শিক্ষার্থীদের সফলতা" about="যাঁরা শিখে কাজে লাগিয়েছেন — তাঁদের নিজের কথায়।">
          {record.stories.map((s) => (
            <ShelfItem key={s.name}>
              <figure className="flex h-full flex-col border border-(--c-line) bg-(--c-bg-raised) p-5">
                <Quote className="size-5 text-(--c-signal)" aria-hidden />
                <blockquote className="mt-3 line-clamp-4 flex-1 leading-relaxed text-(--c-ink)">{s.text}</blockquote>
                <figcaption className="turn mt-4 text-xl">— {s.name}</figcaption>
              </figure>
            </ShelfItem>
          ))}
        </Shelf>
      )}

      {mates.length > 0 && (
        <section aria-labelledby="mates">
          <h3 id="mates" className="hud border-b border-(--c-line) px-6 py-3 text-(--c-faint) md:px-10">
            একই বিভাগের শিক্ষক
          </h3>
          <ul className="grid grid-cols-2 gap-px bg-(--c-line) sm:grid-cols-3 lg:grid-cols-5">
            {mates.map((h) => (
              <li key={h} className="bg-(--c-bg)">
                <ChannelCard handle={h} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** The newest free class, big, with what it is about — the channel's trailer. */
function Featured({ video, locked }: { video: ClassVideo; locked: boolean }) {
  const course = getCourse(video.course);
  const thisWeek = weekOf(video.at) === THIS_WEEK;
  return (
    <section aria-labelledby="featured" className="grid gap-px border-b border-(--c-line) bg-(--c-line) md:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
      <Link href={watchHref(video)} className="group block bg-(--c-bg) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--c-signal)" aria-label={video.title}>
        <Thumb video={video} locked={locked} className="aspect-video" sizes="(min-width: 768px) 28rem, 92vw" />
      </Link>
      <div className="min-w-0 bg-(--c-bg) p-6 md:p-8">
        <p className="hud text-(--c-signal)">{thisWeek ? "এ সপ্তাহের বিনামূল্যের ক্লাস" : "সর্বশেষ বিনামূল্যের ক্লাস"}</p>
        <h2 id="featured" className="display mt-2 text-2xl leading-snug text-(--c-ink-strong)">
          <Link href={watchHref(video)} className="underline-offset-4 hover:underline">
            {video.title}
          </Link>
        </h2>
        <p className="hud mt-2 text-(--c-faint)">
          <Compact n={video.views} /> বার দেখা · <Ago iso={video.at} />
        </p>
        <p className="mt-4 line-clamp-4 max-w-2xl leading-relaxed text-(--c-muted)">
          {video.about ?? (
            <>
              “{course?.title}” কোর্সের সপ্তাহ <Num value={video.week} />
              -এর ক্লাস — সবার জন্য বিনামূল্যে। {course?.outcome}
            </>
          )}
        </p>
        <Link href={watchHref(video)} className={cn(primaryBtn, "mt-6 h-11")}>
          <Play className="size-4 fill-current" aria-hidden /> দেখুন
        </Link>
      </div>
    </section>
  );
}

/** Nothing to show, said plainly in the middle of the band. */
function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <SearchX className="size-10 text-(--c-faint)" aria-hidden />
      <p className="display mt-4 text-xl text-(--c-ink-strong)">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-(--c-muted)">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Videos ────────────────────────────────────────────────────────── */

/** Every full class, newest, most watched or oldest first, narrowed to a department when the teacher has more than one. */
function VideosTab({ full, depts, locked }: { full: ClassVideo[]; depts: Department[]; locked: (v: ClassVideo) => boolean }) {
  const [by, setBy] = useState<VideoSort>("latest");
  const [dept, setDept] = useState<string | null>(null);
  const deptOf = (v: ClassVideo) => getCourse(v.course)?.dept;
  const withVideos = depts.filter((d) => full.some((v) => deptOf(v) === d.id));
  const shown = sortVideos(dept ? full.filter((v) => deptOf(v) === dept) : full, by);
  const chip = (on: boolean) => cn("hud h-11 shrink-0 px-5 font-bold whitespace-nowrap transition-colors duration-150", on ? "bg-(--c-invert-bg) text-(--c-invert-fg)" : "bg-(--c-bg) text-(--c-muted) hover:text-(--c-ink-strong)");

  if (full.length === 0) return <Empty title="এখনো কোনো ভিডিও নেই" body="নিজের কোর্স শুরু হলে প্রতি সপ্তাহের বিনামূল্যের ক্লাস এখানে আসবে।" />;

  return (
    <>
      <div role="group" aria-label="সাজান ও বিভাগ" className="flex gap-px overflow-x-auto border-b border-(--c-line) bg-(--c-line) scrollbar-none">
        {(Object.keys(VIDEO_SORTS) as VideoSort[]).map((s) => (
          <button key={s} type="button" aria-pressed={by === s} onClick={() => setBy(s)} className={cn(chip(by === s), "first:pl-6 md:first:pl-10")}>
            {VIDEO_SORTS[s]}
          </button>
        ))}
        {withVideos.length > 1 && (
          <>
            <span aria-hidden className="w-3 shrink-0 bg-(--c-bg)" />
            <button type="button" aria-pressed={!dept} onClick={() => setDept(null)} className={chip(!dept)}>
              সব বিভাগ
            </button>
            {withVideos.map((d) => (
              <button key={d.id} type="button" aria-pressed={dept === d.id} onClick={() => setDept(d.id)} className={chip(dept === d.id)}>
                {d.name}
              </button>
            ))}
          </>
        )}
        <span aria-hidden className="flex-1 bg-(--c-bg)" />
      </div>
      <div className="@container">
        <ul className={lineupGrid}>
          {shown.map((v) => (
            <li key={v.id} className="bg-(--c-bg) p-5">
              <VideoCard video={v} locked={locked(v)} channel />
            </li>
          ))}
          <li aria-hidden className={cn("bg-(--c-bg)", blankFill(shown.length))} />
        </ul>
      </div>
    </>
  );
}

/* ── Courses (playlists) ───────────────────────────────────────────── */

function CoursesTab({ handle, depts, courses, videos }: { handle: string; depts: Department[]; courses: Course[]; videos: ClassVideo[] }) {
  const groups = depts.map((d) => ({ dept: d, list: courses.filter((c) => c.dept === d.id) })).filter((g) => g.list.length);
  if (groups.length === 0) {
    const d = depts[0];
    return (
      <Empty
        title="এখনো নিজের কোর্স নেই"
        body={`${personOrThrow(handle).nameBn} দলের সাথে শেখান। নিজের কোর্স প্যানেলে পাস হলে এখানে আসবে।`}
        action={
          d && (
            <Link href={`/media/academy/dept/${d.id}`} className={secondaryBtn}>
              {d.name} — দলের কোর্স
            </Link>
          )
        }
      />
    );
  }
  return (
    <div>
      {groups.map(({ dept, list }) => (
        <section key={dept.id} aria-labelledby={`pl-${dept.id}`} style={toneStyle(toneOf(dept.id))} className="tone">
          <h2 id={`pl-${dept.id}`} className="display flex items-center gap-3 border-b border-(--c-line) bg-(--c-bg-raised) px-6 py-4 text-xl text-(--c-ink-strong) md:px-10">
            <span className="size-2.5 bg-(--c-app)" aria-hidden />
            {dept.name}
          </h2>
          <AssetGrid count={list.length}>
            {list.map((c, i) => (
              <li key={c.id} className="bg-(--c-bg)">
                <PlaylistCard course={c} items={playlist(videos, c.id)} n={i + 1} />
              </li>
            ))}
          </AssetGrid>
        </section>
      ))}
    </div>
  );
}

/** A course as a playlist: the picture with the count of its videos, "সব চালান" under the pointer, and the way to the course. */
function PlaylistCard({ course, items, n }: { course: Course; items: ClassVideo[]; n: number }) {
  const href = items[0] ? watchHref(items[0]) : `/media/academy/course/${course.id}`;
  return (
    <AssetCard
      kind={{ icon: ListVideo, label: <span className="font-mono">{course.id}</span> }}
      n={n}
      frame={
        <Link href={href} className="group relative block aspect-video overflow-hidden bg-(--c-bg-sunken)" aria-label={`${course.title} — ${items.length ? "সব চালান" : "কোর্সের পাতা"}`}>
          <Image src={course.image} alt="" fill sizes="(min-width: 1024px) 26rem, (min-width: 768px) 46vw, 94vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
          <span className="hud absolute right-2 bottom-2 inline-flex items-center gap-1 bg-black/80 px-1.5 py-0.5 text-white">
            <ListVideo className="size-3.5" aria-hidden /> <Num value={items.length} />
            টি ভিডিও
          </span>
          <span className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" aria-hidden>
            <span className="inline-flex items-center gap-2 bg-(--c-invert-bg) px-4 py-2 text-sm font-bold text-(--c-invert-fg)">
              <Play className="size-4 fill-current" /> {items.length ? "সব চালান" : "কোর্সের পাতা"}
            </span>
          </span>
        </Link>
      }
      title={course.title}
      text={
        <p className="hud text-(--c-app-ink)">
          {LEVELS[course.level]} · <Num value={COURSE_DAYS} /> দিন
        </p>
      }
      action={{ href: `/media/academy/course/${course.id}`, label: "পুরো কোর্স দেখুন", icon: ArrowUpRight }}
    />
  );
}

/* ── Stories ───────────────────────────────────────────────────────── */

function StoriesTab({ handle }: { handle: string }) {
  const record = teacherRecord(handle)!;
  return (
    <AssetGrid count={record.stories.length}>
      {record.stories.map((s, i) => (
        <li key={s.name} className="bg-(--c-bg)">
          <AssetCard
            kind={{ icon: Quote, label: "শিক্ষার্থীর সফলতা" }}
            n={i + 1}
            title={<span className="turn text-3xl">{s.name}</span>}
            text={<p className="text-base text-(--c-ink)">“{s.text}”</p>}
            extra={
              <div className="mt-4 -ml-2">
                <CommentVotes id={`story:${handle}:${i}`} base={30 + ((s.text.length * 7) % 90)} />
              </div>
            }
          />
        </li>
      ))}
    </AssetGrid>
  );
}

/* ── Search ────────────────────────────────────────────────────────── */

function SearchResults({ q, videos, locked }: { q: string; videos: ClassVideo[]; locked: (v: ClassVideo) => boolean }) {
  const needle = q.toLowerCase();
  const found = sortVideos(
    videos.filter((v) => [v.title, v.course, getCourse(v.course)?.title ?? ""].some((f) => f.toLowerCase().includes(needle))),
    "latest",
  );
  if (found.length === 0) return <Empty title={`“${q}” — এই চ্যানেলে মিলল না`} body="অন্য শব্দে খুঁজুন, বা ভিডিও ভাগে সব দেখুন।" />;
  return (
    <ul>
      {found.map((v, i) => {
        const course = getCourse(v.course);
        return (
          <li key={v.id} className="border-b border-(--c-line) last:border-b-0">
            <Link href={watchHref(v)} className="group flex gap-5 px-6 py-5 transition-colors duration-150 hover:bg-(--c-bg-raised) md:px-10">
              <span className="hud w-6 shrink-0 pt-1 text-(--c-faint)">{twoDigits(i + 1)}</span>
              <Thumb video={v} locked={locked(v)} className={cn("shrink-0", v.short ? "aspect-9/14 w-24 sm:w-28" : "aspect-video w-40 sm:w-60")} sizes="240px" />
              <span className="min-w-0 py-0.5">
                <span className="display line-clamp-2 text-lg text-(--c-ink-strong) underline-offset-4 group-hover:underline">{v.title}</span>
                <span className="hud mt-1 block text-(--c-faint)">
                  <Compact n={v.views} /> বার দেখা · <Ago iso={v.at} />
                </span>
                <span className="mt-2 hidden text-sm text-(--c-muted) sm:line-clamp-2">
                  {course?.title} · সপ্তাহ <Num value={v.week} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
