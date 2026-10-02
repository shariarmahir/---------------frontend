"use client";

import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";
import type { Mood } from "@/lib/media/class-ticker";

const loop = (duration: number, delay = 0): Transition => ({ duration, delay, repeat: Infinity, ease: "easeInOut" });

/** How the whole head moves: a drum-beat bounce, a shiver, a nod. */
const HEAD: Record<Mood, { animate: TargetAndTransition; transition: Transition }> = {
  cheer: { animate: { y: [0, -3, 0, -3, 0], rotate: [0, -6, 0, 6, 0] }, transition: loop(1.2) },
  worried: { animate: { rotate: [0, -4, 0] }, transition: loop(2.6) },
  nervous: { animate: { x: [0, -1.2, 1.2, -1.2, 1.2, 0] }, transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.2 } },
  panic: { animate: { x: [0, -1.6, 1.6, -1.6, 1.6, 0], y: [0, -1, 0] }, transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.5 } },
  determined: { animate: { y: [0, 2, 0], rotate: [0, 3, 0] }, transition: loop(1.4) },
  happy: { animate: { rotate: [0, -5, 5, 0], y: [0, -1.5, 0] }, transition: loop(2.2) },
};

const BLINK = { animate: { scaleY: [1, 1, 0.1, 1] }, transition: { duration: 3.2, times: [0, 0.9, 0.95, 1], repeat: Infinity } };

/**
 * A small animated face that feels the reminder with you: cheering for the
 * welcome, sweating over work not started, shaking at half-done work,
 * nodding when it is time to push. Ink face, gold features, so it sits on
 * the gold top bar. Still when motion is reduced.
 */
export function ReactionFace({ mood, className }: { mood: Mood; className?: string }) {
  const reduce = useReducedMotion();
  const head = reduce ? {} : HEAD[mood];
  const blink = reduce ? {} : BLINK;
  const wide = mood === "nervous" || mood === "panic";
  const closed = mood === "cheer" || mood === "happy";

  return (
    <motion.svg viewBox="0 0 48 48" className={className} aria-hidden {...head} style={{ originX: "24px", originY: "40px" }}>
      <circle cx="24" cy="24" r="21" className="fill-text-primary" />
      <circle cx="24" cy="24" r="21" fill="none" strokeWidth="1.5" className="stroke-white/15" />

      {/* Brows: worried tilt up in the middle, determined tilt down. */}
      {(mood === "worried" || mood === "panic" || mood === "nervous") && (
        <g strokeWidth="2.2" strokeLinecap="round" className="stroke-signal-orange">
          <path d="M13 16 L19 13.5" />
          <path d="M35 16 L29 13.5" />
        </g>
      )}
      {mood === "determined" && (
        <g strokeWidth="2.4" strokeLinecap="round" className="stroke-signal-orange">
          <path d="M13 14 L20 16.5" />
          <path d="M35 14 L28 16.5" />
        </g>
      )}

      {/* Eyes. */}
      {closed ? (
        <g fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-signal-orange">
          <path d="M14 22 Q17.5 18 21 22" />
          <path d="M27 22 Q30.5 18 34 22" />
        </g>
      ) : wide ? (
        <g>
          <circle cx="17.5" cy="21" r="4.6" className="fill-white" />
          <circle cx="30.5" cy="21" r="4.6" className="fill-white" />
          <motion.g animate={reduce ? undefined : { x: [0, -1.6, 1.6, 0] }} transition={loop(1.6)}>
            <circle cx="17.5" cy="21.5" r="2" className="fill-text-primary" />
            <circle cx="30.5" cy="21.5" r="2" className="fill-text-primary" />
          </motion.g>
        </g>
      ) : (
        <motion.g {...blink} style={{ originY: "21px" }}>
          <ellipse cx="17.5" cy="21" rx="2.4" ry="3" className="fill-signal-orange" />
          <ellipse cx="30.5" cy="21" rx="2.4" ry="3" className="fill-signal-orange" />
        </motion.g>
      )}

      {/* Mouths. */}
      {mood === "cheer" && (
        <motion.path
          d="M14 28 Q24 40 34 28 Z"
          className="fill-signal-orange"
          animate={reduce ? undefined : { scaleY: [1, 0.8, 1] }}
          transition={loop(0.6)}
          style={{ originY: "28px" }}
        />
      )}
      {mood === "happy" && <path d="M15.5 29 Q24 36 32.5 29" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-signal-orange" />}
      {mood === "determined" && <path d="M17 31 Q24 33.5 31 31" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-signal-orange" />}
      {mood === "worried" && <path d="M16.5 33 Q20 30 24 32 T31.5 31" fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-signal-orange" />}
      {mood === "nervous" && (
        <g>
          <rect x="15" y="29" width="18" height="6.5" rx="2" className="fill-white" />
          <path d="M21 29 V35.5 M27 29 V35.5 M15 32.2 H33" strokeWidth="1.2" className="stroke-text-primary" />
        </g>
      )}
      {mood === "panic" && (
        <motion.ellipse cx="24" cy="32.5" rx="4" ry="4.5" className="fill-signal-orange" animate={reduce ? undefined : { ry: [4.5, 3.4, 4.5] }} transition={loop(0.5)} />
      )}

      {/* Extras: a sweat drop, sparkles, a tear. */}
      {(mood === "worried" || mood === "nervous") && (
        <motion.path
          d="M38 12 Q40.5 16 38 17.5 Q35.5 16 38 12 Z"
          className="fill-white"
          initial={false}
          animate={reduce ? undefined : { y: [0, 7, 9], opacity: [0, 1, 0] }}
          transition={loop(1.8, 0.3)}
        />
      )}
      {mood === "panic" && (
        <motion.path d="M13 24 Q11 28 13 30 Q15 28 13 24 Z" className="fill-white" animate={reduce ? undefined : { y: [0, 8], opacity: [1, 0] }} transition={loop(1.1)} />
      )}
      {(mood === "happy" || mood === "cheer") &&
        [
          { x: 42, y: 8, d: 0 },
          { x: 5, y: 12, d: 0.7 },
        ].map((s) => (
          <motion.path
            key={s.x}
            d={`M${s.x} ${s.y - 3.5} L${s.x + 1} ${s.y - 1} L${s.x + 3.5} ${s.y} L${s.x + 1} ${s.y + 1} L${s.x} ${s.y + 3.5} L${s.x - 1} ${s.y + 1} L${s.x - 3.5} ${s.y} L${s.x - 1} ${s.y - 1} Z`}
            className="fill-white"
            style={{ originX: `${s.x}px`, originY: `${s.y}px` }}
            animate={reduce ? undefined : { scale: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3], rotate: [0, 45, 90] }}
            transition={loop(1.6, s.d)}
          />
        ))}
    </motion.svg>
  );
}
