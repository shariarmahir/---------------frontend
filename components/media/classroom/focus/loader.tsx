"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const RUN_MS = 2600;
const STEPS = {
  student: ["বেঞ্চ সাজানো হচ্ছে…", "বোর্ড মোছা হচ্ছে…", "শিক্ষককে ডাকা হচ্ছে…", "AI সহায়ক জেগে উঠছে…"],
  parent: ["ক্লাসের দরজা খুলছে…", "নোটিশ বোর্ড গোছানো হচ্ছে…", "পরীক্ষার খবর আনা হচ্ছে…", "শুধু দেখার জন্য তৈরি…"],
};

/**
 * The classroom waking up: chalk writes on the board, books stack, the bell
 * swings. About two and a half seconds, skippable; with reduced motion the
 * finished board shows for a moment instead.
 */
export function ClassLoader({ parent, name, onDone }: { parent: boolean; name?: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const steps = STEPS[parent ? "parent" : "student"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const total = reduce ? 700 : RUN_MS;
    const done = window.setTimeout(onDone, total);
    const tick = window.setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), total / steps.length);
    return () => {
      window.clearTimeout(done);
      window.clearInterval(tick);
    };
  }, [onDone, reduce, steps.length]);

  const draw = (delay: number, duration = 0.7) =>
    reduce ? { initial: false as const } : { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { delay, duration, ease: "easeInOut" as const } };
  const reveal = (delay: number, width: number) =>
    reduce ? { initial: false as const, animate: { width } } : { initial: { width: 0 }, animate: { width }, transition: { delay, duration: 0.8, ease: "easeOut" as const } };
  const pop = (delay: number) => (reduce ? { initial: false as const } : { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay, type: "spring" as const, stiffness: 320, damping: 18 } });

  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-[45] grid place-items-center overflow-hidden bg-signal-orange px-4 font-sans text-text-primary">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <svg viewBox="0 0 520 360" className="w-full max-w-[30rem]" aria-hidden>
          <defs>
            <clipPath id="loader-line-1">
              <motion.rect x="84" y="56" height="44" {...reveal(0.25, 180)} />
            </clipPath>
            <clipPath id="loader-line-2">
              <motion.rect x="200" y="196" height="40" {...reveal(1.1, 170)} />
            </clipPath>
          </defs>

          {/* The bell, swinging from its bracket. */}
          <motion.g
            style={{ originX: "470px", originY: "14px" }}
            animate={reduce ? undefined : { rotate: [0, 14, -12, 8, -4, 0] }}
            transition={{ delay: 1.6, duration: 1, ease: "easeInOut" }}
          >
            <rect x="466" y="6" width="8" height="12" rx="2" className="fill-text-primary" />
            <path d="M452 46 Q452 18 470 18 Q488 18 488 46 L494 52 L446 52 Z" className="fill-text-primary" />
            <circle cx="470" cy="56" r="5" className="fill-text-primary" />
          </motion.g>

          {/* The board. */}
          <rect x="34" y="28" width="420" height="236" rx="20" className="fill-text-primary" />
          <rect x="50" y="44" width="388" height="204" rx="10" className="fill-bd-green-dark" />
          <rect x="150" y="262" width="190" height="10" rx="5" className="fill-text-primary" />
          <rect x="296" y="254" width="22" height="8" rx="3" className="fill-white" />

          {/* Chalk: letters, a right triangle, a wave, an atom, a sum. */}
          <g className="fill-white">
            <text x="88" y="90" clipPath="url(#loader-line-1)" className="font-sans text-[30px] font-bold">
              অ আ ক খ
            </text>
            <text x="204" y="226" clipPath="url(#loader-line-2)" className="font-sans text-[24px] font-bold">
              a² + b² = c²
            </text>
          </g>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" className="stroke-white">
            <motion.path d="M78 226 L162 226 L78 128 Z" {...draw(0.6)} />
            <motion.path d="M78 212 L92 212 L92 226" strokeWidth="3" {...draw(1.2, 0.3)} />
            <motion.path d="M190 160 C 214 112, 238 112, 262 160 S 310 208, 334 160" {...draw(0.9, 0.9)} />
            <motion.ellipse cx="392" cy="108" rx="34" ry="12" {...draw(1.3, 0.6)} />
            <motion.ellipse cx="392" cy="108" rx="34" ry="12" transform="rotate(60 392 108)" {...draw(1.45, 0.6)} />
            <motion.ellipse cx="392" cy="108" rx="34" ry="12" transform="rotate(120 392 108)" {...draw(1.6, 0.6)} />
          </g>
          <motion.circle cx="392" cy="108" r="6" className="fill-signal-orange" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9, type: "spring", stiffness: 400 }} />
          {!reduce && (
            <motion.circle
              r="4"
              className="fill-signal-orange"
              initial={{ cx: 426, cy: 108 }}
              animate={{ cx: [426, 392, 358, 392, 426], cy: [108, 120, 108, 96, 108] }}
              transition={{ delay: 1.9, duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* The chalk piece writing the first line. */}
          {!reduce && (
            <motion.rect
              width="18"
              height="7"
              rx="2"
              className="fill-white"
              initial={{ x: 88, y: 92, rotate: -30 }}
              animate={{ x: [88, 262, 208, 370], y: [92, 92, 232, 232] }}
              transition={{ delay: 0.25, duration: 1.7, times: [0, 0.45, 0.55, 1], ease: "easeOut" }}
            />
          )}

          {/* Books stacking up, and a pencil. */}
          <motion.g {...pop(0.4)}>
            <rect x="40" y="318" width="120" height="22" rx="4" className="fill-bd-green" />
            <rect x="48" y="324" width="104" height="3" rx="1.5" className="fill-white/60" />
          </motion.g>
          <motion.g {...pop(0.6)}>
            <rect x="52" y="296" width="104" height="22" rx="4" className="fill-white" />
            <rect x="60" y="303" width="40" height="3" rx="1.5" className="fill-text-primary/40" />
          </motion.g>
          <motion.g {...pop(0.8)}>
            <rect x="46" y="276" width="96" height="20" rx="4" className="fill-text-primary" />
            <rect x="54" y="283" width="56" height="3" rx="1.5" className="fill-signal-orange" />
          </motion.g>
          <motion.g initial={reduce ? false : { x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}>
            <g transform="rotate(-18 420 320)">
              <rect x="350" y="312" width="120" height="16" rx="3" className="fill-text-primary" />
              <rect x="350" y="312" width="16" height="16" rx="3" className="fill-white" />
              <path d="M470 312 L490 320 L470 328 Z" className="fill-bd-green" />
            </g>
          </motion.g>
        </svg>

        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{parent ? `${name ?? "সন্তানের"} ক্লাস খুলছে` : "ক্লাসরুম চালু হচ্ছে"}</h2>
        <p key={step} className="live-in mt-1 h-6 text-sm font-semibold text-text-primary/80">
          {steps[step]}
        </p>
        <div className="mt-5 h-2 w-56 overflow-hidden rounded-full bg-text-primary/15">
          <motion.div className="h-full origin-left rounded-full bg-text-primary" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: (reduce ? 700 : RUN_MS) / 1000, ease: "easeInOut" }} />
        </div>
        <button type="button" onClick={onDone} className="mt-5 rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary/70 transition-colors hover:bg-text-primary/10 hover:text-text-primary">
          এড়িয়ে যান
        </button>
      </div>
    </div>
  );
}
