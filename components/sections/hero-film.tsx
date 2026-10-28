"use client";

import { useEffect, useRef } from "react";

/**
 * Mahir's drone film over a mustard field (edit of 2026-10-25, with the
 * "Bangladesh" label moved to the left). His 3840 × 2160 / 60 fps master
 * (120 Mbps, kept out of the repo in media-src/) carries black letterbox
 * bars; they are cropped off (rows 120–2040) and the picture is served pixel
 * for pixel, 3840 × 1920 at 60 fps and 24 Mbps, under GitHub's 100 MB file
 * limit (Mahir: "do not convert 4k"). Phones get a 1920 × 960 / 30 fps copy:
 * many can't decode 4K at 60 fps and would show nothing.
 */
const SRC_4K = "/hero/hero-4k.mp4";
const SRC_PHONE = "/hero/hero-phone.mp4";
export const HERO_POSTER = "/hero/hero-poster.jpg";
/** Width over height of the served frame (both copies). */
const FRAME = 2;
/**
 * The film's own "Bangladesh" label (pin and hand-drawn box), as fractions of
 * the served frame. It holds still from about 1 s to the end, so the lockup is
 * hung under it.
 */
const PIN = { left: 0.156, top: 0.427, bottom: 0.495 };
/** Where the frame is anchored vertically when a wide band crops it. */
const FOCUS_Y = 0.42;

/**
 * The hero's film, looping, silent and with no controls (Mahir, 2026-10-28:
 * the film has no music, so the page never plays sound). The browser scales
 * the 4K frame down to the screen itself, which is sharper than any
 * sharpening pass on a smaller encode.
 *
 * Framing: the film covers the band, cropped so the "Bangladesh" label stays
 * in view (on a phone the frame slides so it sits at the left edge), and the
 * band's `--pin-x` / `--pin-y` say where the lockup goes: flush with the
 * label's left edge, just under it. The poster backdrop is framed the same.
 *
 * Playback: the film pauses while the hero is scrolled away or the tab is
 * hidden, and picks up again when it returns. Reduced motion, Data Saver or a
 * 2G/3G link: the film is never fetched, the poster shows.
 */
export function HeroFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Framing, also under reduced motion (the poster and the lockup follow it).
  useEffect(() => {
    const band = wrapRef.current?.parentElement;
    const video = videoRef.current;
    const lockup = band?.querySelector<HTMLElement>("[data-hero-lockup]");
    if (!band || !video || !lockup) return;

    const frame = () => {
      const W = band.clientWidth;
      const H = band.clientHeight;
      if (!W || !H) return;
      const margin = 16;
      const gap = Math.max(12, W * 0.012);
      const lockW = lockup.offsetWidth;
      const lockH = lockup.offsetHeight;
      // object-fit: cover.
      const s = Math.max(W / FRAME, H);
      const dw = s * FRAME;
      const dh = s;
      let ox = (W - dw) / 2;
      if (ox + PIN.left * dw < margin) ox = margin - PIN.left * dw;
      ox = Math.min(0, Math.max(W - dw, ox));
      let oy = (H - dh) * FOCUS_Y;
      // Room under the label for the lockup, then never past the frame.
      const over = oy + PIN.bottom * dh + gap + lockH - (H - Math.max(margin, H * 0.08));
      if (over > 0) oy -= over;
      oy = Math.min(0, Math.max(H - dh, oy));

      const x = Math.min(ox + PIN.left * dw, W - margin - lockW);
      const y = oy + PIN.bottom * dh + gap;
      video.style.objectPosition = `${ox}px ${oy}px`;
      band.style.backgroundPosition = `${ox}px ${oy}px`;
      band.style.setProperty("--pin-x", `${Math.max(margin, x)}px`);
      band.style.setProperty("--pin-y", `${y}px`);
    };

    frame();
    const ro = new ResizeObserver(frame);
    ro.observe(band);
    ro.observe(lockup);
    return () => ro.disconnect();
  }, []);

  // Playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // The film is only fetched from here: never under reduced motion, nor on
    // Data Saver or a 2G/3G link, where the poster stays (CLAUDE.md §6): even
    // the phone copy is 17 MB.
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || net?.saveData || /(^|-)[23]g$/.test(net?.effectiveType ?? "")) return;

    video.muted = true;
    video.preload = "auto";
    video.play().catch(() => {});

    let inView = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);

    // A hidden tab pauses at once and picks up where it was on return.
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (inView) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="absolute inset-0 motion-reduce:hidden">
      {/* Nothing is fetched until the effect above starts it (muted, so it may autoplay). */}
      <video
        ref={videoRef}
        poster={HERO_POSTER}
        muted
        loop
        playsInline
        preload="none"
        className="hero-film absolute inset-0 size-full object-cover object-[50%_42%] max-sm:object-[20%_42%]"
      >
        <source src={SRC_4K} media="(min-width: 768px)" type="video/mp4" />
        <source src={SRC_PHONE} type="video/mp4" />
      </video>
    </div>
  );
}
