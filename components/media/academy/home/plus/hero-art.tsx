"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The hero's right side: two fans of light opening behind a teacher at the
 * board, the photo rising in an arch to sit on the hero's lower edge. The
 * page's one entrance; everything else just appears.
 */
export function PlusHeroArt({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  const fan = (delay: number, from: number, to: number) =>
    reduce ? {} : { initial: { rotate: from, opacity: 0 }, animate: { rotate: to, opacity: 1 }, transition: { duration: 1.1, delay, ease } };
  return (
    <div className="relative mx-auto h-72 w-full max-w-md self-end sm:h-80 lg:mx-0 lg:ml-auto lg:h-88">
      {/* Azure Mist fan, pivoting on its lower-left corner. */}
      <motion.span
        aria-hidden
        {...fan(0.05, -38, -14)}
        style={reduce ? { rotate: -14 } : undefined}
        className="absolute bottom-0 left-[6%] block size-76 origin-bottom-left rounded-tr-full bg-m-ground shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.35)] sm:size-84"
      />
      {/* A lighter blue fan on the right, half see-through. */}
      <motion.span
        aria-hidden
        {...fan(0.15, 40, 16)}
        style={reduce ? { rotate: 16 } : undefined}
        className="absolute right-0 bottom-0 block size-68 origin-bottom-right rounded-tl-full bg-white/18 backdrop-blur-[2px] sm:size-76"
      />
      <motion.figure
        initial={reduce ? false : { y: 60, opacity: 0, clipPath: "inset(30% 0 0 0 round 999px 999px 0 0)" }}
        animate={{ y: 0, opacity: 1, clipPath: "inset(0% 0 0 0 round 999px 999px 0 0)" }}
        transition={{ duration: 1, delay: 0.25, ease }}
        className="absolute bottom-0 left-1/2 h-[92%] w-[62%] -translate-x-1/2 overflow-hidden rounded-t-full ring-10 ring-white/15"
      >
        <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 18rem, 60vw" className="object-cover object-[50%_30%]" />
        <span className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-m-blue-deep/40 to-transparent" aria-hidden />
      </motion.figure>
    </div>
  );
}
