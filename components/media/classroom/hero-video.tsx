"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** The classroom hero's moving backdrop (a 5-second loop, public/media/video). */
const SRC = "/media/video/classroom.mp4";

/**
 * A muted, looping video behind the hero's text. It plays only while the hero
 * is on screen and the tab is visible, and not at all for people who asked for
 * less motion or a lighter connection (the first frame stays). The footage is
 * a dark sketch on bright yellow; inverted to grey and screened over the
 * hero's ink-green ground it becomes faint chalk lines on a blackboard, so the
 * white text stays readable.
 */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = video.current;
    if (!el || reduce) return;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saver) return;

    let inView = false;
    const sync = () => {
      if (inView && document.visibilityState === "visible") void el.play().catch(() => {});
      else el.pause();
    };
    const watch = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    watch.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      watch.disconnect();
      document.removeEventListener("visibilitychange", sync);
      el.pause();
    };
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <video ref={video} src={SRC} muted loop playsInline preload="metadata" disablePictureInPicture tabIndex={-1} className="size-full object-cover opacity-25 mix-blend-screen grayscale invert" />
    </div>
  );
}
