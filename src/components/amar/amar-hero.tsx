"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { REPORT_META } from "@/data/amar-bangladesh";

/** Three headline figures — enough to establish stakes without crowding. */
const TICKER = [
  { value: "17.6%", label: "GDP lost to pollution", tone: "text-tertiary" },
  { value: "272k", label: "Deaths / year", tone: "text-tertiary" },
  { value: "24/100", label: "Corruption index", tone: "text-signal" },
];

/**
 * 16:6 hero with the looping background video.
 *
 * The ratio is held by an aspect-ratio wrapper at every breakpoint, and the
 * content is deliberately sparse so it never outgrows the box. Type and
 * spacing scale fluidly with the viewport rather than jumping at breakpoints.
 *
 * Audio: browsers refuse autoplay with sound, so the video starts muted and
 * the toggle below unmutes on a real user gesture.
 */
export function AmarHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    // A paused video (autoplay blocked) needs an explicit play on this gesture.
    if (!next) void video.play().catch(() => {});
    setMuted(next);
  };

  return (
    <section
      id="amar-hero"
      className="relative w-full overflow-hidden bg-surface"
    >
      {/* Ratio box — 16:6 on every screen size. */}
      <div className="relative aspect-[16/6] max-h-[80svh] min-h-[22rem] w-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
        >
          <source src="/video/musicforhero.mp4" type="video/mp4" />
        </video>

        {/* Scrim: strong at the left where text sits, clear at the right. */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-surface via-surface/75 to-surface/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface to-transparent" />

        {/* Sound toggle. */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={
            muted ? "Unmute background video" : "Mute background video"
          }
          className="absolute right-[4vw] bottom-4 z-20 inline-flex items-center gap-2 rounded-full bg-surface-lowest/90 px-3 py-2 font-label-sm text-label-sm text-on-surface shadow-md backdrop-blur-sm transition-all hover:bg-surface-lowest active:scale-95 lg:right-[max(3rem,calc((100vw-1320px)/2))]"
        >
          <Icon
            name={muted ? "volume_off" : "volume_up"}
            className="text-[18px] text-deep-container"
          />
          <span className="hidden sm:inline">
            {muted ? "Play sound" : "Sound on"}
          </span>
        </button>

        {/* Content — vertically centred inside the ratio box. */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-[1.5vh] px-margin-mobile lg:px-margin">
            <div className="inline-flex w-fit items-center gap-space-xs rounded-full bg-secondary-fixed px-space-sm py-1 text-on-secondary-fixed">
              <Icon
                name="radar"
                className="text-[clamp(0.7rem,1vw,0.9rem)] text-signal"
              />
              <span className="font-label-sm text-[clamp(0.6rem,0.85vw,0.7rem)] tracking-wide">
                NATIONAL DOSSIER · {REPORT_META.sourcePoints} POINTS
              </span>
            </div>

            <h1 className="font-display font-extrabold tracking-tight">
              <span className="block text-[clamp(1.75rem,5.2vw,4rem)] leading-[1.05]">
                <span className="text-tertiary">আমার </span>
                <span className="text-deep">বাংলাদেশ</span>
              </span>
              <span className="block text-[clamp(0.95rem,2vw,1.6rem)] leading-tight font-bold text-on-surface">
                Every Problem Measured. Every Loss Calculated.
              </span>
            </h1>

            {/* Compact figure strip. */}
            <div className="flex flex-wrap gap-[0.6vw]">
              {TICKER.map((t) => (
                <div
                  key={t.label}
                  className="flex flex-col rounded-lg bg-surface-lowest/95 px-[1.1vw] py-[0.7vh] shadow-sm backdrop-blur-sm"
                >
                  <span
                    className={`font-display text-[clamp(0.95rem,1.9vw,1.6rem)] leading-none font-bold ${t.tone}`}
                  >
                    {t.value}
                  </span>
                  <span className="font-label-sm text-[clamp(0.55rem,0.75vw,0.7rem)] whitespace-nowrap text-on-surface-variant">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-[0.6vw]">
              <a
                href="#priority-breaks"
                className="flex items-center gap-1.5 rounded-lg bg-title px-[1.4vw] py-[0.9vh] font-display text-[clamp(0.7rem,1vw,0.875rem)] font-semibold whitespace-nowrap text-on-surface shadow-md transition-all hover:bg-signal hover:text-white active:scale-95"
              >
                <Icon
                  name="troubleshoot"
                  className="text-[clamp(0.85rem,1.2vw,1.1rem)]"
                />
                <span>Five Priority Breaks</span>
              </a>
              <a
                href="#loss-projection"
                className="flex items-center gap-1.5 rounded-lg bg-deep-container px-[1.4vw] py-[0.9vh] font-display text-[clamp(0.7rem,1vw,0.875rem)] font-semibold whitespace-nowrap text-white shadow-sm transition-all hover:bg-deep active:scale-95"
              >
                <Icon
                  name="query_stats"
                  className="text-[clamp(0.85rem,1.2vw,1.1rem)]"
                />
                <span>Loss to 2050</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
