"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The home page's "We repair Bangladesh" picture (Mahir, 2026-10-24): the
 * map of Bangladesh drawn in its own name, behind a panel of small red
 * cubes, the country's broken pixels (Mahir, 2026-10-29: real cubes, lit
 * from above). They are a halftone of the map itself (smaller over the
 * letters), so its shape shows faintly before it opens. In view, they
 * shimmer, then an uneven front spreads from the middle: each cube flares,
 * tumbles outward and fades, and the map comes through. Each cube is drawn
 * from one pre-rendered sprite, so a frame costs one image copy per cube. The map is always underneath; the canvas only covers it. Plain
 * canvas, no WebGL (CLAUDE.md §6). Reduced motion: the map alone.
 */

const SRC = "/about/bangladesh-map.jpg";
/** CSS pixels from one cube's centre to the next: large enough for its three faces to read. */
const PITCH = 9;
/** The shimmer before the front sets off. */
const LEAD_MS = 450;
/** How long the front takes to reach the farthest corner, and how long one dot takes to go. */
const SPREAD_MS = 1700;
const DOT_MS = 750;

interface Dot {
  x: number;
  y: number;
  /** 0 over the green field … 1 over the black letters. */
  ink: number;
  /** When it leaves, after the front starts (ms). */
  at: number;
  /** Which way it drifts as it goes (unit vector) and a twinkle phase. */
  dx: number;
  dy: number;
  phase: number;
}

/** A smooth, uneven field (a few crossed waves), so the front isn't a perfect circle. */
const wobble = (x: number, y: number) => Math.sin(x * 7.1 + y * 2.3) * 0.5 + Math.sin(x * 2.9 - y * 6.7 + 1.3) * 0.35 + Math.sin((x + y) * 11.3) * 0.15;

function layout(width: number, height: number, ink: (u: number, v: number) => number): Dot[] {
  const cols = Math.max(8, Math.round(width / PITCH));
  const rows = Math.max(8, Math.round(height / PITCH));
  const far = Math.hypot(0.5, 0.5 * (height / width));
  const dots: Dot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = (c + 0.5) / cols;
      const v = (r + 0.5) / rows;
      const ox = u - 0.5;
      const oy = (v - 0.5) * (height / width);
      const d = Math.hypot(ox, oy);
      // The unevenness grows with distance, so the middle always opens first.
      const reach = Math.min(1, Math.max(0, (d / far) * (1 + wobble(u, v) * 0.22)));
      dots.push({
        x: u * width,
        y: v * height,
        ink: ink(u, v),
        at: reach * SPREAD_MS + Math.random() * 220,
        dx: d ? ox / d : 0,
        dy: d ? oy / d : 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  return dots;
}

/** Reads the map small, so each dot knows whether it sits over a letter. */
function inkOf(img: HTMLImageElement): (u: number, v: number) => number {
  const W = 64;
  const H = Math.round((W * img.naturalHeight) / img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return () => 0;
  x.drawImage(img, 0, 0, W, H);
  const px = x.getImageData(0, 0, W, H).data;
  return (u, v) => {
    const i = (Math.min(H - 1, Math.floor(v * H)) * W + Math.min(W - 1, Math.floor(u * W))) * 4;
    const lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
    // The green field is ~0.4, the letters ~0.
    return Math.min(1, Math.max(0, 1 - lum / 0.35));
  };
}

/** Mixes a #rrggbb colour toward white (amount > 0) or black (amount < 0); any other form passes through. */
function shade(hex: string, amount: number): string {
  if (!/^#[\da-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  const ch = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${ch((n >> 16) & 255)} ${ch((n >> 8) & 255)} ${ch(n & 255)})`;
}

/** One isometric cube in `color`, lit from above: a light top, the colour on the left, a shaded right. */
function cubeSprite(color: string, px = 48): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const x = c.getContext("2d");
  if (!x) return c;
  const mid = px / 2;
  const face = (points: [number, number][], fill: string) => {
    x.beginPath();
    points.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b)));
    x.closePath();
    x.fillStyle = fill;
    x.fill();
  };
  face([[mid, 0], [px, px / 4], [mid, px / 2], [0, px / 4]], shade(color, 0.38));
  face([[0, px / 4], [mid, px / 2], [mid, px], [0, (px * 3) / 4]], color);
  face([[mid, px / 2], [px, px / 4], [px, (px * 3) / 4], [mid, px]], shade(color, -0.42));
  // A fine highlight along the top's front edges, where the light catches.
  x.strokeStyle = shade(color, 0.6);
  x.lineWidth = px / 24;
  x.beginPath();
  x.moveTo(0, px / 4);
  x.lineTo(mid, px / 2);
  x.lineTo(px, px / 4);
  x.stroke();
  return c;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export function MapRepair({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Nothing drawn leaves the canvas clear (and reduced motion hides it).
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = getComputedStyle(document.documentElement);
    const red = root.getPropertyValue("--color-national-crimson").trim();
    const bright = root.getPropertyValue("--color-crimson-bright").trim();
    const ground = root.getPropertyValue("--color-bdnavy-900").trim();
    const cube = cubeSprite(red);
    const cubeBright = cubeSprite(bright);

    let dots: Dot[] = [];
    let ink: (u: number, v: number) => number = () => 0;
    let size = { w: 0, h: 0, dpr: 1 };
    let begin = 0;
    let frame = 0;
    let alive = true;

    /** One frame; how many dots are still on the panel. */
    const draw = (now: number) => {
      const { w, h, dpr } = size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const since = begin ? now - begin - LEAD_MS : -1;
      let left = 0;

      // The ground opens in round holes, one per departing dot, that grow until they merge.
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-out";
      for (const d of dots) {
        const t = since < 0 ? 0 : (since - d.at) / DOT_MS;
        if (t < 1) left += 1;
        if (t <= 0) continue;
        ctx.beginPath();
        ctx.arc(d.x, d.y, PITCH * 0.8 * easeOut(Math.min(1, t * 1.4)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      for (const d of dots) {
        const t = since < 0 ? 0 : (since - d.at) / DOT_MS;
        if (t >= 1) continue;
        const shimmer = begin ? 0.5 + 0.5 * Math.sin(now / 160 + d.phase) : 0.5;
        const base = PITCH * (0.42 - d.ink * 0.14);
        let r = base;
        let x = d.x;
        let y = d.y;
        let alpha = 0.55 + 0.3 * (1 - d.ink) + 0.15 * shimmer;
        let sprite = cube;
        let spin = 0;
        if (t > 0) {
          // Flare, then drift out and up a little, shrinking to nothing.
          const e = easeOut(t);
          const flare = Math.max(0, 1 - Math.abs(t - 0.18) / 0.18);
          r = base * (1 + flare * 0.5) * (1 - e);
          x += d.dx * e * PITCH * 2.2;
          y += d.dy * e * PITCH * 2.2 - e * PITCH;
          alpha = Math.min(1, alpha + flare) * (1 - e);
          if (flare > 0.35) sprite = cubeBright;
          spin = e * (d.phase - Math.PI);
          if (flare > 0.2) {
            ctx.globalAlpha = flare * 0.35 * (1 - e);
            ctx.fillStyle = bright;
            ctx.beginPath();
            ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (r <= 0.05) continue;
        // The cube, a little wider than the old dot's diameter so its three faces read; tumbling as it goes.
        const side = r * 2.3;
        ctx.globalAlpha = alpha;
        if (spin) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(spin);
          ctx.drawImage(sprite, -side / 2, -side / 2, side, side);
          ctx.restore();
        } else {
          ctx.drawImage(sprite, x - side / 2, y - side / 2, side, side);
        }
      }
      ctx.globalAlpha = 1;
      return left;
    };

    const fit = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: box.width, h: box.height, dpr };
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      if (!begin) {
        dots = layout(box.width, box.height, ink);
        draw(0);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    // The halftone needs the map's pixels; until they arrive the dots are even.
    const img = new window.Image();
    img.onload = () => {
      if (!alive) return;
      ink = inkOf(img);
      if (!begin) fit();
    };
    img.src = SRC;

    const tick = (now: number) => {
      if (!begin) begin = now;
      if (draw(now) > 0) frame = requestAnimationFrame(tick);
      else setOpen(true);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(canvas);

    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={cn("catalog-fade relative aspect-3/4 w-36 overflow-hidden rounded-3xl ring-1 ring-white/12 sm:w-44 md:w-56 xl:w-64 2xl:w-72", className)}>
      <Image
        src={SRC}
        alt="The map of Bangladesh drawn with the letters of its own name, black on green"
        fill
        sizes="(min-width: 1536px) 288px, (min-width: 1280px) 256px, (min-width: 768px) 224px, (min-width: 640px) 176px, 144px"
        className="object-cover"
      />
      <canvas ref={canvasRef} aria-hidden className={cn("absolute inset-0 size-full motion-reduce:hidden", open && "hidden")} />
    </div>
  );
}
