"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

const FILMS = {
  "dye-floor": dynamic(() => import("@/components/projects/dye-floor-3d"), { ssr: false }),
  aponjon: dynamic(() => import("./aponjon-film"), { ssr: false }),
  swasti: dynamic(() => import("./swasti-film"), { ssr: false }),
  "smart-pharmacy": dynamic(() => import("./pharmacy-film"), { ssr: false }),
  biluibaba: dynamic(() => import("./biluibaba-film"), { ssr: false }),
  autolink: dynamic(() => import("./autolink-film"), { ssr: false }),
  "study-insights": dynamic(() => import("./study-insights-film"), { ssr: false }),
  "svc-ai": dynamic(() => import("./service-ai-film"), { ssr: false }),
  "svc-automation": dynamic(() => import("./service-automation-film"), { ssr: false }),
  "svc-iot": dynamic(() => import("./service-iot-film"), { ssr: false }),
  "svc-development": dynamic(() => import("./service-development-film"), { ssr: false }),
};

export type FilmId = keyof typeof FILMS;

/** Whether the element has been seen yet, and whether it is on screen now. */
function useInView(frame: RefObject<HTMLDivElement | null>) {
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [frame]);
  return { seen, visible };
}

/**
 * A 3D motion film in a wide, narrow band that runs the full width of
 * the page, with nothing laid over it. The film's code loads only once
 * the band scrolls into view; it plays only while on screen, starts still
 * when the viewer prefers less motion, and a click or Enter on it pauses
 * or plays it (the whole band is the control, with no visible button).
 * `label` tells screen readers what the film shows.
 */
export function MotionFilm({ film, label }: { film: FilmId; label: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { seen, visible } = useInView(frame);
  const [choice, setChoice] = useState<"auto" | "play" | "pause">("auto");
  const playing = visible && (choice === "play" || (choice === "auto" && !reduce));
  const Scene = FILMS[film];

  return (
    <div ref={frame} className="relative mx-[calc(50%-50vw)] aspect-video bg-black sm:aspect-5/2 lg:aspect-3/1">
      {seen ? <Scene playing={playing} /> : null}
      <button
        type="button"
        onClick={() => setChoice(playing ? "pause" : "play")}
        aria-label={`${label} ${playing ? "Pause the film." : "Play the film."}`}
        className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-signal-orange"
      />
    </div>
  );
}

/**
 * A film as a picture: it fills its box (a card's image area, a round hero
 * disc) with no control of its own, since the card around it is the link.
 * It loads when first seen, plays only while on screen and stays still
 * when the viewer prefers less motion. Decorative: the card's text says
 * what it is.
 */
export function FilmFrame({ film, className }: { film: FilmId; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { seen, visible } = useInView(frame);
  const Scene = FILMS[film];
  return (
    <div ref={frame} aria-hidden className={cn("relative bg-black", className)}>
      {seen ? <Scene playing={visible && !reduce} /> : null}
    </div>
  );
}
