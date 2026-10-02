"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";

const loop = (duration: number, delay = 0): Transition => ({ duration, delay, repeat: Infinity, ease: "easeInOut" });

/**
 * Discussion Room: two speech bubbles taking turns, the front one typing.
 * Drawn in currentColor; the dots take the button's own colour (--icon-bg).
 */
export function DiscussionIcon({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M8 4.5h10a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-.5v2.5l-3-2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
        animate={reduce ? undefined : { y: [0, -1, 0] }}
        transition={loop(1.8, 0.9)}
      />
      <motion.g animate={reduce ? undefined : { y: [0, -1, 0] }} transition={loop(1.8)}>
        <path d="M3.5 10a2.5 2.5 0 0 1 2.5-2.5h7.5A2.5 2.5 0 0 1 16 10v4.5a2.5 2.5 0 0 1-2.5 2.5H8.5l-3 2.5V17h0A2.5 2.5 0 0 1 3.5 14.5Z" fill="currentColor" />
        {[7, 9.75, 12.5].map((x, i) => (
          <motion.circle
            key={x}
            cx={x}
            cy="12.25"
            r="1"
            style={{ fill: "var(--icon-bg, var(--color-signal-orange))" }}
            animate={reduce ? undefined : { cy: [12.25, 11.25, 12.25] }}
            transition={loop(0.9, i * 0.15)}
          />
        ))}
      </motion.g>
    </svg>
  );
}

/** মেধাবী বন্ধু: a bulb that glows on and off with sparks around it. Uses currentColor. */
export function BuddyIcon({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V17h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
        animate={reduce ? undefined : { fillOpacity: [0.15, 0.85, 0.15] }}
        transition={loop(2)}
      />
      <path d="M9.6 19.5h4.8M10.4 21.5h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {[
        { x: 20.5, y: 4.5, d: 0 },
        { x: 3.5, y: 6, d: 0.6 },
        { x: 20, y: 12.5, d: 1.1 },
      ].map((s) => (
        <motion.path
          key={`${s.x}-${s.y}`}
          d={`M${s.x} ${s.y - 2}L${s.x + 0.6} ${s.y - 0.6}L${s.x + 2} ${s.y}L${s.x + 0.6} ${s.y + 0.6}L${s.x} ${s.y + 2}L${s.x - 0.6} ${s.y + 0.6}L${s.x - 2} ${s.y}L${s.x - 0.6} ${s.y - 0.6}Z`}
          fill="currentColor"
          style={{ originX: `${s.x}px`, originY: `${s.y}px` }}
          animate={reduce ? undefined : { scale: [0.2, 1, 0.2], opacity: [0.2, 1, 0.2] }}
          transition={loop(1.6, s.d)}
        />
      ))}
    </svg>
  );
}
