"use client";

import { useEffect, useMemo, useRef } from "react";
import { PIXEL_MASK } from "@/data/gori/pixel-mask";
import { assignPixels, GRID, isRestored } from "@/lib/gori/pixel-map";
import { useT } from "../provider";

const pixels = assignPixels(PIXEL_MASK);
const CELL = 10;
const GAP = 1.5;

// Corrupted: warm dark noise. Restored: bottle-green family. The flag's
// red disc emerges only where restored pixels fall inside it.
const NOISE = ["#2b1c1b", "#3a2220", "#2c2f2d", "#4a201c", "#1f2724", "#33282a"];
const GREEN = ["#006747", "#0b7a55", "#05734f", "#0f8a5f"];
const RED = ["#da291c", "#c72418", "#e0372a"];
const DISC = { x: 28.5, y: 33, r: 7.2 };
const inDisc = (x: number, y: number) => Math.hypot(x + 0.5 - DISC.x, y + 0.5 - DISC.y) <= DISC.r;

/**
 * Bangladesh as 1,304 pixels. Each belongs to one of the 32 modules (spread
 * across the country — no district is singled out); solving a module clears
 * its share of noise everywhere.
 */
export function PixelMap({ shares, highlight, className }: { shares: number[]; highlight?: number | null; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { n } = useT();

  const restored = useMemo(() => pixels.filter((p) => isRestored(p, shares[p.module] ?? 0)).length, [shares]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = GRID * CELL;
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    for (const p of pixels) {
      const ok = isRestored(p, shares[p.module] ?? 0);
      const pick = Math.floor(p.noise * 97);
      ctx.fillStyle = ok ? (inDisc(p.x, p.y) ? RED[pick % RED.length] : GREEN[pick % GREEN.length]) : NOISE[pick % NOISE.length];
      ctx.globalAlpha = ok ? 1 : 0.55 + p.noise * 0.45;
      ctx.fillRect(p.x * CELL + GAP / 2, p.y * CELL + GAP / 2, CELL - GAP, CELL - GAP);
    }
    ctx.globalAlpha = 1;
    if (highlight != null) {
      ctx.strokeStyle = "#e4b027";
      ctx.lineWidth = 2;
      for (const p of pixels) if (p.module === highlight) ctx.strokeRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    }
  }, [shares, highlight]);

  const pct = Math.round((restored / pixels.length) * 100);
  return (
    <figure className={className}>
      <canvas
        ref={ref}
        role="img"
        aria-label={`বাংলাদেশের পিক্সেল মানচিত্র: ${n(pixels.length)} পিক্সেলের ${n(restored)}টি পুনর্গঠিত (${n(pct)}%)।`}
        className="aspect-square h-auto w-full [image-rendering:pixelated]"
      />
      <figcaption className="sr-only">প্রতিটি পিক্সেল ৩২টি মডিউলের একটির অংশ; মডিউল সমাধান হলে তার পিক্সেল সবুজ হয়।</figcaption>
    </figure>
  );
}

export const PIXEL_COUNT = pixels.length;
