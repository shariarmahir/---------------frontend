"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { departments, getCourse, teacherRecord, videoLikes } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { TIERS, canWatch, youtubeEmbed, type ClassVideo, watchHref } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Ago, Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { Band } from "../catalogue/band";
import { primaryBtn, secondaryBtn } from "../catalogue/buttons";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { useTeacher } from "../desk/use-teacher";
import { standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "./use-videos";
import { VideoAbout } from "./video-about";
import { Thumb } from "./video-card";
import { VideoComments } from "./video-comments";
import { VideoRating } from "./video-rating";
import { VideoLikes } from "./votes";

/** The demo's stand-in for a seeded class: the same sample clip plays for every one. */
const SAMPLE = "/media/video/classroom.mp4";

/**
 * Watching a class, in the catalogue's bands: the player with the title,
 * teacher and the way into the course under it, what the class is about,
 * and the next classes down the side (same course first); then the rating;
 * then the conversation.
 */
export function WatchView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const videos = useVideos();
  const enrolled = useAcademy((a) => a.enrolled);
  const { handle } = useTeacher();
  const video = videos.find((v) => v.id === id);

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />
      {video ? (
        <Watch video={video} videos={videos} open={!hydrated || canWatch(video, enrolled, handle)} inCourse={video.course in enrolled} locked={(v) => hydrated && !canWatch(v, enrolled, handle)} own={video.teacher === handle} />
      ) : (
        <Band id="missing" n={1} label="ক্লাস ভিডিও" now>
          <div className="flex flex-col items-center px-6 py-24 text-center">
            {hydrated ? (
              <>
                <h1 className="display text-3xl text-(--c-ink-strong)">ভিডিওটা পাওয়া গেল না</h1>
                <p className="mt-3 text-(--c-muted)">হয়তো সরানো হয়েছে, বা অন্য ফোনে তোলা।</p>
                <Link href="/media/academy/videos" className={cn(primaryBtn, "mt-8")}>
                  সব ক্লাস ভিডিও
                </Link>
              </>
            ) : (
              <span aria-hidden className="block aspect-video w-full max-w-4xl animate-pulse bg-(--c-bg-sunken)" />
            )}
          </div>
        </Band>
      )}
    </CatalogueRoot>
  );
}

function Watch({ video, videos, open, inCourse, locked, own }: { video: ClassVideo; videos: ClassVideo[]; open: boolean; inCourse: boolean; locked: (v: ClassVideo) => boolean; own: boolean }) {
  const course = getCourse(video.course);
  const teacher = personOrThrow(video.teacher);
  const record = teacherRecord(teacher.handle);
  const tone = departments.findIndex((d) => d.id === course?.dept);
  const next = videos
    .filter((v) => v.id !== video.id && !v.short)
    .map((v) => ({ v, rank: v.course === video.course ? 0 : v.teacher === video.teacher ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || b.v.at.localeCompare(a.v.at))
    .slice(0, 10)
    .map((x) => x.v);

  function share() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => toast.success("লিংক কপি হলো", { description: video.access === "free" ? "বিনামূল্যের ক্লাস — যে কেউ দেখতে পারবেন।" : "কোর্সে ভর্তিরাই দেখতে পারবেন।" }))
      .catch(() => toast.error("কপি করা গেল না"));
  }

  return (
    <>
      <Band id="watch" n={1} label="ক্লাস ভিডিও" rulerLabel="ক্লাস" now note={<span className="font-mono">{video.course}</span>}>
        <div style={toneStyle(tone)} className="tone grid gap-px bg-(--c-line) xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 bg-(--c-bg)">
            <div className="relative aspect-video overflow-hidden bg-black">
              <Player video={video} open={open} image={course?.image} courseTitle={course?.title ?? video.course} />
            </div>
            <div className="px-6 py-6 md:px-8">
              <p className="hud text-(--c-app-ink)">
                {course?.title} · সপ্তাহ <Num value={video.week} />
              </p>
              <h1 className="display mt-2 text-2xl leading-snug text-(--c-ink-strong) sm:text-3xl">{video.title}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                <Link href={`/media/academy/teachers/${teacher.handle}`} className="group flex min-w-0 items-center gap-3">
                  <PersonAvatar person={teacher} size="md" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 font-semibold text-(--c-ink-strong) underline-offset-4 group-hover:underline">
                      <span className="truncate">{teacher.nameBn}</span>
                      <BadgeCheck className="size-4 shrink-0 text-(--c-accent-ink)" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
                    </span>
                    {record && (
                      <span className="hud block text-(--c-faint)">
                        {TIERS[standingOf(record).tier]} · <Num value={record.graduates} /> জন গ্র্যাজুয়েট
                      </span>
                    )}
                  </span>
                </Link>
                <Link href={`/media/academy/course/${video.course}`} className={cn(inCourse ? secondaryBtn : primaryBtn, "h-10 px-4")}>
                  {inCourse ? "কোর্সের পাতা" : "কোর্সে ভর্তি হন"} <ArrowRight className="size-4" aria-hidden />
                </Link>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <VideoLikes id={video.id} base={videoLikes(video)} />
                  <button
                    type="button"
                    onClick={share}
                    className="inline-flex h-10 items-center gap-2 border border-(--c-line-strong) px-4 text-sm font-semibold text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)"
                  >
                    <Share2 className="size-4" aria-hidden /> শেয়ার
                  </button>
                </div>
              </div>

              <VideoAbout video={video} />
            </div>
          </div>

          <aside aria-labelledby="next-title" className="bg-(--c-bg)">
            <h2 id="next-title" className="hud border-b border-(--c-line) px-6 py-3 text-(--c-faint)">
              পরের ভিডিও
            </h2>
            <ul>
              {next.map((v) => (
                <li key={v.id} className="border-b border-(--c-line) last:border-b-0">
                  <NextItem video={v} locked={locked(v)} />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Band>

      <Band id="rating" n={2} label="রেটিং" note="শিক্ষার্থীদের তারা">
        <div className="px-6 py-8 md:px-10">
          <VideoRating video={video} canRate={open} own={own} />
        </div>
      </Band>

      <Band id="comments" n={3} label="মতামত" note="পড়তে পারেন সবাই">
        <div className="max-w-4xl px-6 py-8 md:px-10">
          <VideoComments video={video} canTalk={open} />
        </div>
      </Band>
    </>
  );
}

function Player({ video, open, image, courseTitle }: { video: ClassVideo; open: boolean; image?: string; courseTitle: string }) {
  if (!open) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        {image && <Image src={image} alt="" fill sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover" />}
        <span className="absolute inset-0 bg-black/80" aria-hidden />
        <div className="relative max-w-sm px-6 text-center text-white">
          <span className="mx-auto grid size-14 place-items-center bg-(--c-signal) text-black">
            <Lock className="size-6" aria-hidden />
          </span>
          <p className="display mt-5 text-xl">এটা “{courseTitle}” কোর্সের ভিডিও</p>
          <p className="mt-2 text-sm text-white/75">ভর্তি হলে সব সপ্তাহের ভিডিও দেখা যাবে। এ কোর্সের বিনামূল্যের ক্লাসগুলো সবাই দেখতে পারেন।</p>
          <Link href={`/media/academy/course/${video.course}`} className={cn(primaryBtn, "mt-6")}>
            কোর্সটা দেখুন <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  const embed = video.href ? youtubeEmbed(video.href) : null;
  if (embed) {
    return <iframe src={embed} title={video.title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="absolute inset-0 size-full" />;
  }

  if (video.href?.startsWith("https://")) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        {image && <Image src={image} alt="" fill sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover" />}
        <span className="absolute inset-0 bg-black/70" aria-hidden />
        <a href={video.href} target="_blank" rel="noopener noreferrer nofollow" className={cn(primaryBtn, "relative")}>
          <ExternalLink className="size-4" aria-hidden /> লিংকে ভিডিওটা দেখুন
        </a>
      </div>
    );
  }

  return (
    <>
      <video src={SAMPLE} poster={image} controls playsInline preload="metadata" className="absolute inset-0 size-full object-contain" />
      <span className="hud pointer-events-none absolute top-3 left-3 bg-black/75 px-2 py-1 text-white">নমুনা ভিডিও — ডেমোতে সব ক্লাসে এটাই চলে</span>
    </>
  );
}

function NextItem({ video, locked }: { video: ClassVideo; locked: boolean }) {
  const teacher = personOrThrow(video.teacher);
  return (
    <Link href={watchHref(video)} className="group flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-(--c-bg-raised) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--c-signal)">
      <Thumb video={video} locked={locked} className="aspect-video w-36 shrink-0" sizes="144px" />
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm leading-snug font-semibold text-(--c-ink-strong)">{video.title}</span>
        <span className="hud mt-1 block truncate text-(--c-muted)">{teacher.nameBn}</span>
        <span className="hud block text-(--c-faint)">
          <Compact n={video.views} /> বার · <Ago iso={video.at} />
        </span>
      </span>
    </Link>
  );
}
