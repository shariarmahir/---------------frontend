"use client";

import { motion } from "framer-motion";
import type { School } from "@/lib/media/academy";
import { MotionSvg as Icon, loopEvery as every } from "../home/motion-icons";

/**
 * One moving icon per department, drawn like the home page's set: a
 * 48-unit grid, the brand's ink, bottle green, gold and white, a short loop
 * while on screen, still otherwise or with reduced motion.
 */

type IconProps = { className?: string };
const spin = (duration: number) => ({ duration, repeat: Infinity, ease: "linear" as const });

/** Code in a window: brackets, a slash writing itself, a cursor blinking. */
const CodeIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="4" y="7" width="40" height="34" rx="5" className="fill-text-primary" />
        <circle cx="10" cy="13" r="1.8" className="fill-signal-orange" />
        <circle cx="15.5" cy="13" r="1.8" className="fill-white/60" />
        <circle cx="21" cy="13" r="1.8" className="fill-white/60" />
        <path d="M17 21 l-6 6 l6 6" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-white" />
        <path d="M31 21 l6 6 l-6 6" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-white" />
        <motion.path d="M27 19 l-6 16" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-signal-orange" animate={on ? { pathLength: [0, 1, 1] } : { pathLength: 1 }} transition={every(1)} />
        <motion.rect x="37" y="34" width="3" height="4" rx="1" className="fill-signal-orange" animate={on ? { opacity: [1, 0, 1] } : { opacity: 1 }} transition={{ duration: 0.9, repeat: Infinity }} />
      </>
    )}
  </Icon>
);

function gear(cx: number, cy: number, r: number, teeth: number, tooth: number) {
  return Array.from({ length: teeth }, (_, k) => (
    <rect key={k} x={cx - tooth / 2} y={cy - r - tooth * 0.8} width={tooth} height={tooth * 1.3} rx={tooth / 4} transform={`rotate(${(360 / teeth) * k} ${cx} ${cy})`} />
  ));
}

/** Two gears turning against each other, a chip between them. */
const GearIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.g className="fill-bd-green" animate={on ? { rotate: 360 } : { rotate: 0 }} transition={spin(6)}>
          {gear(19, 28, 11, 8, 5)}
          <circle cx="19" cy="28" r="11" />
        </motion.g>
        <circle cx="19" cy="28" r="4" className="fill-white" />
        <motion.g className="fill-text-primary" animate={on ? { rotate: -360 } : { rotate: 0 }} transition={spin(4)}>
          {gear(36, 13, 6.5, 6, 4)}
          <circle cx="36" cy="13" r="6.5" />
        </motion.g>
        <circle cx="36" cy="13" r="2.4" className="fill-signal-orange" />
        <rect x="31" y="31" width="13" height="13" rx="2" className="fill-signal-orange" />
        <rect x="34.5" y="34.5" width="6" height="6" rx="1" className="fill-text-primary" />
      </>
    )}
  </Icon>
);

/** A house on stilts, its roof drawing itself, water moving underneath. */
const HouseIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <motion.path
          d="M-6 43 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-bd-green"
          animate={on ? { x: [0, 8] } : { x: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <rect x="13" y="33" width="3" height="10" className="fill-text-primary" />
        <rect x="32" y="33" width="3" height="10" className="fill-text-primary" />
        <rect x="10" y="20" width="28" height="14" rx="1.5" className="fill-bd-green" />
        <rect x="21" y="25" width="6" height="9" rx="1" className="fill-signal-orange" />
        <motion.path d="M6 22 L24 8 L42 22" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-text-primary" animate={on ? { pathLength: [0, 1, 1] } : { pathLength: 1 }} transition={every(1.2)} />
      </>
    )}
  </Icon>
);

/** A wheel spinning and a wrench working the hub. */
const WheelIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <circle cx="22" cy="27" r="16" className="fill-text-primary" />
        <circle cx="22" cy="27" r="11" className="fill-white" />
        <motion.g className="fill-bd-green" animate={on ? { rotate: 360 } : { rotate: 0 }} transition={spin(2.4)}>
          {[0, 60, 120].map((deg) => (
            <rect key={deg} x="21" y="16" width="2" height="22" rx="1" transform={`rotate(${deg} 22 27)`} />
          ))}
          <circle cx="22" cy="27" r="11" fill="none" />
        </motion.g>
        <circle cx="22" cy="27" r="3.5" className="fill-signal-orange" />
        <motion.g style={{ originX: "15%", originY: "85%" }} animate={on ? { rotate: [0, -25, 0] } : { rotate: 0 }} transition={every(0.8)}>
          <rect x="26" y="9" width="5" height="20" rx="2" transform="rotate(45 28.5 19)" className="fill-signal-orange" />
          <path d="M35 4 a6 6 0 1 0 6 6 l-4 0 l0 -4 Z" className="fill-signal-orange" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A pot on a flame, its lid rattling and steam rising. */
const PotIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        {[16, 24, 32].map((x, i) => (
          <motion.path
            key={x}
            d={`M${x} 14 q-3 -3 0 -6 t0 -6`}
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-bd-green"
            animate={on ? { y: [3, -2], opacity: [0, 1, 0] } : { y: 0, opacity: 1 }}
            transition={every(1.1, i * 0.25)}
          />
        ))}
        <motion.g animate={on ? { y: [0, -2.5, 0], rotate: [0, -4, 0] } : { y: 0, rotate: 0 }} transition={every(0.5)}>
          <rect x="8" y="17" width="32" height="4" rx="2" className="fill-text-primary" />
          <rect x="21" y="13.5" width="6" height="4" rx="1.5" className="fill-text-primary" />
        </motion.g>
        <path d="M9 22 h30 v10 a8 8 0 0 1 -8 8 h-14 a8 8 0 0 1 -8 -8 Z" className="fill-bd-green" />
        <rect x="3" y="24" width="7" height="3" rx="1.5" className="fill-text-primary" />
        <rect x="38" y="24" width="7" height="3" rx="1.5" className="fill-text-primary" />
        <motion.path d="M20 47 q-3 -4 1 -7 q0 3 3 3 q3 -2 1 -6 q6 4 3 10 Z" className="fill-signal-orange" style={{ originY: "100%" }} animate={on ? { scaleY: [1, 1.25, 0.9, 1] } : { scaleY: 1 }} transition={every(0.7)} />
      </>
    )}
  </Icon>
);

/** Sound bars moving and a note bobbing over them. */
const MusicIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        {[6, 13, 20, 27].map((x, i) => (
          <motion.rect
            key={x}
            x={x}
            y="22"
            width="5"
            height="22"
            rx="2"
            className={i === 2 ? "fill-signal-orange" : "fill-bd-green"}
            style={{ originY: "100%" }}
            animate={on ? { scaleY: [0.4, 1, 0.55, 0.85, 0.4] } : { scaleY: [0.6, 1, 0.75, 0.5][i] }}
            transition={{ duration: 1.1, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.g animate={on ? { y: [0, -4, 0], rotate: [0, 8, 0] } : { y: 0 }} transition={every(0.9)}>
          <rect x="40" y="4" width="3" height="20" rx="1" className="fill-text-primary" />
          <path d="M43 4 q4 3 3 9 q-1 -4 -3 -4 Z" className="fill-text-primary" />
          <ellipse cx="38" cy="24" rx="5" ry="4" className="fill-text-primary" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A brush laying a gold stroke across the page. */
const BrushIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="3" y="6" width="42" height="36" rx="4" className="fill-bd-green" />
        <motion.path d="M9 32 q8 -14 15 -4 t15 -6" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-signal-orange" animate={on ? { pathLength: [0, 1, 1] } : { pathLength: 1 }} transition={every(1.4)} />
        <circle cx="13" cy="14" r="3" className="fill-white" />
        <motion.g animate={on ? { x: [0, 30, 30], y: [0, -6, -6] } : { x: 30, y: -6 }} transition={every(1.4)}>
          <rect x="8" y="19" width="4" height="13" rx="2" transform="rotate(35 10 32)" className="fill-text-primary" />
          <path d="M7.5 31 l5 0 l-1 4 l-3 0 Z" transform="rotate(35 10 32)" className="fill-white" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** Kantha: a needle running stitches across the cloth. */
const StitchIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="3" y="10" width="42" height="28" rx="3" className="fill-bd-green" />
        <rect x="6" y="13" width="36" height="22" rx="2" fill="none" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-white/60" />
        {[9, 16, 23, 30].map((x, i) => (
          <motion.rect key={x} x={x} y="23" width="5" height="2.5" rx="1.25" className="fill-signal-orange" animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 1 }} transition={{ duration: 2.4, repeat: Infinity, times: [0, i * 0.18, i * 0.18 + 0.05, 0.92, 1] }} />
        ))}
        <motion.g animate={on ? { x: [0, 7, 14, 21, 28, 0], y: [0, -4, 0, -4, 0, 0] } : { x: 21, y: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="11" y="6" width="2.5" height="20" rx="1.25" transform="rotate(20 12 16)" className="fill-text-primary" />
          <circle cx="9.3" cy="8" r="1" className="fill-white" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** A camera: the lens focusing, the flash going off. */
const CameraIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="16" y="9" width="12" height="6" rx="2" className="fill-text-primary" />
        <rect x="4" y="13" width="40" height="28" rx="6" className="fill-text-primary" />
        <circle cx="24" cy="27" r="10" className="fill-white" />
        <motion.circle cx="24" cy="27" r="6.5" className="fill-bd-green" animate={on ? { scale: [1, 0.75, 1] } : { scale: 1 }} transition={every(1)} />
        <circle cx="21.5" cy="24.5" r="1.8" className="fill-white/80" />
        <motion.path d="M39 3 L40.5 7 L44.5 8.5 L40.5 10 L39 14 L37.5 10 L33.5 8.5 L37.5 7 Z" className="fill-signal-orange" animate={on ? { scale: [0, 0, 1.3, 0], opacity: [0, 0, 1, 0] } : { scale: 1, opacity: 1 }} transition={{ ...every(1), times: [0, 0.5, 0.65, 1] }} />
        <circle cx="38" cy="19" r="2" className="fill-signal-orange" />
      </>
    )}
  </Icon>
);

/** A ledger chart: bars rising, a trend line drawing over them. */
const ChartIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="4" y="42" width="40" height="3" rx="1.5" className="fill-text-primary" />
        {[
          [8, 0.4],
          [17, 0.6],
          [26, 0.5],
          [35, 0.9],
        ].map(([x, h], i) => (
          <motion.rect key={x} x={x} y="12" width="6" height="30" rx="1.5" className={i === 3 ? "fill-signal-orange" : "fill-bd-green"} style={{ originY: "100%" }} animate={on ? { scaleY: [0.1, h, h] } : { scaleY: h }} transition={every(1, i * 0.12)} />
        ))}
        <motion.path d="M8 28 l9 -6 l9 3 l13 -15" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-text-primary" animate={on ? { pathLength: [0, 0, 1] } : { pathLength: 1 }} transition={every(1.3)} />
        <circle cx="39" cy="10" r="3" className="fill-text-primary" />
      </>
    )}
  </Icon>
);

/** A mehndi flower, petals opening, turning slowly. */
const MehndiIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <motion.g animate={on ? { rotate: 360 } : { rotate: 0 }} transition={spin(18)}>
        {Array.from({ length: 8 }, (_, k) => (
          <motion.ellipse
            key={k}
            cx="24"
            cy="11"
            rx="4.5"
            ry="8"
            transform={`rotate(${k * 45} 24 24)`}
            className={k % 2 ? "fill-text-primary" : "fill-bd-green"}
            animate={on ? { opacity: [0.25, 1, 1, 0.25] } : { opacity: 1 }}
            transition={{ duration: 2.4, delay: k * 0.15, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <circle cx="24" cy="24" r="7" className="fill-white" />
        <circle cx="24" cy="24" r="4.5" className="fill-signal-orange" />
      </motion.g>
    )}
  </Icon>
);

/** A ball flying into the stumps, the bails jumping. */
const CricketIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="2" y="44" width="44" height="2" rx="1" className="fill-bd-green" />
        {[30, 35.5, 41].map((x) => (
          <rect key={x} x={x - 1.5} y="20" width="3" height="24" rx="1" className="fill-text-primary" />
        ))}
        <motion.g animate={on ? { y: [0, 0, -6, 0], rotate: [0, 0, -25, 0] } : { y: 0 }} transition={{ ...every(1.2), times: [0, 0.55, 0.7, 1] }}>
          <rect x="28" y="17" width="7" height="2.5" rx="1" className="fill-signal-orange" />
          <rect x="35.5" y="17" width="7" height="2.5" rx="1" className="fill-signal-orange" />
        </motion.g>
        <motion.g animate={on ? { x: [-2, 22, 22], y: [0, -14, 0], opacity: [1, 1, 0] } : { x: 6, y: -6 }} transition={{ ...every(1.2), times: [0, 0.55, 1] }}>
          <circle cx="6" cy="30" r="5" className="fill-signal-orange" />
          <path d="M3 27.5 q3 2.5 6 5" fill="none" strokeWidth="1.2" className="stroke-white" />
        </motion.g>
      </>
    )}
  </Icon>
);

/** Axes and a curve drawing itself, its tangent touching. */
const CurveIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="6" y="5" width="3" height="37" rx="1.5" className="fill-text-primary" />
        <rect x="6" y="39" width="38" height="3" rx="1.5" className="fill-text-primary" />
        <motion.path d="M10 36 C 20 36, 26 10, 42 8" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-bd-green" animate={on ? { pathLength: [0, 1, 1] } : { pathLength: 1 }} transition={every(1.2)} />
        <motion.g style={{ originX: "50%", originY: "50%" }} animate={on ? { rotate: [-12, 10, -12] } : { rotate: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="14" y="21" width="22" height="2.5" rx="1.25" transform="rotate(-38 25 22)" className="fill-signal-orange" />
        </motion.g>
        <circle cx="25" cy="22" r="3" className="fill-signal-orange" />
      </>
    )}
  </Icon>
);

/** A new department: an empty square with a plus pulsing — this one is still open. */
export const NewDeptIcon = ({ className }: IconProps) => (
  <Icon className={className}>
    {(on) => (
      <>
        <rect x="6" y="6" width="36" height="36" rx="6" fill="none" strokeWidth="2.5" strokeDasharray="5 4" className="stroke-current" />
        <motion.g animate={on ? { scale: [1, 1.2, 1], rotate: [0, 90, 90] } : { scale: 1 }} transition={every(1)}>
          <rect x="22" y="15" width="4" height="18" rx="2" className="fill-signal-orange" />
          <rect x="15" y="22" width="18" height="4" rx="2" className="fill-signal-orange" />
        </motion.g>
      </>
    )}
  </Icon>
);

const BY_DEPT: Record<string, (p: IconProps) => React.ReactNode> = {
  "web-ai": CodeIcon,
  mechatronics: GearIcon,
  architecture: HouseIcon,
  motor: WheelIcon,
  kitchen: PotIcon,
  music: MusicIcon,
  "fine-art": BrushIcon,
  textile: StitchIcon,
  media: CameraIcon,
  business: ChartIcon,
  beauty: MehndiIcon,
  sports: CricketIcon,
  math: CurveIcon,
};

/** A department opened later gets its school's icon. */
const BY_SCHOOL: Record<School, (p: IconProps) => React.ReactNode> = {
  engineering: GearIcon,
  trades: WheelIcon,
  food: PotIcon,
  arts: BrushIcon,
  media: CameraIcon,
  business: ChartIcon,
  life: MehndiIcon,
  science: CurveIcon,
};

/** The moving icon for a department. */
export function DeptIcon({ dept, school, className }: { dept: string; school: School; className?: string }) {
  const Draw = BY_DEPT[dept] ?? BY_SCHOOL[school];
  return <Draw className={className} />;
}
