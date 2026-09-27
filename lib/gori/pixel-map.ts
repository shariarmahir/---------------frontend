/**
 * "From one pixel to a system" — Bangladesh as a 64 × 64 grid (CLAUDE.md §2:
 * the country as a low-resolution image, each unsolved problem a bad pixel).
 *
 * The land mask is rasterised from the real division outlines
 * (geoBoundaries, CC0). Land pixels are dealt out to the 32 modules by a
 * seeded shuffle, so every module owns pixels scattered across the whole
 * country: solving one clears noise everywhere and never implies that a
 * problem belongs to a particular district.
 */

import { createRng } from "./rng.ts";

export const GRID = 64;

type Poly = [number, number][];

/** "M x,y L x,y … Z M …" → polygons. */
export function parsePath(d: string): Poly[] {
  const polys: Poly[] = [];
  let cur: Poly = [];
  for (const m of d.matchAll(/([MLZ])\s*([-\d.]+)?,?([-\d.]+)?/g)) {
    if (m[1] === "M") {
      if (cur.length) polys.push(cur);
      cur = [[Number(m[2]), Number(m[3])]];
    } else if (m[1] === "L") cur.push([Number(m[2]), Number(m[3])]);
    else {
      if (cur.length) polys.push(cur);
      cur = [];
    }
  }
  if (cur.length) polys.push(cur);
  return polys;
}

function inside(x: number, y: number, poly: Poly): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Rows of "#" (land) and "." (water/outside), centred in a GRID × GRID square. */
export function rasterize(paths: string[], width: number, height: number, size = GRID): string[] {
  const polys = paths.flatMap(parsePath);
  const cell = Math.max(width, height) / size;
  const offX = (size * cell - width) / 2;
  const offY = (size * cell - height) / 2;
  const rows: string[] = [];
  for (let r = 0; r < size; r++) {
    let row = "";
    for (let c = 0; c < size; c++) {
      const x = (c + 0.5) * cell - offX;
      const y = (r + 0.5) * cell - offY;
      row += polys.some((p) => inside(x, y, p)) ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

export interface Pixel {
  x: number;
  y: number;
  /** 0-based module index (module n = index + 1). */
  module: number;
  /** Order in which this pixel clears as its module improves, 0–1. */
  rank: number;
  /** Stable per-pixel noise for the corrupted look, 0–1. */
  noise: number;
}

export function assignPixels(mask: string[], modules = 32, seed = "bd-pixels"): Pixel[] {
  const land: { x: number; y: number }[] = [];
  mask.forEach((row, y) => [...row].forEach((ch, x) => ch === "#" && land.push({ x, y })));
  const rng = createRng(seed);
  const order = land.map((p, i) => ({ i, k: rng.next() })).sort((a, b) => a.k - b.k);
  const counts = new Array(modules).fill(0);
  const out: Pixel[] = new Array(land.length);
  order.forEach(({ i }, j) => {
    const m = j % modules;
    counts[m]++;
    out[i] = { ...land[i], module: m, rank: 0, noise: rng.next() };
  });
  // Rank within module: the order its pixels clear.
  const seen = new Array(modules).fill(0);
  for (const { i } of order) {
    const p = out[i];
    p.rank = seen[p.module]++ / counts[p.module];
  }
  return out;
}

/** Is this pixel restored, given its module's restoration share 0–1? */
export const isRestored = (p: Pixel, share: number) => p.rank < share;
