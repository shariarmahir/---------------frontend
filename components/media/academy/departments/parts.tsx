"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { coursesOf, getCourse, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { COURSE_DAYS, durationText, type ClassVideo, type Course, type Department } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { mediaButton } from "../../ui/button-styles";
import { Compact, Num, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { Reveal } from "../home/motion-bits";
import { watchHref } from "../videos/video-card";
import { DeptIcon } from "./dept-icons";
import { RoleArt } from "./role-art";

export const ratingOf = (c: Course) => teacherRecord(c.teacher)?.rating;

/** A department's rating: its teachers' class ratings pooled, weighted by how many rated. */
export function deptRating(d: Department): { avg: number; count: number } | undefined {
  const rs = d.teachers.flatMap((h) => teacherRecord(h)?.rating ?? []);
  const count = rs.reduce((n, r) => n + r.count, 0);
  return count ? { avg: rs.reduce((n, r) => n + r.avg * r.count, 0) / count, count } : undefined;
}

/** The picture of a department's most-joined course, if it has one yet. */
export const deptImage = (d: Department) => [...coursesOf(d.id)].sort((a, b) => b.enrolled - a.enrolled)[0]?.image;

/* ── Tiles in a band ───────────────────────────────────────────────── */

const tileFrame = (surface: "ink" | "black") =>
  cn(
    "group flex h-full flex-col rounded-2xl p-2 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgb(16_24_40/0.27)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-m-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    surface === "ink" ? "bg-m-card" : "bg-m-canvas",
  );

/** The button at a tile's foot; the whole tile is the link, so it is drawn, not nested. */
function TileCta({ label }: { label: string }) {
  return (
    <span className={mediaButton({ variant: "outline", size: "sm", className: "mx-1.5 mt-3 mb-1.5 self-start group-hover:bg-m-yellow group-hover:text-m-ink" })}>
      {label} <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
    </span>
  );
}

/** A department in the same card: its course picture (or its art), lead teacher, name, stars, courses and "বিভাগ দেখুন". */
export function DeptTile({ dept, surface = "ink" }: { dept: Department; surface?: "ink" | "black" }) {
  const lead = personOrThrow(dept.teachers[0]);
  const rating = deptRating(dept);
  const list = coursesOf(dept.id);
  const image = deptImage(dept);
  return (
    <Link href={`/media/academy/dept/${dept.id}`} className={tileFrame(surface)}>
      <span className="relative block aspect-video overflow-hidden rounded-xl bg-m-canvas">
        {image ? (
          <Image src={image} alt="" fill sizes="(min-width: 1280px) 16rem, (min-width: 640px) 40vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
        ) : (
          <RoleArt dept={dept} tone="gold" className="aspect-video rounded-none" />
        )}
        {list.some((c) => c.fee === 0) && <span className="absolute top-2 left-2 rounded-md bg-m-yellow px-1.5 py-0.5 text-[11px] font-bold text-m-ink">বিনা ফি কোর্স</span>}
      </span>
      <span className="mt-3 flex items-center gap-2 px-1.5 text-sm text-m-ink/80">
        <PersonAvatar person={lead} size="xs" />
        <span className="truncate">{dept.academy.name}</span>
      </span>
      <span className="mt-1 line-clamp-2 px-1.5 font-bold text-m-ink underline-offset-2 group-hover:underline">{dept.name}</span>
      <span className="mt-auto flex flex-wrap items-center gap-1 px-1.5 pt-4 text-xs text-m-ink/65">
        {rating && (
          <>
            <Star className="size-3.5 fill-m-yellow text-m-gold" aria-hidden />
            <Num value={rating.avg} decimals={1} /> (<Compact n={rating.count} />) ·
          </>
        )}{" "}
        বিভাগ · <Num value={list.length} />টি কোর্স
      </span>
      <TileCta label="বিভাগ দেখুন" />
    </Link>
  );
}

/** A course as a big course site's card: picture, teacher, title, stars and kind — with "কোর্স দেখুন" when asked. */
export function CourseTile({ course, surface = "ink", cta = false }: { course: Course; surface?: "ink" | "black"; cta?: boolean }) {
  const teacher = personOrThrow(course.teacher);
  const rating = ratingOf(course);
  return (
    <Link href={`/media/academy/course/${course.id}`} className={tileFrame(surface)}>
      <span className="relative block aspect-video overflow-hidden rounded-xl bg-m-canvas">
        <Image src={course.image} alt="" fill sizes="(min-width: 1280px) 16rem, (min-width: 640px) 40vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
        {course.fee === 0 && <span className="absolute top-2 left-2 rounded-md bg-m-yellow px-1.5 py-0.5 text-[11px] font-bold text-m-ink">বিনা ফি</span>}
      </span>
      <span className="mt-3 flex items-center gap-2 px-1.5 text-sm text-m-ink/80">
        <PersonAvatar person={teacher} size="xs" />
        <span className="truncate">{teacher.nameBn}</span>
      </span>
      <span className="mt-1 line-clamp-2 px-1.5 font-bold text-m-ink underline-offset-2 group-hover:underline">{course.title}</span>
      <span className={cn("mt-auto flex flex-wrap items-center gap-1 px-1.5 pt-4 text-xs text-m-ink/65", !cta && "pb-1")}>
        {rating && (
          <>
            <Star className="size-3.5 fill-m-yellow text-m-gold" aria-hidden />
            <Num value={rating.avg} decimals={1} /> (<Compact n={rating.count} />) ·
          </>
        )}{" "}
        কোর্স · <Num value={COURSE_DAYS} /> দিন
      </span>
      {cta && <TileCta label="কোর্স দেখুন" />}
    </Link>
  );
}

/** A free class as a card: picture with its length, teacher, title, views. */
export function VideoTile({ video, surface = "ink" }: { video: ClassVideo; surface?: "ink" | "black" }) {
  const { num } = useFormat();
  const teacher = personOrThrow(video.teacher);
  const course = getCourse(video.course);
  return (
    <Link href={watchHref(video)} className={tileFrame(surface)}>
      <span className="relative block aspect-video overflow-hidden rounded-xl bg-m-canvas">
        {course && <Image src={course.image} alt="" fill sizes="(min-width: 1280px) 16rem, (min-width: 640px) 40vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />}
        <span className="absolute top-2 left-2 rounded-md bg-m-blue-soft px-1.5 py-0.5 text-[11px] font-bold text-m-ink">বিনামূল্যে</span>
        <span className="absolute right-2 bottom-2 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-m-ink tabular-nums">{num(durationText(video.seconds))}</span>
      </span>
      <span className="mt-3 flex items-center gap-2 px-1.5 text-sm text-m-ink/80">
        <PersonAvatar person={teacher} size="xs" />
        <span className="truncate">{teacher.nameBn}</span>
      </span>
      <span className="mt-1 line-clamp-2 px-1.5 font-bold text-m-ink underline-offset-2 group-hover:underline">{video.title}</span>
      <span className="mt-auto px-1.5 pt-4 pb-1 text-xs text-m-ink/65">
        ক্লাস ভিডিও · <Compact n={video.views} /> বার দেখা
      </span>
    </Link>
  );
}

/* ── Panels of rows ────────────────────────────────────────────────── */

/** A row has a picture, or — for a department with no course yet — its icon on a white tile. */
export type Row = { key: string; href: string; image?: string; dept?: Department; teacher: string; title: string; meta: React.ReactNode };

export const deptRow = (d: Department): Row => {
  const rating = deptRating(d);
  return {
    key: d.id,
    href: `/media/academy/dept/${d.id}`,
    image: deptImage(d),
    dept: d,
    teacher: d.teachers[0],
    title: d.name,
    meta: (
      <>
        বিভাগ · <Num value={coursesOf(d.id).length} />টি কোর্স
        {rating && (
          <>
            {" "}
            · <Star className="inline size-3 fill-m-yellow align-[-1px] text-m-blue" aria-hidden /> <Num value={rating.avg} decimals={1} />
          </>
        )}
      </>
    ),
  };
};

export const courseRow = (c: Course): Row => ({
  key: c.id,
  href: `/media/academy/course/${c.id}`,
  image: c.image,
  teacher: c.teacher,
  title: c.title,
  meta: (
    <>
      কোর্স · <Star className="inline size-3 fill-m-yellow align-[-1px] text-m-blue" aria-hidden /> <Num value={ratingOf(c)?.avg ?? 0} decimals={1} />
    </>
  ),
});

export const videoRow = (v: ClassVideo): Row => ({
  key: v.id,
  href: watchHref(v),
  image: getCourse(v.course)?.image ?? "/media/team-cricket.webp",
  teacher: v.teacher,
  title: v.title,
  meta: (
    <>
      ক্লাস ভিডিও · <Compact n={v.views} /> বার দেখা
    </>
  ),
});

/** One of the light-blue panels of a course site, in ink: a linked title and a few compact rows. */
export function RowPanel({ title, href, rows, empty, delay = 0, className }: { title: string; href?: string; rows: Row[]; empty?: React.ReactNode; delay?: number; className?: string }) {
  return (
    <Reveal delay={delay} className={cn("min-w-0 rounded-2xl bg-m-card p-3.5 ring-1 ring-m-ink/10 shadow-m-tile", className)}>
      <h3 className="px-1">
        {href ? (
          <a href={href} className="group inline-flex items-center gap-1.5 font-bold text-m-ink">
            {title} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </a>
        ) : (
          <span className="font-bold text-m-ink">{title}</span>
        )}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-xl bg-white/70 px-3 py-4 text-sm text-m-ink/70">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const t = personOrThrow(r.teacher);
            return (
              <li key={r.key}>
                <Link href={r.href} className="group flex items-center gap-3 rounded-xl bg-white/70 p-2 transition-colors hover:bg-m-canvas">
                  <span className={cn("relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg", !r.image && "bg-white")}>
                    {r.image ? (
                      <Image src={r.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none" />
                    ) : (
                      r.dept && <DeptIcon dept={r.dept.id} school={r.dept.school} className="size-11" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-xs text-m-ink/70">
                      <PersonAvatar person={t} size="xs" className="size-4.5 text-[8px]" />
                      <span className="truncate">{t.nameBn}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-bold text-m-ink group-hover:text-m-blue">{r.title}</span>
                    <span className="mt-0.5 block text-xs text-m-ink/60">{r.meta}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Reveal>
  );
}

/* ── A band of tabs over cards ─────────────────────────────────────── */

export type BandTone = "green" | "gold" | "ink";
export type BandTab = { id: string; label: string; items: { key: string; node: React.ReactNode }[] };

const BAND: Record<BandTone, { box: string; text: string; sub: string; on: string; off: string; cta: "tile" | "primary" | "quiet" }> = {
  green: { box: "bg-m-blue-soft", text: "text-m-ink", sub: "text-m-ink/85", on: "text-m-ink", off: "text-m-ink ring-1 ring-m-ink/34 hover:bg-m-ink/6", cta: "tile" },
  gold: { box: "bg-m-yellow", text: "text-m-ink", sub: "text-m-ink/80", on: "text-m-ink", off: "text-m-ink ring-1 ring-m-ink/40 hover:bg-m-card/10", cta: "tile" },
  ink: { box: "bg-m-card ring-1 ring-m-ink/10", text: "text-m-ink", sub: "text-m-ink/75", on: "text-m-ink", off: "text-m-ink ring-1 ring-m-ink/26 hover:bg-m-ink/6", cta: "primary" },
};

/**
 * The course site's wide band: a short pitch on the left, tabs over four
 * cards on the right. The chosen tab slides its pill across; the cards
 * change in a quick stagger.
 */
export function ChipBand({
  id,
  title,
  body,
  cta,
  tone,
  tabs,
  tab,
  onTab,
}: {
  id: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  tone: BandTone;
  tabs: BandTab[];
  tab?: string;
  onTab?: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [own, setOwn] = useState(tabs[0]?.id);
  const current = tab ?? own;
  const choose = onTab ?? setOwn;
  const t = BAND[tone];
  const active = tabs.find((x) => x.id === current) ?? tabs[0];
  const pill = tone === "ink" ? "bg-m-yellow" : "bg-m-card";

  return (
    <Reveal>
      <section id={id} aria-labelledby={`${id}-title`} className={cn("grid scroll-mt-20 items-center gap-6 rounded-3xl p-5 sm:p-8 lg:grid-cols-[15rem_minmax(0,1fr)]", t.box)}>
        <div>
          <h2 id={`${id}-title`} className={cn("text-2xl leading-snug font-bold text-balance", t.text)}>
            {title}
          </h2>
          <p className={cn("mt-2", t.sub)}>{body}</p>
          <a href={cta.href} className={mediaButton({ variant: t.cta, className: "group/btn mt-5" })}>
            {cta.label} <ArrowRight className="transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </a>
        </div>
        <div className="min-w-0">
          <div role="tablist" aria-label={title} className="-mx-1 flex gap-2 overflow-x-auto px-1 pt-1 pb-1 scrollbar-none">
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={x.id === active?.id}
                onClick={() => choose(x.id)}
                className={cn("relative h-9 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors", x.id === active?.id ? t.on : t.off)}
              >
                {x.id === active?.id && <motion.span layoutId={`${id}-pill`} className={cn("absolute inset-0 rounded-full", pill)} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className="relative">{x.label}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={active?.id}
              role="tabpanel"
              aria-label={active?.label}
              className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              initial="hide"
              animate="show"
              exit="hide"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
            >
              {active?.items.slice(0, 4).map((it) => (
                <motion.li key={it.key} variants={{ hide: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                  {it.node}
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </section>
    </Reveal>
  );
}
