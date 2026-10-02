"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/*
 * The scenes that are drawn rather than captured: the film's opening (a
 * pile of CVs nobody can check) and its end card, and the classroom's
 * students-with-an-idea sketch, which is the real classroom video.
 * Sizes are in container units so the drawing scales with its frame.
 */

const d = (ms: number, extra?: Record<string, string>) => ({ "--d": ms, ...extra }) as CSSProperties;

function CvPaper({ r, dx, delay, className }: { r: string; dx: string; delay: number; className?: string }) {
  return (
    <div
      className={`pf-deal absolute flex aspect-3/4 w-[24cqw] flex-col gap-[1.3cqw] rounded-[1.2cqw] bg-white p-[2cqw] shadow-ink ${className ?? ""}`}
      style={{ ...d(delay, { "--dx": dx }), transform: `rotate(${r})` }}
    >
      <div className="flex items-center gap-[1.4cqw]">
        <span className="aspect-square w-[5.5cqw] rounded-[0.8cqw] bg-text-primary/15" />
        <span className="flex flex-1 flex-col gap-[0.9cqw]">
          <span className="h-[1.1cqw] w-4/5 rounded-full bg-text-primary/70" />
          <span className="h-[0.9cqw] w-1/2 rounded-full bg-text-primary/25" />
        </span>
      </div>
      <span className="font-bengali text-[1.8cqw] font-bold text-text-primary/60">সিভি</span>
      {[90, 75, 85, 60, 80, 55].map((w, i) => (
        <span key={i} className="h-[0.9cqw] rounded-full bg-text-primary/15" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** The opening: three CVs land, a stamp asks for proof, the questions pile up. */
export function CvArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-signal-orange">
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[36cqw] w-[60cqw]">
          <CvPaper r="-9deg" dx="-30px" delay={0} className="top-[3cqw] left-[2cqw]" />
          <CvPaper r="7deg" dx="30px" delay={280} className="top-[3cqw] right-[2cqw]" />
          <CvPaper r="-1deg" dx="0px" delay={140} className="top-0 left-1/2 -ml-[12cqw]" />
          <span
            className="pf-stamp absolute top-[13cqw] left-1/2 -ml-[13cqw] rounded-[1cqw] border-[0.5cqw] border-text-primary px-[2cqw] py-[0.6cqw] font-bengali text-[3.6cqw] font-bold whitespace-nowrap text-text-primary"
            style={d(1300)}
          >
            প্রমাণ কোথায়?
          </span>
        </div>
      </div>
      {[
        { text: "অভিজ্ঞতা কত বছর?", left: "18%", top: "18%", ms: 2100 },
        { text: "আসলে কী পারেন?", left: "80%", top: "26%", ms: 2700 },
        { text: "কাজের নমুনা আছে?", left: "76%", top: "82%", ms: 3300 },
      ].map((q) => (
        <span
          key={q.text}
          className="pf-pop absolute rounded-full bg-text-primary px-[2.2cqw] py-[1cqw] font-bengali text-[2.3cqw] font-bold whitespace-nowrap text-white shadow-ink"
          style={{ left: q.left, top: q.top, ...d(q.ms) }}
        >
          {q.text}
        </span>
      ))}
    </div>
  );
}

/** The end card: the platform's name, its three words, and a few of its marks arriving. */
export function EndArt() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-signal-orange text-text-primary">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] text-center">
        {/* The brand's three pixels, in colours that hold on gold. */}
        <span aria-hidden className="pf-rise flex gap-[1cqw]" style={d(0)}>
          {["bg-text-primary", "bg-bd-green", "bg-white"].map((c, i) => (
            <span key={c} className={`pixel-wave size-[2cqw] rounded-[0.5cqw] ${c}`} style={{ "--i": i, "--glow": "white" } as CSSProperties} />
          ))}
        </span>
        <p className="pf-rise font-bengali text-[8.4cqw] leading-[1.2] font-bold" style={d(150)}>
          শিক্ষিতদের মিডিয়া
        </p>
        <p className="pf-rise font-bengali text-[3cqw] font-bold text-text-primary/75" style={d(350)}>
          দক্ষতা · প্রমাণ · সুযোগ
        </p>
        <p className="pf-rise mt-[1.5cqw] rounded-full bg-text-primary px-[2.6cqw] py-[1.1cqw] font-bengali text-[2.2cqw] font-bold text-signal-orange" style={d(650)}>
          এক এনআইডি, এক অ্যাকাউন্ট
        </p>
      </div>
      {[
        { text: "★ ৪.৯ · যাচাইকৃত", left: "16%", top: "20%", ms: 1100, tone: "bg-white" },
        { text: "ন্যায্য মজুরি ✓", left: "84%", top: "22%", ms: 1400, tone: "bg-bd-green text-white" },
        { text: "এসক্রোতে নিরাপদ", left: "18%", top: "80%", ms: 1700, tone: "bg-text-primary text-white" },
        { text: "দল · উদ্যোগ · চ্যালেঞ্জ", left: "82%", top: "80%", ms: 2000, tone: "bg-white" },
      ].map((c) => (
        <span
          key={c.text}
          className={`pf-pop absolute rounded-full px-[2cqw] py-[0.9cqw] font-bengali text-[2cqw] font-bold whitespace-nowrap shadow-ink ${c.tone}`}
          style={{ left: c.left, top: c.top, ...d(c.ms) }}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
}

/**
 * The classroom's sketch video (students, a question, light bulbs going on),
 * zoomed from the bottom so its hand-lettered title stays out of frame. Only
 * the clip's first part loops: after it the students leave and the title
 * moves to the centre. It plays only while its scene is showing, and never
 * under reduced motion.
 */
/** Seconds of the classroom clip that show the students. */
const LOOP_END = 2.4;

export function ClassroomVideoArt({ playing }: { playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (playing && !reduce) void el.play().catch(() => {});
    else el.pause();
  }, [playing]);
  return (
    <div className="absolute inset-0 overflow-hidden bg-signal-orange">
      <video
        ref={video}
        src="/platforms/classroom.mp4"
        muted
        loop
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > LOOP_END) e.currentTarget.currentTime = 0;
        }}
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden
        className="size-full origin-bottom scale-[1.42] object-cover"
      />
    </div>
  );
}
