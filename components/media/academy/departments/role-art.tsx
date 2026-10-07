"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Calculator, Camera, ChefHat, Code, Cpu, Flower2, Music, Palette, Ruler, Scissors, Sigma, Sparkles, Trophy, Wrench, type LucideIcon } from "lucide-react";
import type { Department } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DeptIcon } from "./dept-icons";

/** A small line glyph per department, for chips and the picture's corner. */
export const GLYPH: Record<string, LucideIcon> = {
  "web-ai": Code,
  mechatronics: Cpu,
  architecture: Ruler,
  motor: Wrench,
  kitchen: ChefHat,
  music: Music,
  "fine-art": Palette,
  textile: Scissors,
  media: Camera,
  business: Calculator,
  beauty: Flower2,
  sports: Trophy,
  math: Sigma,
};

// The fan turns about a point just below the picture's bottom edge.
const CX = 150;
const CY = 168;
const R = 118;
const at = (r: number, deg: number) => `${(CX + r * Math.cos((deg * Math.PI) / 180)).toFixed(1)} ${(CY + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`;
const sector = (r: number, a: number, b: number) => `M${CX} ${CY} L${at(r, a)} A${r} ${r} 0 0 1 ${at(r, b)} Z`;
const arc = (r: number, a: number, b: number) => `M${at(r, a)} A${r} ${r} 0 0 1 ${at(r, b)}`;

/** Gold fan on dark green, or green fan on ink — alternated along a row. */
export type ArtTone = "gold" | "green";

/**
 * A department's picture, drawn the way the big course sites draw a role: a
 * coloured fan opening behind, an outline arc tracing round it, a small
 * glyph on the fan, and in the middle — where they stand a person — a white
 * tile with the department's own moving icon, rising into place. The fan
 * turns a little more when the card is pointed at.
 */
export function RoleArt({ dept, tone, className }: { dept: Department; tone: ArtTone; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const show = reduce || seen;
  const Glyph = GLYPH[dept.id] ?? Sparkles;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div ref={ref} className={cn("relative aspect-[2/1] overflow-hidden rounded-xl", tone === "gold" ? "bg-bd-green-dark" : "bg-text-primary", className)}>
      <svg viewBox="0 0 300 150" className="absolute inset-0 size-full" aria-hidden>
        <path d={sector(R + 36, 214, 332)} className="fill-white/6" />
        <g className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-[7deg] motion-reduce:transition-none" style={{ transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` }}>
          <motion.path
            d={sector(R, 198, 334)}
            className={tone === "gold" ? "fill-signal-orange" : "fill-bd-green"}
            style={{ originX: 0.5, originY: 1 }}
            initial={reduce ? false : { rotate: -38, opacity: 0 }}
            animate={show ? { rotate: 0, opacity: 1 } : undefined}
            transition={{ duration: 0.9, ease }}
          />
        </g>
        <motion.path d={arc(R + 15, 204, 342)} fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-white/55" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.2, delay: 0.25, ease }} />
        <motion.path d={arc(R + 26, 222, 300)} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 6" className="stroke-white/40" initial={reduce ? false : { pathLength: 0 }} animate={show ? { pathLength: 1 } : undefined} transition={{ duration: 1.4, delay: 0.4, ease }} />
      </svg>

      <motion.span
        className="absolute top-[58%] left-[66%] grid -translate-x-1/2 -translate-y-1/2 place-items-center"
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : undefined}
        transition={{ delay: 0.75, type: "spring", stiffness: 300, damping: 15 }}
        aria-hidden
      >
        <motion.span className="inline-grid" animate={show && !reduce ? { scale: [1, 1.18, 1], rotate: [0, -8, 0] } : undefined} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut", delay: 1.5 }}>
          <Glyph className={cn("size-6", tone === "gold" ? "text-text-primary" : "text-signal-orange")} strokeWidth={2.4} />
        </motion.span>
      </motion.span>

      <motion.span
        className="absolute bottom-0 left-[44%] w-[32%] -translate-x-1/2"
        initial={reduce ? false : { y: "45%", opacity: 0 }}
        animate={show ? { y: "16%", opacity: 1 } : undefined}
        transition={{ delay: 0.35, type: "spring", stiffness: 170, damping: 17 }}
        aria-hidden
      >
        <span className={cn("grid aspect-square place-items-center rounded-2xl bg-white shadow-tile ring-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:-rotate-3 motion-reduce:transition-none", tone === "gold" ? "ring-bd-green-dark" : "ring-text-primary")}>
          <DeptIcon dept={dept.id} school={dept.school} className="size-[64%]" />
        </span>
      </motion.span>
    </div>
  );
}
