"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Link2, ListVideo, Play, Presentation, Quote, Search, Upload, X } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { coursesBy, coursesOf, deptsOfTeacher, getCourse, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, DEPT_KINDS, LEVELS, VIDEO_SORTS, canWatch, sortVideos, weekOf, type ClassVideo, type Course, type Department, type VideoSort } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { EmptyState } from "../../ui/empty-state";
import { chipClass } from "../../ui/field-styles";
import { Ago, Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useTeacher } from "../desk/use-teacher";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "../videos/use-videos";
import { ShortCard, Thumb, VideoCard, watchHref } from "../videos/video-card";
import { CommentVotes } from "../videos/votes";
import { ChannelAbout } from "./channel-about";
import { ChannelCard } from "./channel-card";
import { ChannelRecord } from "./channel-record";
import { FollowButton, useFollowers } from "./follow";
import { Shelf, ShelfItem } from "./shelf";

type Tab = "home" | "videos" | "shorts" | "courses" | "stories" | "about" | "search";

const THIS_WEEK = weekOf(DEMO_NOW.toISOString());
const CARD_SIZES = "(min-width: 1536px) 18vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 78vw";

/** A course's videos in playlist order: week by week, the earliest upload first. */
const playlist = (videos: ClassVideo[], course: string) => videos.filter((v) => v.course === course && !v.short).sort((a, b) => a.week - b.week || a.at.localeCompare(b.at));

/**
 * A teacher's channel, laid out like a video site's: a banner, the face and
 * numbers, a follow button with a bell, and tabs — home (one section per
 * department they teach in, a shelf per course), videos, shorts, courses as
 * playlists, their learners' success stories, and the record behind them.
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

  return (
    <div className="mx-auto max-w-[96rem]">
      <Banner handle={handle} depts={depts} courses={courses} />

      <header className="mt-4 flex items-start gap-4 sm:mt-6 sm:items-center sm:gap-6">
        <PersonAvatar person={person} size="xl" className="size-18 text-3xl sm:size-40 sm:text-6xl" />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl leading-tight font-bold text-m-ink sm:text-4xl">
            <span className="min-w-0 truncate">{person.nameBn}</span>
            <BadgeCheck className="size-5 shrink-0 text-m-ink/75 sm:size-7" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
          </h1>
          <p className="mt-1.5 text-sm text-m-ink/70">
            <span className="font-semibold text-m-ink">@{handle}</span> · <Compact n={followers} /> অনুসারী · <Num value={videos.length} />টি ভিডিও
          </p>
          <button type="button" onClick={() => setAbout(true)} className="group mt-2 flex w-full max-w-2xl min-w-0 items-baseline gap-1 text-left text-sm text-m-ink/70">
            <span className="min-w-0 truncate">
              {record.title}। {person.bio}
            </span>
            <span className="shrink-0 font-semibold text-m-ink group-hover:text-m-blue">...আরও</span>
          </button>
          {depts[0] && (
            <p className="mt-1.5 flex flex-wrap items-center gap-1 text-sm">
              <Link2 className="size-4 text-m-blue" aria-hidden />
              <Link href={`/media/academy/dept/${depts[0].id}`} className="font-semibold text-m-blue hover:underline">
                {depts[0].name}
              </Link>
              {depts.length > 1 && (
                <button type="button" onClick={() => setAbout(true)} className="font-semibold text-m-ink hover:text-m-blue">
                  ও আরও <Num value={depts.length - 1} />টি বিভাগ
                </button>
              )}
            </p>
          )}
          <div className="mt-3 hidden flex-wrap items-center gap-2 sm:flex">
            <Actions own={own} handle={handle} name={person.nameBn} tier={standingOf(record).tier} />
          </div>
        </div>
      </header>
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:hidden">
        <Actions own={own} handle={handle} name={person.nameBn} tier={standingOf(record).tier} />
      </div>

      <TabBar handle={handle} tabs={tabs} tab={tab} q={q} />

      <div className="pt-6">
        {tab === "home" && <HomeTab handle={handle} all={all} full={full} shorts={shorts} depts={depts} courses={courses} locked={locked} />}
        {tab === "videos" && <VideosTab full={full} depts={depts} locked={locked} />}
        {tab === "shorts" && (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {sortVideos(shorts, "latest").map((v) => (
              <li key={v.id}>
                <ShortCard video={v} />
              </li>
            ))}
          </ul>
        )}
        {tab === "courses" && <CoursesTab handle={handle} depts={depts} courses={courses} videos={full} />}
        {tab === "stories" && <StoriesTab handle={handle} />}
        {tab === "about" && <ChannelRecord record={record} person={person} />}
        {tab === "search" && <SearchResults q={q} videos={videos} locked={locked} />}
      </div>

      <ChannelAbout open={about} onOpenChange={setAbout} person={person} followers={followers} videos={videos.length} views={views} />
    </div>
  );
}

function Actions({ own, handle, name, tier }: { own: boolean; handle: string; name: string; tier: ReturnType<typeof standingOf>["tier"] }) {
  return (
    <>
      {own ? (
        <>
          <Link href="/media/academy/videos?upload=1" className={mediaButton({ className: "h-10 rounded-full" })}>
            <Upload aria-hidden /> ভিডিও তুলুন
          </Link>
          <Link href="/media/academy/desk" className={mediaButton({ variant: "quiet", className: "h-10 rounded-full" })}>
            <Presentation aria-hidden /> শিক্ষক ডেস্ক
          </Link>
        </>
      ) : (
        <FollowButton handle={handle} name={name} />
      )}
      <TierBadge tier={tier} />
    </>
  );
}

/* ── Banner ────────────────────────────────────────────────────────── */

/**
 * The channel art: bottle green, the teacher's name large in gold over the
 * department, and their course pictures fanned on the right, drifting a
 * little. Still when the viewer asks for less motion.
 */
function Banner({ handle, depts, courses }: { handle: string; depts: Department[]; courses: Course[] }) {
  const reduce = useReducedMotion();
  const person = personOrThrow(handle);
  const pics = [...new Set([...courses.map((c) => c.image), ...depts.flatMap((d) => coursesOf(d.id).map((c) => c.image))])].slice(0, 3);
  const fan = [
    { rotate: -8, x: "-11rem", y: "0.5rem", z: 1 },
    { rotate: 3, x: "-5.5rem", y: "-0.5rem", z: 3 },
    { rotate: 10, x: "0rem", y: "0.75rem", z: 2 },
  ];

  return (
    <div className="relative min-h-32 overflow-hidden rounded-2xl bg-m-blue-soft sm:aspect-[6/1] sm:min-h-40">
      <div className="relative z-10 flex h-full min-h-32 flex-col justify-center px-5 py-5 sm:min-h-40 sm:px-10 lg:max-w-[60%]">
        <p className="flex items-center gap-2 text-xs font-bold text-m-ink/85 sm:text-sm">
          <Pixels reduce={!!reduce} />
          {depts[0]?.name}
        </p>
        <p className="mt-1.5 text-3xl leading-tight font-extrabold text-m-blue sm:text-5xl">{person.nameBn}</p>
        <p className="mt-1 text-xs font-semibold text-m-ink sm:text-sm">প্রতি সপ্তাহে একটা ক্লাস বিনামূল্যে · সবার জন্য</p>
      </div>
      <div className="absolute top-1/2 right-10 hidden h-0 w-0 md:block" aria-hidden>
        {pics.map((src, i) => (
          <span key={src} className="absolute top-0 right-0 block" style={{ zIndex: fan[i].z, transform: `translate(${fan[i].x}, calc(-50% + ${fan[i].y})) rotate(${fan[i].rotate}deg)` }}>
            <motion.span
              className="relative block aspect-video w-44 overflow-hidden rounded-lg bg-m-canvas ring-3 ring-white lg:w-52"
              initial={reduce ? false : { opacity: 0, x: 60, scale: 0.9 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1, y: [0, -6, 0] }}
              transition={reduce ? undefined : { opacity: { duration: 0.5, delay: i * 0.12 }, x: { type: "spring", stiffness: 120, damping: 16, delay: i * 0.12 }, scale: { duration: 0.5, delay: i * 0.12 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: 0.8 } }}
            >
              <Image src={src} alt="" fill sizes="208px" className="object-cover" />
            </motion.span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Four gold pixels falling into place — the brand's "one fixed pixel at a time". */
function Pixels({ reduce }: { reduce: boolean }) {
  return (
    <span className="inline-grid grid-cols-2 gap-0.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className={cn("size-1.5 rounded-[1px]", i === 3 ? "bg-white" : "bg-m-yellow")}
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 400, damping: 18 }}
        />
      ))}
    </span>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────── */

function TabBar({ handle, tabs, tab, q }: { handle: string; tabs: { id: Tab; label: string }[]; tab: Tab; q: string }) {
  const reduce = useReducedMotion();
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

  // Sticks at the very top of the scrolling area: its own top padding covers the area's padding, so nothing shows through above.
  return (
    <nav aria-label="চ্যানেলের ভাগ" className="frost-pane sticky -top-6 z-20 -mx-3 px-3 pt-6 sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-1">
        <ul className="flex min-w-0 flex-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const on = tab === t.id;
            return (
              <li key={t.id} className="shrink-0">
                <Link
                  href={t.id === "home" ? base : `${base}?tab=${t.id}`}
                  scroll={false}
                  aria-current={on ? "page" : undefined}
                  className={cn("relative flex h-12 items-center px-3 text-[15px] font-semibold transition-colors sm:px-4", on ? "text-m-ink" : "text-m-ink/60 hover:text-m-ink")}
                >
                  {t.label}
                  {on && <motion.span layoutId="channel-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-white" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }} />}
                  {!on && <span className="absolute inset-x-2 bottom-0 h-0.5 scale-x-0 rounded-full bg-m-ink/22 transition-transform duration-200 [a:hover>&]:scale-x-100" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
        {searching ? (
          <form role="search" onSubmit={submit} className="flex shrink-0 items-center gap-1 border-b border-m-ink/51">
            <Search className="size-4.5 text-m-ink/70" aria-hidden />
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
              className="h-9 w-32 bg-transparent text-sm text-m-ink placeholder:text-m-ink/50 focus:outline-none sm:w-52"
            />
            <button
              type="button"
              onClick={() => {
                setSearching(false);
                if (q) router.push(base, { scroll: false });
              }}
              className="grid size-8 place-items-center rounded-full text-m-ink/70 hover:bg-m-ink/6 hover:text-m-ink"
            >
              <X className="size-4" aria-hidden />
              <span className="sr-only">খোঁজা বন্ধ</span>
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setSearching(true)} className="grid size-10 shrink-0 place-items-center rounded-full text-m-ink/75 hover:bg-m-ink/6 hover:text-m-ink">
            <Search className="size-5" aria-hidden />
            <span className="sr-only">এই চ্যানেলে খুঁজুন</span>
          </button>
        )}
      </div>
    </nav>
  );
}

/* ── Home ──────────────────────────────────────────────────────────── */

function HomeTab({
  handle,
  all,
  full,
  shorts,
  depts,
  courses,
  locked,
}: {
  handle: string;
  all: ClassVideo[];
  full: ClassVideo[];
  shorts: ClassVideo[];
  depts: Department[];
  courses: Course[];
  locked: (v: ClassVideo) => boolean;
}) {
  const record = teacherRecord(handle)!;
  const person = personOrThrow(handle);
  const featured = sortVideos(full.filter((v) => v.access === "free"), "latest")[0];

  // One section per department: a shelf per own course, or — for a member with no course of their own yet — the team's classes.
  const sections = depts
    .map((d) => {
      const shelves = courses.filter((c) => c.dept === d.id).map((c) => ({ course: c, items: playlist(full, c.id) })).filter((s) => s.items.length > 0);
      const team = shelves.length ? [] : sortVideos(all.filter((v) => !v.short && v.teacher !== handle && getCourse(v.course)?.dept === d.id), "latest");
      return { dept: d, shelves, team };
    })
    .filter((s) => s.shelves.length || s.team.length);

  const mates = [...new Set(depts.flatMap((d) => d.teachers))].filter((h) => h !== handle && teacherRecord(h));

  return (
    <div className="space-y-8">
      {featured && <Featured video={featured} locked={locked(featured)} />}

      {sections.map(({ dept, shelves, team }) => (
        <section key={dept.id} aria-labelledby={`dept-${dept.id}`} className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="size-2.5 rounded-[2px] bg-m-yellow" aria-hidden />
            <h2 id={`dept-${dept.id}`} className="text-xl font-bold text-m-ink sm:text-2xl">
              {dept.name}
            </h2>
            <span className="rounded-md bg-m-ink/6 px-2 py-0.5 text-xs font-semibold text-m-ink/80">
              {dept.teachers[0] === handle ? "প্রধান" : "সদস্য"} · {DEPT_KINDS[dept.kind]}
            </span>
            <Link href={`/media/academy/dept/${dept.id}`} className="group ml-auto inline-flex items-center gap-1 text-sm font-semibold text-m-ink/75 hover:text-m-blue">
              বিভাগের পাতা <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
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
              <figure className="flex h-full flex-col rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 shadow-m-tile">
                <Quote className="size-5 text-m-blue" aria-hidden />
                <blockquote className="mt-2 line-clamp-4 flex-1 text-[15px] leading-relaxed text-m-ink">{s.text}</blockquote>
                <figcaption className="mt-3 text-sm font-semibold text-m-ink/75">— {s.name}</figcaption>
              </figure>
            </ShelfItem>
          ))}
        </Shelf>
      )}

      {mates.length > 0 && (
        <section aria-labelledby="mates">
          <h3 id="mates" className="text-lg font-bold text-m-ink sm:text-xl">
            একই বিভাগের শিক্ষক
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
            {mates.map((h) => (
              <li key={h}>
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
    <section aria-labelledby="featured" className="grid gap-4 border-b border-m-ink/9 pb-8 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:gap-6">
      <Link href={watchHref(video)} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-m-blue" aria-label={video.title}>
        <Thumb video={video} locked={locked} className="aspect-video" sizes="(min-width: 768px) 26rem, 92vw" />
      </Link>
      <div className="min-w-0">
        <p className="text-xs font-bold text-m-blue">{thisWeek ? "এ সপ্তাহের বিনামূল্যের ক্লাস" : "সর্বশেষ বিনামূল্যের ক্লাস"}</p>
        <h2 id="featured" className="mt-1 text-lg leading-snug font-bold text-m-ink sm:text-xl">
          <Link href={watchHref(video)} className="hover:text-m-blue">
            {video.title}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-m-ink/65">
          <Compact n={video.views} /> বার দেখা · <Ago iso={video.at} />
        </p>
        <p className="mt-3 line-clamp-4 max-w-2xl text-sm leading-relaxed text-m-ink/80">
          {video.about ?? (
            <>
              “{course?.title}” কোর্সের সপ্তাহ <Num value={video.week} />-এর ক্লাস — সবার জন্য বিনামূল্যে। {course?.outcome}
            </>
          )}
        </p>
        <Link href={watchHref(video)} className={mediaButton({ variant: "quiet", size: "sm", className: "mt-4 rounded-full" })}>
          <Play className="fill-current" aria-hidden /> দেখুন
        </Link>
      </div>
    </section>
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

  if (full.length === 0) return <EmptyState icon="search" title="এখনো কোনো ভিডিও নেই" body="নিজের কোর্স শুরু হলে প্রতি সপ্তাহের বিনামূল্যের ক্লাস এখানে আসবে।" />;

  return (
    <>
      <div className="-mx-3 mb-6 flex items-center gap-2 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0" role="group" aria-label="সাজান ও বিভাগ">
        {(Object.keys(VIDEO_SORTS) as VideoSort[]).map((s) => (
          <button key={s} type="button" aria-pressed={by === s} onClick={() => setBy(s)} className={chipClass(by === s)}>
            {VIDEO_SORTS[s]}
          </button>
        ))}
        {withVideos.length > 0 && <span className="mx-1 h-6 w-px shrink-0 bg-m-ink/11" aria-hidden />}
        {withVideos.length > 0 && (
          <button type="button" aria-pressed={!dept} onClick={() => setDept(null)} className={chipClass(!dept)}>
            সব বিভাগ
          </button>
        )}
        {withVideos.map((d) => (
          <button key={d.id} type="button" aria-pressed={dept === d.id} onClick={() => setDept(d.id)} className={chipClass(dept === d.id)}>
            {d.name}
          </button>
        ))}
      </div>
      <ul className="grid gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {shown.map((v) => (
          <li key={v.id}>
            <VideoCard video={v} locked={locked(v)} channel />
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Courses (playlists) ───────────────────────────────────────────── */

function CoursesTab({ handle, depts, courses, videos }: { handle: string; depts: Department[]; courses: Course[]; videos: ClassVideo[] }) {
  const groups = depts.map((d) => ({ dept: d, list: courses.filter((c) => c.dept === d.id) })).filter((g) => g.list.length);
  if (groups.length === 0) {
    const d = depts[0];
    return (
      <EmptyState
        icon="search"
        title="এখনো নিজের কোর্স নেই"
        body={`${personOrThrow(handle).nameBn} দলের সাথে শেখান। নিজের কোর্স প্যানেলে পাস হলে এখানে আসবে।`}
        action={d && <Link href={`/media/academy/dept/${d.id}`} className="text-sm font-semibold text-m-blue hover:underline">{d.name} — দলের কোর্স দেখুন</Link>}
      />
    );
  }
  return (
    <div className="space-y-10">
      {groups.map(({ dept, list }) => (
        <section key={dept.id} aria-labelledby={`pl-${dept.id}`}>
          <h2 id={`pl-${dept.id}`} className="mb-5 flex items-center gap-3 text-lg font-bold text-m-ink sm:text-xl">
            <span className="size-2.5 rounded-[2px] bg-m-yellow" aria-hidden />
            {dept.name}
          </h2>
          <ul className="grid gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((c) => (
              <li key={c.id}>
                <PlaylistCard course={c} items={playlist(videos, c.id)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** A course as a playlist: the picture on a stack, how many videos, "সব চালান" on hover. */
function PlaylistCard({ course, items }: { course: Course; items: ClassVideo[] }) {
  const href = items[0] ? watchHref(items[0]) : `/media/academy/course/${course.id}`;
  return (
    <article className="group">
      <Link href={href} className="relative block rounded-xl pt-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-m-blue" aria-label={`${course.title} — ${items.length ? "সব চালান" : "কোর্সের পাতা"}`}>
        <span className="absolute inset-x-5 top-0 h-2 rounded-t-lg bg-m-ink/11" aria-hidden />
        <span className="absolute inset-x-2.5 top-1 h-1.5 rounded-t-lg bg-m-ink/22" aria-hidden />
        <span className="relative block aspect-video overflow-hidden rounded-xl bg-m-card ring-1 ring-white">
          <Image src={course.image} alt="" fill sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-m-ink">
            <ListVideo className="size-3.5" aria-hidden /> <Num value={items.length} />টি ভিডিও
          </span>
          <span className="absolute inset-0 grid place-items-center bg-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" aria-hidden>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-m-ink">
              <Play className="size-5 fill-current" /> {items.length ? "সব চালান" : "কোর্সের পাতা"}
            </span>
          </span>
        </span>
      </Link>
      <h3 className="mt-3 line-clamp-2 text-[15px] leading-snug font-semibold text-m-ink">{course.title}</h3>
      <p className="mt-1 text-sm text-m-ink/65">
        {course.id} · {LEVELS[course.level]} · <Num value={COURSE_DAYS} /> দিন
      </p>
      <Link href={`/media/academy/course/${course.id}`} className="mt-1 inline-block text-sm font-semibold text-m-ink/80 hover:text-m-blue">
        পুরো কোর্স দেখুন
      </Link>
    </article>
  );
}

/* ── Stories (posts) ───────────────────────────────────────────────── */

function StoriesTab({ handle }: { handle: string }) {
  const person = personOrThrow(handle);
  const record = teacherRecord(handle)!;
  return (
    <ul className="max-w-3xl space-y-4">
      {record.stories.map((s, i) => (
        <li key={s.name}>
          <article className="rounded-2xl bg-m-card p-5 ring-1 ring-m-ink/10 shadow-m-tile">
            <header className="flex items-center gap-3">
              <PersonAvatar person={person} size="md" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm font-semibold text-m-ink">
                  {person.nameBn} <BadgeCheck className="size-3.5 text-m-ink/70" aria-hidden />
                </p>
                <p className="text-xs text-m-ink/60">শিক্ষার্থীর সফলতা</p>
              </div>
            </header>
            <blockquote className="mt-4 text-[17px] leading-relaxed text-m-ink">“{s.text}”</blockquote>
            <p className="mt-2 text-sm font-semibold text-m-ink/75">— {s.name}</p>
            <footer className="mt-3 -ml-2">
              <CommentVotes id={`story:${handle}:${i}`} base={30 + ((s.text.length * 7) % 90)} />
            </footer>
          </article>
        </li>
      ))}
    </ul>
  );
}

/* ── Search ────────────────────────────────────────────────────────── */

function SearchResults({ q, videos, locked }: { q: string; videos: ClassVideo[]; locked: (v: ClassVideo) => boolean }) {
  const needle = q.toLowerCase();
  const found = sortVideos(
    videos.filter((v) => [v.title, v.course, getCourse(v.course)?.title ?? ""].some((f) => f.toLowerCase().includes(needle))),
    "latest",
  );
  if (found.length === 0) return <EmptyState icon="search" title={`“${q}” — এই চ্যানেলে মিলল না`} body="অন্য শব্দে খুঁজুন, বা ভিডিও ভাগে সব দেখুন।" />;
  return (
    <ul className="max-w-4xl space-y-4">
      {found.map((v) => {
        const course = getCourse(v.course);
        return (
          <li key={v.id}>
            <Link href={watchHref(v)} className="group flex gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-m-blue">
              <Thumb video={v} locked={locked(v)} className={cn("shrink-0", v.short ? "aspect-[9/14] w-24 sm:w-32" : "aspect-video w-40 sm:w-64")} sizes="256px" />
              <span className="min-w-0 py-0.5">
                <span className="line-clamp-2 font-semibold text-m-ink group-hover:text-m-blue sm:text-lg">{v.title}</span>
                <span className="mt-1 block text-sm text-m-ink/65">
                  <Compact n={v.views} /> বার দেখা · <Ago iso={v.at} />
                </span>
                <span className="mt-2 hidden text-sm text-m-ink/65 sm:line-clamp-2">
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
