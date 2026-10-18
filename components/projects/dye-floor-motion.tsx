"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const DyeFloor3D = dynamic(() => import("./dye-floor-3d"), { ssr: false });

/** The three beats the film walks through, one caption at a time. */
const STEPS = [
  { title: "Every machine reports", body: "Fifty machines in five bays send their step, temperature and level; each lid shows its status." },
  { title: "The hub works out the floor", body: "Signals arrive at the control hub, which projects each batch's end and spots the overruns." },
  { title: "Everyone sees what to do", body: "The wallboard, the tablets and the office get one picture, most urgent first." },
];

const LEGEND = [
  { label: "Running", className: "bg-link-blue" },
  { label: "Delayed", className: "bg-national-crimson" },
  { label: "On hold", className: "bg-signal-orange" },
  { label: "Batch ready", className: "bg-bdnavy-300" },
];

/**
 * The project's motion film: the 3D dyeing floor with captions that walk
 * through how the system works, like a short explainer video. The 3D code
 * loads only once the film scrolls into view, with the demo screenshot as
 * its poster until then; it plays only while on screen, pauses with the
 * button, and starts paused when the viewer prefers less motion.
 */
export function DyeFloorMotion({ poster }: { poster: { src: string; alt: string } }) {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<"auto" | "play" | "pause">("auto");
  const [step, setStep] = useState(0);
  const playing = visible && (choice === "play" || (choice === "auto" && !reduce));

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4500);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <figure className="story-reveal flex flex-col gap-4">
      <div ref={frame} className="relative aspect-video overflow-hidden rounded-3xl bg-black ring-1 ring-white/12">
        {seen ? (
          <DyeFloor3D playing={playing} />
        ) : (
          <Image src={poster.src} alt="" fill sizes="(min-width: 1280px) 80rem, 100vw" className="object-cover opacity-40" />
        )}

        {/* The caption for the current beat, bottom left. */}
        <div aria-live="polite" className="pointer-events-none absolute bottom-4 left-4 flex max-w-md flex-col gap-1 rounded-xl bg-black/65 p-4 sm:bottom-6 sm:left-6 sm:p-5">
          <span className="font-grotesk text-sm font-bold text-signal-orange">
            {step + 1} / {STEPS.length}
          </span>
          <p className="font-grotesk text-xl font-bold text-white sm:text-2xl">{STEPS[step].title}</p>
          <p className="max-w-lg font-sans text-sm leading-relaxed text-white/80 sm:text-base">{STEPS[step].body}</p>
        </div>

        <button
          type="button"
          onClick={() => setChoice(playing ? "pause" : "play")}
          aria-label={playing ? "Pause the animation" : "Play the animation"}
          className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 transition-colors duration-200 hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
        >
          <Icon name={playing ? "pause" : "play_arrow"} filled className="text-2xl" />
        </button>
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm text-white/65">
        {LEGEND.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span aria-hidden className={cn("size-2.5 rounded-full", item.className)} />
            {item.label}
          </span>
        ))}
        <span>Statuses as on the demo&rsquo;s fleet map; an illustration, not a live feed.</span>
      </figcaption>
    </figure>
  );
}
