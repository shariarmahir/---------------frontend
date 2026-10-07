"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Maximize2, Pause, Play, Radio, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { DEMO_NOW } from "@/data/media/clock";
import { durationText, youtubeEmbed, type ClassVideo, type Course, type Lesson } from "@/lib/media/academy";
import { nextClass, type Batch } from "@/lib/media/batch";
import { cn } from "@/lib/utils";
import { DateText, Num, useFormat } from "../../ui/numerals";

/** The demo's one class recording; every class without its own YouTube link plays this. */
const SAMPLE = "/media/video/classroom.mp4";

/**
 * The room's big screen, after a course site's lecture player: the week's
 * recording with its own controls over the picture — back and forward ten
 * seconds, play, the time, a scrubber, sound and full screen — the lesson's
 * name on top, and the batch's next live class as a call to join.
 */
export function RoomPlayer({ batch, course, lesson, video, teacher, poster, className }: { batch: Batch; course: Course; lesson: Lesson; video?: ClassVideo; teacher: boolean; poster: string; className?: string }) {
  const { num } = useFormat();
  const box = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const embed = video?.href ? youtubeEmbed(video.href) : null;
  const next = nextClass(batch, DEMO_NOW);
  const live = `/media/academy/classroom/${encodeURIComponent(batch.id)}/live`;

  // The room keys this by week, so a new lesson starts fresh: from the top, paused.
  const toggle = () => {
    const v = el.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => setPlaying(false));
    else v.pause();
  };
  const skip = (s: number) => {
    const v = el.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + s));
  };
  const full = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen?.().catch(() => {});
  };
  const clock = (s: number) => num(durationText(Math.floor(s)));

  return (
    <section ref={box} aria-label={`সপ্তাহ ${lesson.week}: ${lesson.title}`} className={cn("group/player relative isolate min-h-60 overflow-hidden rounded-[1.6rem] bg-m-blue-night text-white shadow-m-lift", "aspect-video xl:aspect-auto", className)}>
      {embed ? (
        <iframe src={embed} title={lesson.title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="absolute inset-0 size-full" />
      ) : (
        <video
          ref={el}
          src={SAMPLE}
          poster={poster}
          playsInline
          preload="metadata"
          muted={muted}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
          className="absolute inset-0 size-full cursor-pointer object-cover"
        />
      )}

      {/* The lesson on top, the next live class beside it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-[linear-gradient(180deg,rgb(0_20_70/0.78),transparent)] p-4 pb-16 sm:p-6 sm:pb-20">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-xl leading-tight font-bold sm:text-[1.75rem]">{lesson.title}</h2>
          <p className="mt-1 text-sm font-semibold text-white/80">
            সপ্তাহ <Num value={lesson.week} /> • {embed ? "রেকর্ডিং" : "নমুনা রেকর্ডিং — ডেমোতে সব ক্লাসে এটাই চলে"}
          </p>
        </div>
        <button type="button" onClick={full} className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full bg-white text-m-ink shadow-m-tile transition-transform hover:scale-105 motion-reduce:transition-none" aria-label="পুরো পর্দা">
          <Maximize2 className="size-4.5" aria-hidden />
        </button>
      </div>

      <div className="absolute top-20 right-4 z-10 sm:top-24 sm:right-6">
        <Link href={live} className="flex items-center gap-2.5 rounded-full bg-white/14 py-1.5 pr-1.5 pl-3.5 text-sm font-semibold ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-white/22">
          <span className="relative flex size-2.5" aria-hidden>
            {next?.live && <span className="absolute inset-0 animate-ping rounded-full bg-m-yellow opacity-75 motion-reduce:animate-none" />}
            <span className="relative size-2.5 rounded-full bg-m-yellow" />
          </span>
          <span className="hidden sm:inline">{next?.live ? "এখন লাইভ" : next ? <>পরের লাইভ · <DateText iso={next.at} time weekday /></> : "লাইভ রুম"}</span>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-m-yellow px-3 font-bold text-m-ink">
            <Radio className="size-4" aria-hidden /> {teacher ? "লাইভ শুরু" : "যোগ দিন"}
          </span>
        </Link>
      </div>

      {!embed && (
        <>
          {!playing && (
            <button type="button" onClick={toggle} className="absolute inset-0 z-0 m-auto grid size-20 place-items-center rounded-full bg-white/18 ring-1 ring-white/40 backdrop-blur-md transition-transform hover:scale-105 motion-reduce:transition-none" aria-label="চালান">
              <Play className="ml-1 size-8 fill-white" aria-hidden />
            </button>
          )}
          {/* The control bar, as glass over the picture. */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-2 rounded-2xl bg-m-blue-night/55 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:gap-3 sm:px-3.5">
            <Ctl label="১০ সেকেন্ড পিছনে" onClick={() => skip(-10)}>
              <RotateCcw className="size-4" aria-hidden />
            </Ctl>
            <Ctl label={playing ? "থামান" : "চালান"} onClick={toggle}>
              {playing ? <Pause className="size-4 fill-white" aria-hidden /> : <Play className="size-4 fill-white" aria-hidden />}
            </Ctl>
            <Ctl label="১০ সেকেন্ড সামনে" onClick={() => skip(10)}>
              <RotateCw className="size-4" aria-hidden />
            </Ctl>
            <span className="shrink-0 text-xs font-semibold text-white/85 tabular-nums">
              {clock(time)} / {clock(length)}
            </span>
            <input
              type="range"
              min={0}
              max={length || 1}
              step={0.1}
              value={time}
              onChange={(e) => {
                const v = el.current;
                if (v) v.currentTime = Number(e.target.value);
              }}
              aria-label="ভিডিওর কোথায়"
              aria-valuetext={`${clock(time)} / ${clock(length)}`}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-m-yellow"
            />
            <Ctl label={muted ? "শব্দ চালু" : "শব্দ বন্ধ"} onClick={() => setMuted((m) => !m)}>
              {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            </Ctl>
          </div>
        </>
      )}
      <span className="sr-only">{course.title}</span>
    </section>
  );
}

function Ctl({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-8 shrink-0 place-items-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white">
      {children}
    </button>
  );
}
