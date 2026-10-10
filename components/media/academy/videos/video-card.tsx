"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, BookOpen, EllipsisVertical, Link2, Lock, Play, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getCourse } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { durationText, type ClassVideo, watchHref } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { Ago, Compact, useFormat } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";

/** The picture: the course's, square-cut, the length and free-or-course in the corners, a yellow bar that runs under the pointer. */
export function Thumb({ video, locked, className, sizes }: { video: ClassVideo; locked: boolean; className?: string; sizes: string }) {
  const { num } = useFormat();
  const course = getCourse(video.course);
  return (
    <span className={cn("relative block overflow-hidden bg-(--c-bg-sunken)", className)}>
      {course && <Image src={course.image} alt="" fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />}
      <span className={cn("hud absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 font-bold", video.access === "free" ? "bg-(--c-signal) text-black" : "bg-(--c-invert-bg) text-(--c-invert-fg)")}>
        {video.access === "free" ? (
          "বিনামূল্যে"
        ) : (
          <>
            <Lock className="size-3" aria-hidden /> কোর্সের ভিডিও
          </>
        )}
      </span>
      {locked && <span className="absolute inset-0 bg-black/55" aria-hidden />}
      <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden>
        <span className="grid size-12 place-items-center bg-(--c-invert-bg) text-(--c-invert-fg)">
          <Play className="size-5 fill-current" />
        </span>
      </span>
      <span className="hud absolute right-2 bottom-2 bg-black/80 px-1.5 py-0.5 text-white tabular-nums">{num(durationText(video.seconds))}</span>
      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-(--c-signal) transition-transform duration-2500 ease-linear group-hover:scale-x-100 motion-reduce:hidden" aria-hidden />
    </span>
  );
}

/**
 * One class video in a ruled grid cell. On a teacher's own channel
 * (`channel`) the avatar and name are left off — the page is theirs.
 */
export function VideoCard({ video, locked, channel, sizes }: { video: ClassVideo; locked: boolean; channel?: boolean; sizes?: string }) {
  const teacher = personOrThrow(video.teacher);
  return (
    <article className="group relative">
      <Link href={watchHref(video)} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--c-signal)" aria-label={video.title}>
        <Thumb video={video} locked={locked} className="aspect-video" sizes={sizes ?? "(min-width: 1280px) 20rem, (min-width: 640px) 45vw, 92vw"} />
      </Link>
      <div className="relative mt-4 flex gap-3 pr-8">
        {!channel && (
          <Link href={`/media/academy/teachers/${teacher.handle}`} className="shrink-0 rounded-full" aria-label={teacher.nameBn}>
            <PersonAvatar person={teacher} size="md" className="size-9" />
          </Link>
        )}
        <div className="min-w-0">
          <h3 className="display line-clamp-2 text-base leading-snug text-(--c-ink-strong)">
            <Link href={watchHref(video)} className="underline-offset-4 hover:underline" tabIndex={-1}>
              {video.title}
            </Link>
          </h3>
          {!channel && (
            <p className="mt-1 flex items-center gap-1 text-sm text-(--c-muted)">
              <Link href={`/media/academy/teachers/${teacher.handle}`} className="truncate hover:text-(--c-ink-strong)">
                {teacher.nameBn}
              </Link>
              <BadgeCheck className="size-3.5 shrink-0 text-(--c-accent-ink)" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
            </p>
          )}
          <p className={cn("hud text-(--c-faint)", channel ? "mt-1.5" : "mt-1")}>
            <Compact n={video.views} /> বার দেখা · <Ago iso={video.at} />
          </p>
          <p className="hud mt-0.5 text-(--c-faint)">
            <span className="font-mono">{video.course}</span> · সপ্তাহ <WeekNum n={video.week} />
          </p>
        </div>
        <VideoMenu video={video} className="absolute -top-1 right-0" />
      </div>
    </article>
  );
}

/** A short: a tall picture, the title and views under it. */
export function ShortCard({ video }: { video: ClassVideo }) {
  return (
    <article className="group relative">
      <Link href={watchHref(video)} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--c-signal)" aria-label={video.title}>
        <Thumb video={video} locked={false} className="aspect-9/14" sizes="(min-width: 1024px) 13rem, 45vw" />
      </Link>
      <h3 className="mt-3 line-clamp-2 pr-7 text-sm leading-snug font-semibold text-(--c-ink-strong)">{video.title}</h3>
      <p className="hud mt-1 text-(--c-faint)">
        <Compact n={video.views} /> বার দেখা
      </p>
      <VideoMenu video={video} className="absolute right-0 bottom-6" />
    </article>
  );
}

function WeekNum({ n }: { n: number }) {
  const { num } = useFormat();
  return <>{num(n)}</>;
}

/** The ⋮ menu: the course, the teacher, a link to share. */
export function VideoMenu({ video, className }: { video: ClassVideo; className?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  function copy() {
    setOpen(false);
    navigator.clipboard
      ?.writeText(new URL(watchHref(video), window.location.origin).href)
      .then(() => toast.success("লিংক কপি হলো"))
      .catch(() => toast.error("কপি করা গেল না"));
  }

  const item =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-(--c-muted) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg) focus-visible:bg-(--c-invert-bg) focus-visible:text-(--c-invert-fg) focus-visible:outline-none";
  return (
    <div ref={box} className={className}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 place-items-center text-(--c-muted) transition-[opacity,color,background-color] duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg) focus-visible:opacity-100 aria-expanded:bg-(--c-invert-bg) aria-expanded:text-(--c-invert-fg) aria-expanded:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <EllipsisVertical className="size-5" aria-hidden />
        <span className="sr-only">আরও</span>
      </button>
      {open && (
        <div role="menu" className="absolute top-9 right-0 z-30 w-56 border border-(--c-line) bg-(--c-bg-raised) py-2 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
          <Link role="menuitem" href={`/media/academy/course/${video.course}`} className={item}>
            <BookOpen className="size-4.5" aria-hidden /> কোর্সের পাতা
          </Link>
          <Link role="menuitem" href={`/media/academy/teachers/${video.teacher}`} className={item}>
            <UserRound className="size-4.5" aria-hidden /> শিক্ষকের পাতা
          </Link>
          <button type="button" role="menuitem" onClick={copy} className={item}>
            <Link2 className="size-4.5" aria-hidden /> লিংক কপি করুন
          </button>
        </div>
      )}
    </div>
  );
}
