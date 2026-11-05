"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/** The footer's own track: a file the site owns or is licensed to play (public/audio/README.txt). */
const SRC = "/audio/footer-music.mp3";
/** How long the music takes to swell in and fade out, so it never starts or stops with a jolt. */
const FADE_MS = 700;
const VOLUME = 0.7;
/** How long the "no track" note stays before the player settles back. */
const NOTICE_MS = 2600;

/** The progress ring's circumference (radius 20.5). */
const RING = 2 * Math.PI * 20.5;

/** The waveform's bars: bright fills that hold on the film's yellow and green, and how high each one peaks (0 to 1). */
const BARS = [
  { fill: "#ffd34d", peak: 0.55 },
  { fill: "#ffffff", peak: 0.9 },
  { fill: "#ff6b9d", peak: 0.7 },
  { fill: "#3fc8ff", peak: 1 },
  { fill: "#5df2c1", peak: 0.6 },
  { fill: "#ffffff", peak: 0.85 },
  { fill: "#ffd34d", peak: 0.5 },
  { fill: "#ff6b9d", peak: 0.75 },
];

/**
 * The footer film's music player (Mahir, 2026-10-29): a small transparent
 * player standing above the wordmark. A record with a play / pause hub in
 * its centre, a ring round it that fills as the track runs, and a slim
 * waveform beside it. It plays the footer's own track (the film itself is
 * always silent), swelling in on a tap: the record turns, the waveform
 * dances, a soft glow lights the player and small notes rise. It plays only
 * while it is on screen and the tab is visible, resuming when the viewer
 * comes back, and never starts by itself. If the track is missing it says
 * so for a moment and settles. Reduced motion: nothing spins or dances (the
 * ring still fills).
 */
export function FooterMusic() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const [on, setOn] = useState(false);
  const [notice, setNotice] = useState(false);
  const want = useRef(false);
  const inView = useRef(false);
  const fade = useRef(0);
  const noticeTimer = useRef(0);

  useEffect(() => {
    const button = buttonRef.current;
    const audio = audioRef.current;
    const ring = ringRef.current;
    if (!button || !audio || !ring) return;

    const ramp = (to: number, then?: () => void) => {
      cancelAnimationFrame(fade.current);
      const from = audio.volume;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FADE_MS);
        audio.volume = from + (to - from) * t;
        if (t < 1) fade.current = requestAnimationFrame(step);
        else then?.();
      };
      fade.current = requestAnimationFrame(step);
    };

    // The music plays when it is wanted, on screen and the tab is visible; otherwise it rests.
    const sync = () => {
      const playing = want.current && inView.current && !document.hidden;
      if (playing && audio.paused) {
        if (!audio.getAttribute("src")) audio.src = SRC;
        audio.volume = 0;
        audio.play().then(() => ramp(VOLUME)).catch(() => {});
      } else if (!playing && !audio.paused) {
        if (document.hidden) {
          cancelAnimationFrame(fade.current);
          audio.pause();
        } else ramp(0, () => audio.pause());
      } else if (playing) ramp(VOLUME);
    };

    const onWant = () => {
      want.current = !want.current;
      setOn(want.current);
      sync();
    };
    // A missing track: say so for a moment, then settle (the next tap tries again).
    const onFail = () => {
      want.current = false;
      setOn(false);
      audio.removeAttribute("src");
      audio.load();
      setNotice(true);
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(false), NOTICE_MS);
    };
    const onTime = () => {
      if (audio.duration > 0) ring.style.strokeDashoffset = String(RING * (1 - audio.currentTime / audio.duration));
    };

    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(button);
    document.addEventListener("visibilitychange", sync);
    button.addEventListener("click", onWant);
    audio.addEventListener("error", onFail);
    audio.addEventListener("timeupdate", onTime);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      button.removeEventListener("click", onWant);
      audio.removeEventListener("error", onFail);
      audio.removeEventListener("timeupdate", onTime);
      cancelAnimationFrame(fade.current);
      window.clearTimeout(noticeTimer.current);
      audio.pause();
    };
  }, []);

  return (
    <div className="relative">
      <audio ref={audioRef} loop preload="none" />
      <button
        ref={buttonRef}
        type="button"
        aria-pressed={on}
        aria-label={on ? "Pause the music" : "Play the music"}
        data-on={on || undefined}
        className="footer-music pointer-events-auto relative block aspect-136/44 h-[max(2.5rem,2.4vw)] rounded-full transition-[scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
      >
        <svg viewBox="0 0 136 44" aria-hidden className="footer-music-art block h-full w-full overflow-visible" strokeLinejoin="round" strokeLinecap="round">
          {/* The ring: a navy track that fills white as the track runs, from twelve o'clock. */}
          <circle cx="22" cy="22" r="20.5" fill="none" stroke="#0b1849" strokeWidth="4" />
          <circle
            ref={ringRef}
            cx="22"
            cy="22"
            r="20.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeDasharray={RING}
            strokeDashoffset={RING}
            transform="rotate(-90 22 22)"
          />
          {/* The record: grooves and a gold label; it turns while the music plays. */}
          <g className="footer-music-disc">
            <circle cx="22" cy="22" r="17" fill="#0b1849" />
            <circle cx="22" cy="22" r="14" fill="none" stroke="#2c3d82" strokeWidth="0.9" />
            <circle cx="22" cy="22" r="11.3" fill="none" stroke="#2c3d82" strokeWidth="0.9" />
            <path d="M9.5 15.5A14.5 14.5 0 0 1 19 8" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.6" />
            <path d="M34.5 28.5A14.5 14.5 0 0 1 25 36" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.6" />
            <circle cx="22" cy="22" r="8" fill="#e4b027" stroke="#fff6d6" strokeWidth="0.9" />
          </g>
          {/* The hub: play at rest, pause while it plays. */}
          <path className="footer-music-play" d="M19.4 17.6 27 22 19.4 26.4Z" fill="#0b1849" />
          <g className="footer-music-pause" fill="#0b1849">
            <rect x="18.6" y="17.6" width="3.2" height="8.8" rx="1.2" />
            <rect x="23.4" y="17.6" width="3.2" height="8.8" rx="1.2" />
          </g>
          {/* The waveform: eight slim bars growing from one baseline. */}
          <g>
            {BARS.map((bar, i) => (
              <rect
                key={i}
                className="footer-music-bar"
                x={53 + i * 10.4}
                y={6}
                width={5.4}
                height={32}
                rx={2.7}
                fill={bar.fill}
                stroke="#0b1849"
                strokeWidth={1.7}
                vectorEffect="non-scaling-stroke"
                style={{ "--i": i, "--peak": bar.peak } as CSSProperties}
              />
            ))}
          </g>
        </svg>
        {[0, 1].map((i) => (
          <span key={i} aria-hidden className="footer-sound-note hero-outline absolute -top-2 left-5 font-bold text-bdnavy-900" style={{ "--i": i } as CSSProperties}>
            ♪
          </span>
        ))}
      </button>
      {/* The missing track, said for a moment above the player. */}
      <p
        role="status"
        className={`pointer-events-none absolute bottom-full left-0 mb-1 rounded-full bg-bdnavy-900 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white transition-opacity duration-300 ${notice ? "opacity-100" : "opacity-0"}`}
      >
        {notice ? "Music coming soon" : ""}
      </p>
    </div>
  );
}
