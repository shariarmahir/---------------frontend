"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { AcademyRole } from "./academy-gate";

const RUN_MS = 4800;
/** When the learner sets off, and how long the walk takes (seconds). */
const START = 0.5;
const WALK = 3.4;
/** The four stations, left to right: the door, the bench, the panel, the certificate. */
const STATIONS = [95, 262, 418, 560];
const LABELS = ["ভর্তি", "শেখা", "প্রমাণ", "কাজ"];
/** The walk: up to a station, a pause there, on to the next. */
const WALK_TIMES = [0, 0.14, 0.25, 0.39, 0.5, 0.64, 0.75, 0.89, 1];
const WALK_X = [24, 95, 95, 206, 206, 352, 352, 508, 508];
const TRACK_W = [0, 75, 75, 242, 242, 398, 398, 540, 540];
const SCORES = ["৮১", "৭৮", "৮০"];

const CAPTIONS: Record<AcademyRole, string[]> = {
  learner: ["দরজা খুলছে — যোগ দেওয়া বিনামূল্যে…", "হাতে-কলমে শেখা চলছে…", "প্যানেলের সামনে প্রমাণ…", "সনদ হাতে — এবার কাজ।"],
  teacher: ["আপনার ক্লাসের দরজা খুলছে…", "উপকরণ আর হাজিরা সাজানো হচ্ছে…", "প্যানেলের খাতা গোছানো হচ্ছে…", "শিক্ষার্থীরা অপেক্ষায়।"],
};

/** Seconds into the story when the learner reaches station k. */
const arrive = (k: number) => START + WALK * WALK_TIMES[2 * k + 1];

/**
 * The academy opening, told as a short story: a learner walks in through
 * the door, works at the bench, faces the panel and leaves with a
 * certificate and a job. Under five seconds, skippable; with reduced
 * motion the finished scene shows for a moment instead.
 */
export function AcademyStory({ role, name, onDone }: { role: AcademyRole; name?: string; onDone: () => void }) {
  const reduce = Boolean(useReducedMotion());
  const captions = CAPTIONS[role];
  const [step, setStep] = useState(reduce ? captions.length - 1 : 0);

  useEffect(() => {
    const timers = [window.setTimeout(onDone, reduce ? 700 : RUN_MS)];
    if (!reduce) for (let k = 1; k < captions.length; k++) timers.push(window.setTimeout(() => setStep(k), (arrive(k) - 0.3) * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onDone, reduce, captions.length]);

  /** Animate to `to` after `delay`; with reduced motion, start there. */
  const play = (to: Record<string, number>, from: Record<string, number>, delay: number, transition: object = {}) =>
    reduce
      ? { initial: false as const, animate: to }
      : { initial: from, animate: to, transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, ...transition } };
  const pop = (delay: number) => play({ y: 0, opacity: 1 }, { y: 24, opacity: 0 }, delay, { type: "spring", stiffness: 420, damping: 20 });
  const spring = (delay: number) => play({ scale: 1, opacity: 1 }, { scale: 0, opacity: 0 }, delay, { type: "spring", stiffness: 500, damping: 16 });
  const reveal = (delay: number, width: number) => play({ width }, { width: 0 }, delay, { duration: 0.35, ease: "easeOut" });
  const walk = { duration: WALK, times: WALK_TIMES, ease: "easeInOut" as const, delay: START };

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-46 grid place-items-center overflow-hidden bg-m-yellow px-4 font-sans text-m-ink">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <motion.p {...pop(0)} className="rounded-full bg-m-card px-4 py-1.5 text-sm font-bold text-m-blue">
          স্বাগতম{name ? `, ${name}` : ""}{role === "teacher" ? " · শিক্ষক" : ""}
        </motion.p>

        <svg viewBox="0 56 640 234" className="mt-4 w-full" aria-hidden>
          {/* The road the learner walks, filling in behind them. */}
          <rect x="20" y="232" width="600" height="4" rx="2" className="fill-m-ink/20" />
          <motion.rect x="20" y="232" height="4" rx="2" className="fill-m-ink" initial={reduce ? false : { width: 0 }} animate={{ width: reduce ? 540 : TRACK_W }} transition={reduce ? undefined : walk} />

          {/* 1 · The door: shut, then swinging open as the learner arrives. */}
          <motion.g {...pop(0.1)}>
            <rect x="66" y="104" width="58" height="12" rx="3" className="fill-m-blue-deep" />
            <rect x="70" y="118" width="50" height="114" rx="6" className="fill-m-ink" />
            <rect x="76" y="124" width="38" height="108" rx="2" className="fill-m-ink" />
            <motion.g style={{ originX: 0 }} {...play({ scaleX: 0.14 }, { scaleX: 1 }, arrive(0) - 0.4, { duration: 0.45 })}>
              <rect x="76" y="124" width="38" height="108" rx="2" className="fill-m-blue" />
              <circle cx="106" cy="182" r="3" className="fill-m-yellow" />
            </motion.g>
          </motion.g>

          {/* 2 · The bench: code writes itself on the laptop, the gear turns. */}
          <motion.g {...pop(0.18)}>
            <rect x="222" y="196" width="80" height="8" rx="3" className="fill-m-ink" />
            <rect x="230" y="204" width="6" height="28" rx="2" className="fill-m-ink" />
            <rect x="288" y="204" width="6" height="28" rx="2" className="fill-m-ink" />
            <rect x="234" y="150" width="50" height="40" rx="4" className="fill-m-ink" />
            <rect x="238" y="154" width="42" height="31" rx="2" className="fill-m-blue-deep" />
            <rect x="228" y="190" width="62" height="6" rx="2" className="fill-m-ink" />
            <motion.rect x="243" y="160" height="3" rx="1.5" className="fill-m-ink" {...reveal(arrive(1), 24)} />
            <motion.rect x="249" y="167" height="3" rx="1.5" className="fill-m-yellow" {...reveal(arrive(1) + 0.15, 18)} />
            <motion.rect x="249" y="174" height="3" rx="1.5" className="fill-m-ink" {...reveal(arrive(1) + 0.3, 24)} />
            <g transform="translate(298 168)">
              <motion.g {...play({ rotate: 180 }, { rotate: 0 }, arrive(1), { duration: 0.9, ease: "easeInOut" })}>
                {Array.from({ length: 8 }, (_, i) => (
                  <rect key={i} x="-2.5" y="-13" width="5" height="6" rx="1" transform={`rotate(${i * 45})`} className="fill-m-ink" />
                ))}
                <circle r="9" className="fill-m-ink" />
                <circle r="3.5" className="fill-m-yellow" />
              </motion.g>
            </g>
          </motion.g>

          {/* 3 · The panel: three examiners lift their marks, one after another. */}
          <motion.g {...pop(0.26)}>
            {[392, 418, 444].map((x, i) => (
              <g key={x}>
                <motion.g {...pop(arrive(2) + i * 0.16)}>
                  <rect x={x - 1} y="160" width="2" height="12" className="fill-m-ink" />
                  <rect x={x - 13} y="140" width="26" height="20" rx="4" className="fill-m-ink" />
                  <text x={x} y="155" textAnchor="middle" className="fill-m-ink font-sans text-[12px] font-bold">
                    {SCORES[i]}
                  </text>
                </motion.g>
                <circle cx={x} cy="178" r="8" className="fill-m-ink" />
                <rect x={x - 11} y="187" width="22" height="14" rx="7" className="fill-m-ink" />
              </g>
            ))}
            <rect x="374" y="198" width="88" height="8" rx="3" className="fill-m-ink" />
            <rect x="380" y="206" width="76" height="26" rx="2" className="fill-m-blue" />
          </motion.g>

          {/* 4 · The certificate unrolls and is sealed; the briefcase follows. */}
          <motion.g style={{ originY: 0 }} {...play({ scaleY: 1, opacity: 1 }, { scaleY: 0, opacity: 0 }, arrive(3) - 0.15, { duration: 0.45 })}>
            <rect x="528" y="118" width="64" height="48" rx="4" className="fill-m-ink" />
            <rect x="533" y="123" width="54" height="38" rx="2" strokeWidth="2" className="fill-none stroke-m-yellow" />
            <rect x="540" y="131" width="30" height="4" rx="2" className="fill-m-ink" />
            <rect x="540" y="139" width="40" height="3" rx="1.5" className="fill-m-ink/30" />
            <rect x="540" y="145" width="22" height="3" rx="1.5" className="fill-m-ink/30" />
          </motion.g>
          <motion.g {...spring(arrive(3) + 0.35)}>
            <path d="M574 166 l-4 14 l6 -3 l4 5 l2 -15 Z" className="fill-m-blue-deep" />
            <circle cx="580" cy="162" r="10" className="fill-m-blue" />
            <path d="M575 162 l4 4 l7 -8" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-m-ink" />
          </motion.g>
          <motion.g {...pop(arrive(3) + 0.55)}>
            <path d="M552 200 v-6 a3 3 0 0 1 3 -3 h12 a3 3 0 0 1 3 3 v6" fill="none" strokeWidth="4" className="stroke-m-ink" />
            <rect x="540" y="200" width="42" height="32" rx="5" className="fill-m-ink" />
            <rect x="540" y="211" width="42" height="3" className="fill-m-yellow" />
          </motion.g>
          {/* The brand's three pixels, thrown up in celebration. */}
          {!reduce && (
            <g transform="translate(556 110)">
              {["fill-m-yellow", "fill-m-blue", "fill-m-ink"].map((tone, i) => (
                <motion.rect
                  key={i}
                  width="9"
                  height="9"
                  rx="2"
                  className={tone}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], x: [0, (i - 1) * 26], y: [0, -46 + Math.abs(i - 1) * 12, -20], rotate: [0, 90 * (i - 1)] }}
                  transition={{ delay: arrive(3) + 0.45, duration: 0.9, ease: "easeOut" }}
                />
              ))}
            </g>
          )}

          {/* Station markers and their words, lit as the learner reaches them. */}
          {STATIONS.map((x, k) => (
            <g key={x}>
              <circle cx={x} cy="234" r="7" className="fill-m-ink/25" />
              <motion.circle cx={x} cy="234" r="7" className="fill-m-ink" {...spring(arrive(k))} />
              <motion.text
                x={x}
                y="272"
                textAnchor="middle"
                className="fill-m-ink font-sans text-[20px] font-bold"
                initial={reduce ? false : { opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ delay: arrive(k), duration: 0.3 }}
              >
                {LABELS[k]}
              </motion.text>
            </g>
          ))}

          {/* The learner, walking from station to station. */}
          <g transform="translate(0 232)">
            <motion.g
              initial={reduce ? false : { x: WALK_X[0], opacity: 0 }}
              animate={reduce ? { x: WALK_X[WALK_X.length - 1] } : { x: WALK_X, opacity: 1 }}
              transition={reduce ? undefined : { x: walk, opacity: { delay: START - 0.2, duration: 0.25 } }}
            >
              <motion.g animate={reduce ? undefined : { y: [0, -3, 0] }} transition={{ delay: START, duration: 0.3, repeat: Math.round(WALK / 0.3) - 1 }}>
                <rect x="-7" y="-22" width="5" height="22" rx="2" className="fill-m-ink" />
                <rect x="2" y="-22" width="5" height="22" rx="2" className="fill-m-ink" />
                <rect x="-10" y="-50" width="20" height="30" rx="9" className="fill-m-blue-deep" />
                <rect x="-13" y="-46" width="6" height="16" rx="3" className="fill-m-ink" />
                <circle cy="-60" r="9" className="fill-m-ink" />
              </motion.g>
            </motion.g>
          </g>
        </svg>

        <h2 className="mt-3 text-[clamp(1.75rem,6vw,3rem)] leading-tight font-bold">কাণ্ডারী তৈরি একাডেমি</h2>
        <p className="mt-1 text-lg font-bold text-m-blue-deep">“সবার আমি ছাত্র”</p>
        <p key={step} className="live-in mt-3 h-6 text-sm font-semibold text-m-ink/80">
          {captions[step]}
        </p>
        <div className="mt-4 h-2 w-56 overflow-hidden rounded-full bg-m-card/15">
          <motion.div className="h-full origin-left rounded-full bg-m-card" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: (reduce ? 700 : RUN_MS) / 1000, ease: "linear" }} />
        </div>
        <button type="button" onClick={onDone} className="mt-4 rounded-lg px-3 py-1.5 text-xs font-bold text-m-ink/70 transition-colors hover:bg-m-card/10 hover:text-m-ink">
          এড়িয়ে যান
        </button>
      </div>
    </div>
  );
}
