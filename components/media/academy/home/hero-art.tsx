"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const SHOTS = [
  { src: "/media/circuit.webp", alt: "ব্রেডবোর্ডে সেন্সর আর ডিসপ্লে জোড়া দেওয়া সার্কিট", className: "right-0 bottom-0 w-[60%] h-[94%] rounded-t-full", sizes: "(min-width: 1024px) 300px, 55vw" },
  { src: "/media/kacchi.webp", alt: "বড় হাঁড়িতে কাচ্চি বিরিয়ানি", className: "left-0 top-[4%] w-[44%] aspect-square rounded-[2rem]", sizes: "(min-width: 1024px) 220px, 40vw" },
  { src: "/media/kantha-full.webp", alt: "নকশিকাঁথার সেলাই", className: "left-[8%] bottom-0 w-[36%] aspect-4/5 rounded-[2rem]", sizes: "(min-width: 1024px) 180px, 34vw" },
];

/**
 * The hero's picture: three crafts the academy teaches — circuits, cooking,
 * needlework — in arches and tiles, with the brand's shapes drifting round
 * them. The shapes hold still with reduced motion.
 */
export function HeroArt() {
  const reduce = useReducedMotion();
  const drift = (y: number, rotate: number, duration: number) =>
    reduce ? {} : { animate: { y: [0, y, 0], rotate: [0, rotate, 0] }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[34rem]">
      {/* Shapes behind the pictures. */}
      <motion.span className="absolute bottom-[6%] left-[30%] size-[38%] rounded-t-full bg-bd-green-dark" {...drift(-8, 0, 6)} aria-hidden />
      <motion.svg viewBox="0 0 60 52" className="absolute top-0 left-[46%] w-[16%]" {...drift(10, -10, 5)} aria-hidden>
        <path d="M30 0 L60 52 H0 Z" className="fill-bd-green" />
      </motion.svg>
      <motion.span className="absolute top-[8%] right-[2%] size-[18%] rounded-full border-[6px] border-text-primary" {...drift(8, 90, 9)} aria-hidden />

      {SHOTS.map((s, i) => (
        <motion.div
          key={s.src}
          className={`absolute overflow-hidden ring-4 ring-text-primary ${s.className}`}
          initial={reduce ? false : { opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src={s.src} alt={s.alt} fill sizes={s.sizes} className="object-cover" priority={i === 0} />
        </motion.div>
      ))}

      {/* The brand's three pixels, bobbing over the arch. */}
      <div className="absolute top-[14%] right-[24%] flex gap-1.5" aria-hidden>
        {["bg-text-primary", "bg-bd-green", "bg-white"].map((tone, i) => (
          <motion.span key={tone} className={`size-3.5 rounded-[4px] ${tone}`} {...(reduce ? {} : { animate: { y: [0, -8, 0] }, transition: { duration: 1.4, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" as const } })} />
        ))}
      </div>
    </div>
  );
}
