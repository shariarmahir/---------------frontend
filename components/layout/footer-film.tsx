"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { FooterMusic } from "./footer-music";

/** The hero's film in its 1920-wide copy: the footer band never needs the 4K master. */
const SRC = "/hero/hero-phone.mp4";
const POSTER = "/hero/hero-poster.jpg";

/**
 * The page's last picture (Mahir, 2026-10-29): the hero's mustard-field film
 * looping across the footer's foot, always silent (its own soundtrack is
 * never played; the footer's music is the widget in its corner,
 * footer-music.tsx). The animated "Kandari Lab." wordmark of the hero
 * stands above the film's "Bangladesh" label. The film is fetched only as
 * the footer nears the screen (never on Data Saver or a 2G/3G link, or under
 * reduced motion, where the poster stands still) and pauses when it leaves.
 *
 * The wordmark is placed from the film's own framing: the film fills the
 * band by width and is cropped to 34% from its top, so where the label lies
 * is a fixed fraction of the screen's width. `--h` is the band's height.
 */
export function FooterFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || net?.saveData || /(^|-)[23]g$/.test(net?.effectiveType ?? "");
    if (still) return;

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView && !video.getAttribute("src")) video.src = SRC;
        if (inView) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (inView && video.getAttribute("src")) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    // A narrow band, about 6.5 : 1, framed on the film's "Bangladesh" label (Mahir, 2026-10-29).
    <div
      style={{ "--h": "min(max(9rem, 15vw), 22rem)" } as CSSProperties}
      className="relative mt-2 h-(--h) w-full overflow-hidden bg-black bg-[url(/hero/hero-poster.jpg)] bg-cover bg-position-[50%_34%]"
    >
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

      {/* The hero's animated wordmark, its foot just above the film's "Bangladesh" label (a still mark under
          reduced motion), with the music player standing over its left edge. Plain <img>: the image optimiser would
          flatten the animation. */}
      <div className="pointer-events-none absolute top-[calc(22.6vw-(56.25vw-var(--h))*0.34)] left-[15.7vw] flex w-[max(6.5rem,12.8vw)] -translate-y-full flex-col items-start gap-[max(0.25rem,0.4vw)]">
        <FooterMusic />
        <div aria-hidden className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/kandari-mark.webp" alt="" width={1200} height={179} loading="lazy" decoding="async" className="h-auto w-full motion-reduce:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero/kandari-mark.png" alt="" width={1200} height={179} loading="lazy" decoding="async" className="hidden h-auto w-full motion-reduce:block" />
        </div>
      </div>
    </div>
  );
}
