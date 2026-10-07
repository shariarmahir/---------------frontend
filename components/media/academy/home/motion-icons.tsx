"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * The academy's moving icons, drawn on a 48-unit grid in the brand's four
 * colours. Each plays a short loop while it is on screen — a live dot
 * pulsing, a coin dropping into the wallet — and stands still otherwise,
 * or always with reduced motion.
 */

type IconProps = { className?: string };

const every = (duration: number, delay = 0) => ({ duration, delay, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" as const });

function Icon({ className, children }: IconProps & { children: (on: boolean) => React.ReactNode }) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { margin: "-5% 0px" });
  const reduce = useReducedMotion();
  return (
    <svg ref={ref} viewBox="0 0 48 48" className={className} aria-hidden>
      {children(seen && !reduce)}
    </svg>
  );
}

/** A class on screen with the live dot pulsing. */
export const LiveIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="5" y="9" width="38" height="27" rx="5" className="fill-text-primary" />
        <rect x="9" y="13" width="30" height="19" rx="2" className="fill-bd-green" />
        <circle cx="24" cy="20" r="4" className="fill-white" />
        <path d="M16 32 a8 6 0 0 1 16 0 Z" className="fill-white" />
        <rect x="18" y="38" width="12" height="3" rx="1.5" className="fill-text-primary" />
        <motion.circle cx="38" cy="10" r="4.5" className="fill-signal-orange" animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={every(0.9)} />
      </>
    )}
  </Icon>
);

/** A lesson sheet whose play button breathes. */
export const PlayIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="9" y="5" width="30" height="38" rx="4" className="fill-bd-green" />
        <rect x="14" y="11" width="14" height="2.5" rx="1.25" className="fill-white/70" />
        <rect x="14" y="16" width="20" height="2.5" rx="1.25" className="fill-white/70" />
        <motion.g animate={on ? { scale: [1, 1.15, 1] } : { scale: 1 }} transition={every(0.8)}>
          <circle cx="24" cy="30" r="8" className="fill-signal-orange" />
          <path d="M21.5 26 L28.5 30 L21.5 34 Z" className="fill-text-primary" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A hammer coming down on the block, with a spark. */
export const HammerIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="26" y="34" width="17" height="8" rx="2" className="fill-bd-green-dark" />
        <motion.path
          d="M36 4 L38 9 L43 11 L38 13 L36 18 L34 13 L29 11 L34 9 Z"
          className="fill-signal-orange"
          animate={on ? { scale: [0, 0, 1.2, 0] } : { scale: 1 }}
          transition={{ ...every(1.1), times: [0, 0.45, 0.6, 1] }}
        />
        <motion.g style={{ originX: "50%", originY: "100%" }} animate={on ? { rotate: [0, -32, 8, 0] } : { rotate: 0 }} transition={{ ...every(1.1), times: [0, 0.4, 0.55, 1] }}>
          <rect x="12" y="16" width="5" height="26" rx="2" className="fill-text-primary" />
          <rect x="4" y="9" width="22" height="9" rx="2" className="fill-bd-green" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A clipboard ticking itself off, row by row. */
export const ChecklistIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="9" y="7" width="30" height="36" rx="4" className="fill-bd-green" />
        <rect x="17" y="4" width="14" height="7" rx="2" className="fill-text-primary" />
        {[18, 26, 34].map((y, i) => (
          <g key={y}>
            <motion.path
              d={`M13.5 ${y} l3 3 l5 -6`}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-signal-orange"
              animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
              transition={every(0.4, i * 0.35)}
            />
            <rect x="25" y={y - 1} width="9" height="2.5" rx="1.25" className="fill-white/80" />
          </g>
        ))}
      </>
    )}
  </Icon>
);

/** An idea lighting up. */
export const BulbIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.g animate={on ? { scale: [0.8, 1.12, 0.8], opacity: [0.4, 1, 0.4] } : { scale: 1, opacity: 1 }} transition={every(1.2)}>
          {[-60, -30, 0, 30, 60].map((deg) => (
            <rect key={deg} x="23" y="1" width="2.5" height="5" rx="1.25" transform={`rotate(${deg} 24 21)`} className="fill-signal-orange" />
          ))}
        </motion.g>
        <circle cx="24" cy="21" r="11" className="fill-signal-orange" />
        <path d="M20 23 q4 -6 8 0" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-text-primary" />
        <rect x="19" y="30" width="10" height="7" rx="2" className="fill-text-primary" />
        <rect x="20" y="38" width="8" height="3" rx="1.5" className="fill-bd-green" />
      </>
    )}
  </Icon>
);

/** Three examiners; a mark goes up. */
export const PanelIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.g animate={on ? { y: [6, 0, 0, 6], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 1 }} transition={every(1.6)}>
          <rect x="17" y="3" width="14" height="10" rx="2" className="fill-signal-orange" />
          <rect x="20" y="7" width="8" height="2" rx="1" className="fill-text-primary" />
          <rect x="23.25" y="13" width="1.5" height="4" className="fill-signal-orange" />
        </motion.g>
        {[12, 24, 36].map((x) => (
          <g key={x}>
            <circle cx={x} cy="23" r="4.5" className="fill-text-primary" />
            <rect x={x - 6} y="29" width="12" height="9" rx="4" className="fill-text-primary" />
          </g>
        ))}
        <rect x="3" y="36" width="42" height="7" rx="2" className="fill-bd-green" />
      </>
    )}
  </Icon>
);

/** A certificate, stamped with the seal. */
export const CertIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="4" y="8" width="40" height="29" rx="3" className="fill-bd-green" />
        <rect x="9" y="14" width="18" height="3" rx="1.5" className="fill-white" />
        <rect x="9" y="20" width="24" height="2.5" rx="1.25" className="fill-white/60" />
        <rect x="9" y="25" width="14" height="2.5" rx="1.25" className="fill-white/60" />
        <motion.g animate={on ? { scale: [1.6, 1, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }} transition={{ ...every(0.9), times: [0, 0.35, 1] }}>
          <path d="M33 37 l-3 9 l4 -2 l3 3 l1 -9 Z" className="fill-text-primary" />
          <circle cx="36" cy="34" r="7" className="fill-signal-orange" />
          <path d="M32.5 34 l2.5 2.5 l4.5 -5" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-text-primary" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A shield whose check draws itself. */
export const ShieldIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <path d="M24 4 L40 10 V22 C40 33 33 40 24 44 C15 40 8 33 8 22 V10 Z" className="fill-bd-green" />
        <path d="M24 4 L40 10 V22 C40 33 33 40 24 44 Z" className="fill-bd-green-dark" />
        <motion.path
          d="M16.5 24 l5 5 l10 -11"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-signal-orange"
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={every(0.6)}
        />
      </>
    )}
  </Icon>
);

/** A coin dropping into the wallet: the fee waits in escrow. */
export const WalletIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.g animate={on ? { y: [-8, 8], opacity: [0, 1, 1] } : { y: 0, opacity: 1 }} transition={{ ...every(1), times: [0, 0.3, 1] }}>
          <circle cx="30" cy="11" r="6" className="fill-signal-orange" />
          <text x="30" y="14" textAnchor="middle" className="fill-text-primary font-sans text-[8px] font-bold">
            ৳
          </text>
        </motion.g>
        <rect x="5" y="16" width="38" height="26" rx="5" className="fill-text-primary" />
        <rect x="5" y="16" width="38" height="8" rx="4" className="fill-bd-green" />
        <rect x="30" y="27" width="13" height="9" rx="3" className="fill-bd-green" />
        <circle cx="35" cy="31.5" r="2" className="fill-signal-orange" />
      </>
    )}
  </Icon>
);

/** The public board, filling with names. */
export const BoardIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="4" y="5" width="40" height="29" rx="3" className="fill-text-primary" />
        {[
          [12, 20],
          [19, 14],
          [26, 24],
        ].map(([y, w], i) => (
          <motion.rect key={y} x="10" y={y} height="3" rx="1.5" className="fill-white" animate={on ? { width: [0, w] } : { width: w }} transition={every(0.4, i * 0.25)} />
        ))}
        <motion.circle cx="37" cy="13" r="3.5" className="fill-signal-orange" animate={on ? { scale: [0, 0, 1.2, 1] } : { scale: 1 }} transition={{ ...every(1), times: [0, 0.6, 0.8, 1] }} />
        <rect x="22" y="34" width="4" height="7" className="fill-text-primary" />
        <rect x="14" y="40" width="20" height="3.5" rx="1.75" className="fill-bd-green" />
      </>
    )}
  </Icon>
);

/** A padlock snapping shut: the complaint stays private. */
export const LockIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.path
          d="M16 22 V15 a8 8 0 0 1 16 0 V22"
          fill="none"
          strokeWidth="4.5"
          className="stroke-text-primary"
          animate={on ? { y: [-5, -5, 0] } : { y: 0 }}
          transition={{ ...every(0.7), times: [0, 0.5, 1] }}
        />
        <rect x="10" y="21" width="28" height="22" rx="5" className="fill-signal-orange" />
        <circle cx="24" cy="30" r="3" className="fill-text-primary" />
        <rect x="22.5" y="31" width="3" height="6" rx="1.5" className="fill-text-primary" />
      </>
    )}
  </Icon>
);

/** A speech bubble, someone typing. */
export const ChatIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <path d="M6 10 a5 5 0 0 1 5 -5 h26 a5 5 0 0 1 5 5 v18 a5 5 0 0 1 -5 5 h-17 l-8 7 v-7 h-1 a5 5 0 0 1 -5 -5 Z" className="fill-bd-green" />
        {[15, 24, 33].map((cx, i) => (
          <motion.circle key={cx} cx={cx} cy="19" r="3" className="fill-white" animate={on ? { y: [0, -4, 0] } : { y: 0 }} transition={every(0.5, i * 0.15)} />
        ))}
      </>
    )}
  </Icon>
);

/** A teacher at the board, chalk line drawing. */
export const PresenterIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="3" y="5" width="32" height="24" rx="3" className="fill-bd-green" />
        <motion.path
          d="M8 22 l6 -6 l5 4 l9 -10"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-white"
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={every(0.9)}
        />
        <rect x="17" y="29" width="3" height="11" className="fill-text-primary" />
        <circle cx="40" cy="22" r="4" className="fill-text-primary" />
        <rect x="35" y="27" width="10" height="16" rx="4" className="fill-text-primary" />
        <motion.rect
          x="27"
          y="28"
          width="11"
          height="2.5"
          rx="1.25"
          className="fill-signal-orange"
          style={{ originX: "100%", originY: "50%" }}
          animate={on ? { rotate: [0, 18, 0] } : { rotate: 0 }}
          transition={every(0.9)}
        />
      </>
    )}
  </Icon>
);

/** The frame and loop timing, for icon sets drawn the same way elsewhere (the departments). */
export { Icon as MotionSvg, every as loopEvery };
