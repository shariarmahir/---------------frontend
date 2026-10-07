"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourse, teacherRecord, videoLikes } from "@/data/media/academy";
import { personOrThrow } from "@/data/media/users";
import { canWatch, youtubeEmbed, type ClassVideo } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { mediaButton } from "../../ui/button-styles";
import { Ago, Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { useTeacher } from "../desk/use-teacher";
import { TierBadge, standingOf } from "../parts";
import { useAcademy } from "../use-academy";
import { useVideos } from "./use-videos";
import { VideoAbout } from "./video-about";
import { VideoComments } from "./video-comments";
import { VideoRating } from "./video-rating";
import { VideoLikes } from "./votes";
import { Thumb, watchHref } from "./video-card";

/** The demo's stand-in for a seeded class: the same sample clip plays for every one. */
const SAMPLE = "/media/video/classroom.mp4";

/**
 * Watching a class: the player, the title and teacher under it, what the
 * class is about, and more classes down the side — same course first.
 */
export function WatchView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const videos = useVideos();
  const enrolled = useAcademy((a) => a.enrolled);
  const { handle } = useTeacher();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    if (!hydrated) return <Skeleton className="aspect-video w-full max-w-5xl rounded-xl bg-m-card/60" />;
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <h1 className="text-xl font-bold text-m-ink">ভিডিওটা পাওয়া গেল না</h1>
        <p className="mt-2 text-sm text-m-ink/70">হয়তো সরানো হয়েছে, বা অন্য ফোনে তোলা।</p>
        <Link href="/media/academy/videos" className={mediaButton({ className: "mt-5" })}>সব ক্লাস ভিডিও</Link>
      </div>
    );
  }

  const course = getCourse(video.course);
  const teacher = personOrThrow(video.teacher);
  const record = teacherRecord(teacher.handle);
  const open = !hydrated || canWatch(video, enrolled, handle);
  const inCourse = video.course in enrolled;
  const next = videos
    .filter((v) => v.id !== video.id && !v.short)
    .map((v) => ({ v, rank: v.course === video.course ? 0 : v.teacher === video.teacher ? 1 : 2 }))
    .sort((a, b) => a.rank - b.rank || b.v.at.localeCompare(a.v.at))
    .slice(0, 12)
    .map((x) => x.v);

  function share() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => toast.success("লিংক কপি হলো", { description: video!.access === "free" ? "বিনামূল্যের ক্লাস — যে কেউ দেখতে পারবেন।" : "কোর্সে ভর্তিরাই দেখতে পারবেন।" }))
      .catch(() => toast.error("কপি করা গেল না"));
  }

  return (
    <div className="mx-auto grid max-w-[110rem] gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-m-canvas ring-1 ring-m-ink/9">
          <Player video={video} open={open} image={course?.image} courseTitle={course?.title ?? video.course} />
        </div>

        <h1 className="mt-4 text-xl leading-snug font-bold text-m-ink sm:text-2xl">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link href={`/media/academy/teachers/${teacher.handle}`} className="flex min-w-0 items-center gap-3">
            <PersonAvatar person={teacher} size="md" />
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-m-ink">
                <span className="truncate">{teacher.nameBn}</span>
                <BadgeCheck className="size-4 shrink-0 text-m-ink/70" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
              </span>
              {record && (
                <span className="block text-xs text-m-ink/65">
                  <Num value={record.graduates} /> জন গ্র্যাজুয়েট
                </span>
              )}
            </span>
          </Link>
          {record && <TierBadge tier={standingOf(record).tier} />}
          <Link href={`/media/academy/course/${video.course}`} className={mediaButton({ variant: inCourse ? "quiet" : "primary", className: "rounded-full" })}>
            {inCourse ? "কোর্সের পাতা" : "কোর্সে ভর্তি হন"} <ArrowRight aria-hidden />
          </Link>
          <div className="flex items-center gap-2 sm:ml-auto">
            <VideoLikes id={video.id} base={videoLikes(video)} />
            <button type="button" onClick={share} className="inline-flex h-10 items-center gap-2 rounded-full bg-m-ink/6 px-4 text-sm font-semibold text-m-ink transition-colors hover:bg-m-ink/11">
              <Share2 className="size-4.5" aria-hidden /> শেয়ার
            </button>
          </div>
        </div>

        <VideoAbout video={video} />
        <VideoRating video={video} canRate={open} own={video.teacher === handle} />
        <VideoComments video={video} canTalk={open} />
      </div>

      <aside aria-labelledby="next-title">
        <h2 id="next-title" className="mb-3 font-bold text-m-ink">পরের ভিডিও</h2>
        <ul className="space-y-3">
          {next.map((v) => (
            <li key={v.id}>
              <NextItem video={v} locked={hydrated && !canWatch(v, enrolled, handle)} />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Player({ video, open, image, courseTitle }: { video: ClassVideo; open: boolean; image?: string; courseTitle: string }) {
  if (!open) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        {image && <Image src={image} alt="" fill sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover" />}
        <span className="absolute inset-0 bg-white/90" aria-hidden />
        <div className="relative max-w-sm px-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-m-yellow text-m-ink">
            <Lock className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-lg font-bold text-m-ink">এটা “{courseTitle}” কোর্সের ভিডিও</p>
          <p className="mt-1 text-sm text-m-ink/75">ভর্তি হলে সব সপ্তাহের ভিডিও দেখা যাবে। এ কোর্সের বিনামূল্যের ক্লাসগুলো সবাই দেখতে পারেন।</p>
          <Link href={`/media/academy/course/${video.course}`} className={mediaButton({ className: "mt-5" })}>
            কোর্সটা দেখুন <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  const embed = video.href ? youtubeEmbed(video.href) : null;
  if (embed) {
    return (
      <iframe
        src={embed}
        title={video.title}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    );
  }

  if (video.href?.startsWith("https://")) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        {image && <Image src={image} alt="" fill sizes="(min-width: 1280px) 60vw, 100vw" className="object-cover" />}
        <span className="absolute inset-0 bg-white/85" aria-hidden />
        <a href={video.href} target="_blank" rel="noopener noreferrer nofollow" className={mediaButton({ size: "lg", className: "relative" })}>
          <ExternalLink aria-hidden /> লিংকে ভিডিওটা দেখুন
        </a>
      </div>
    );
  }

  return (
    <>
      <video src={SAMPLE} poster={image} controls playsInline preload="metadata" className="absolute inset-0 size-full object-contain" />
      <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-m-ink/85">নমুনা ভিডিও — ডেমোতে সব ক্লাসে এটাই চলে</span>
    </>
  );
}

function NextItem({ video, locked }: { video: ClassVideo; locked: boolean }) {
  const teacher = personOrThrow(video.teacher);
  return (
    <Link href={watchHref(video)} className="group flex gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-m-blue">
      <Thumb video={video} locked={locked} className="aspect-video w-40 shrink-0" sizes="160px" />
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm leading-snug font-semibold text-m-ink group-hover:text-m-blue">{video.title}</span>
        <span className="mt-1 block truncate text-xs text-m-ink/65">{teacher.nameBn}</span>
        <span className="block text-xs text-m-ink/65">
          <Compact n={video.views} /> বার দেখা · <Ago iso={video.at} />
        </span>
      </span>
    </Link>
  );
}
