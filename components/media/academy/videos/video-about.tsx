"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getCourse, getDepartment, teacherRecord } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { MATERIAL_KINDS, type ClassVideo, watchHref } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { actionClass } from "../catalogue/asset-card";
import { Compact, DateText, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useVideos } from "./use-videos";

/**
 * The description under the player: views, date and tags, then the class in
 * a couple of lines with "...আরও". Opened, it adds the course's weeks (each
 * linked to its video, like chapters), the materials and the teacher.
 */
export function VideoAbout({ video }: { video: ClassVideo }) {
  const reduce = useReducedMotion();
  const videos = useVideos();
  const [open, setOpen] = useState(false);
  const course = getCourse(video.course);
  const dept = course && getDepartment(course.dept);
  const lesson = course?.lessons[video.week - 1];
  const teacher = personOrThrow(video.teacher);
  const record = teacherRecord(video.teacher);
  const weekVideo = (week: number) => videos.find((v) => v.course === video.course && v.week === week && !v.short && v.id !== video.id);

  return (
    <section aria-label="ভিডিওর বর্ণনা" onClick={open ? undefined : () => setOpen(true)} className={cn("mt-4 bg-(--c-bg-sunken) p-4 text-sm leading-relaxed text-(--c-ink) transition-colors", !open && "cursor-pointer hover:bg-(--c-bg-raised)")}>
      <p className="font-semibold text-(--c-ink-strong)">
        <Compact n={video.views} /> বার দেখা · <DateText iso={video.at} />
        <span className="ml-2 font-normal text-(--c-accent-ink)">
          #{video.course.replace("-", "")} {dept && `#${dept.name.split(" ")[0]}`} {video.access === "free" && "#বিনামূল্যে"}
        </span>
      </p>

      <div className={cn(!open && "line-clamp-2")}>
        <p>
          {video.about ?? (
            <>
              “{course?.title}” কোর্সের সপ্তাহ <Num value={video.week} />
              -এর ক্লাস: {lesson?.title}। {video.access === "free" ? "প্রতি সপ্তাহের বিনামূল্যের ক্লাস — সবার জন্য।" : "কোর্সে ভর্তিদের জন্য।"}
            </>
          )}
        </p>
        {lesson?.homework && <p className="mt-2">বাড়ির কাজ: {lesson.homework}</p>}
        {course && <p className="mt-2">কোর্স শেষে: {course.outcome}</p>}
      </div>
      {!open && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="mt-0.5 font-semibold text-(--c-ink-strong) hover:text-(--c-accent-ink)"
        >
          ...আরও
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && course && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <h3 className="mt-5 font-bold text-(--c-ink-strong)">এই কোর্সের সপ্তাহগুলো</h3>
            <ol className="mt-2 space-y-1">
              {course.lessons.map((l, i) => {
                const other = weekVideo(i + 1);
                const here = i + 1 === video.week;
                return (
                  <li key={l.title} className="flex gap-2">
                    <span className={cn("w-20 shrink-0 font-semibold", here ? "text-(--c-ink-strong)" : "text-(--c-accent-ink)")}>
                      সপ্তাহ <Num value={i + 1} />
                    </span>
                    {other ? (
                      <Link href={watchHref(other)} className="text-(--c-ink) underline decoration-(--c-line-strong) underline-offset-4 hover:text-(--c-accent-ink)">
                        {l.title}
                      </Link>
                    ) : (
                      <span className={here ? "font-semibold text-(--c-ink-strong)" : "text-(--c-muted)"}>
                        {l.title}
                        {here && " · এই ভিডিও"}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            {course.materials.length > 0 && (
              <>
                <h3 className="mt-5 font-bold text-(--c-ink-strong)">উপকরণ</h3>
                <ul className="mt-2 space-y-1">
                  {course.materials.map((m) => (
                    <li key={m.title}>
                      <span className="mr-2 bg-(--c-bg-sunken) px-1.5 py-0.5 text-[11px] font-bold text-(--c-ink-strong)">{MATERIAL_KINDS[m.kind]}</span>
                      {m.title}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-(--c-muted)">কোর্সের পাতা থেকে নামানো যায় — ভর্তি হওয়ার পর।</p>
              </>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3 bg-(--c-bg-sunken) p-3">
              <PersonAvatar person={teacher} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-(--c-ink-strong)">{teacher.nameBn}</p>
                {record && (
                  <p className="text-xs text-(--c-muted)">
                    {record.title} · <Num value={record.graduates} /> জন গ্র্যাজুয়েট
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/media/academy/teachers/${teacher.handle}`} className={cn(actionClass, "w-auto")}>
                  শিক্ষকের পাতা
                </Link>
                <Link href={`/media/academy/course/${course.id}`} className={cn(actionClass, "w-auto")}>
                  কোর্সের পাতা
                </Link>
              </div>
            </div>

            <button type="button" onClick={() => setOpen(false)} className="mt-4 font-semibold text-(--c-ink-strong) hover:text-(--c-accent-ink)">
              কম দেখান
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
