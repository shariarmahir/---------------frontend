"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";

/** The hero's film in its 1920-wide copy: the footer band never needs the 4K master. */
const SRC = "/hero/hero-phone.mp4";
const POSTER = "/hero/hero-poster.jpg";
/** How long the sound takes to swell in, so it never starts with a jolt. */
const FADE_MS = 700;

/**
 * The page's last picture (Mahir, 2026-10-29): the hero's mustard-field film
 * looping silently across the footer's foot, with a sound button in its
 * bottom-left corner (the AI button floats over the right). The film is fetched only as the footer nears the screen (never on
 * Data Saver or a 2G/3G link until the button asks for it) and pauses when
 * it leaves. The music note swells the film's own soundtrack in and out;
 * while it plays, the note floats and sends small notes up. Reduced motion: the
 * poster stands still and the button still plays the sound.
 */
export function FooterFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  const fade = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || net?.saveData || /(^|-)[23]g$/.test(net?.effectiveType ?? "");

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView && !still && !video.src) video.src = SRC;
        if (inView && video.src && (!still || !video.muted)) video.play().catch(() => {});
        if (!inView) video.pause();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (inView && video.src && (!still || !video.muted)) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(fade.current);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    cancelAnimationFrame(fade.current);
    const on = !sound;
    setSound(on);
    if (on) {
      if (!video.src) video.src = SRC;
      video.volume = 0;
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setSound(false);
      });
    }
    // Swell in or out over FADE_MS, then mute when silent.
    const from = video.volume;
    const to = on ? 1 : 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FADE_MS);
      video.volume = from + (to - from) * t;
      if (t < 1) fade.current = requestAnimationFrame(step);
      else if (!on) video.muted = true;
    };
    fade.current = requestAnimationFrame(step);
  };

  return (
        // A narrow band, about 6.5 : 1, framed on the film's "Bangladesh" label (Mahir, 2026-10-29).
    <div className="relative mt-2 h-[max(9rem,15vw)] max-h-[22rem] w-full overflow-hidden bg-black bg-[url(/hero/hero-poster.jpg)] bg-cover bg-position-[50%_34%]">
      <video
        ref={videoRef}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="hero-film absolute inset-0 size-full object-cover object-[50%_34%]"
      />

      {/* A music note on the film, no disc behind it: navy with a thin gold outline (the hero claim's
          look), so it holds on the bright field. While the sound plays it floats and sends notes up. */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? "Mute the film's sound" : "Play the film's sound"}
        data-on={sound || undefined}
        className="footer-sound absolute bottom-2 left-[calc(0.5rem+env(safe-area-inset-left))] grid size-14 place-items-center rounded-xl text-bdnavy-900 transition-[scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none sm:bottom-4 sm:left-6 sm:size-16"
      >
        <Icon name={sound ? "music_note" : "music_off"} className="hero-outline text-4xl! sm:text-5xl!" />
        {[0, 1].map((i) => (
          <span key={i} aria-hidden className="footer-sound-note hero-outline absolute top-0 right-0 font-bold" style={{ "--i": i } as CSSProperties}>
            ♪
          </span>
        ))}
      </button>
    </div>
  );
}
