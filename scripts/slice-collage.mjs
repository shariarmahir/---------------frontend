#!/usr/bin/env node
/**
 * Collage slicer for the Kandari Lab hero.
 *
 * Detects the gold (#E4B027) border lines in the collage photograph and
 * crops the tiles out of it. Writes each tile as WebP plus a manifest the
 * scene reads at runtime.
 *
 * Usage:
 *   node scripts/slice-collage.mjs [source] [outputDir]
 *
 * Defaults: public/hero/CREATEDhero.jpg -> public/hero/tiles
 * Requires: sharp (npm i -D sharp)
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_PATH = process.argv[2] ?? 'public/hero/CREATEDhero.jpg';
const OUTPUT_DIR = process.argv[3] ?? 'public/hero/tiles';
const MANIFEST_PATH = path.join(OUTPUT_DIR, '..', 'tiles.json');

/** The gold border colour, and how far a pixel may stray from it. */
const GOLD_R = 0xe4;
const GOLD_G = 0xb0;
const GOLD_B = 0x27;
const COLOR_TOLERANCE = 40;

/** How much of a row or column must be gold before it counts as a border. */
const LINE_COVERAGE = 0.12;

/** The approximate tile rectangles, used to name the tiles and as the
 *  fallback when a border cannot be snapped. */
const APPROX_TILES = [
  { id: 'dhaka-alley', x: 0, y: 0, w: 272, h: 338, group: 'rural' },
  { id: 'deer-field', x: 272, y: 0, w: 341, h: 180, group: 'rural' },
  { id: 'woman-winnowing', x: 272, y: 180, w: 341, h: 158, group: 'rural' },
  { id: 'time-cover', x: 613, y: 0, w: 219, h: 338, group: 'archive' },
  { id: 'bw-crowd-top', x: 833, y: 0, w: 317, h: 192, group: 'archive' },
  { id: 'fist-protester', x: 1150, y: 0, w: 153, h: 192, group: 'archive' },
  { id: 'swadhinota-march', x: 1303, y: 0, w: 207, h: 195, group: 'archive' },
  { id: 'flag-crowd-large', x: 1512, y: 0, w: 313, h: 484, group: 'archive' },
  { id: 'tea-garden', x: 1825, y: 0, w: 327, h: 212, group: 'rural' },
  { id: 'rickshaw-rain', x: 2152, y: 0, w: 420, h: 212, group: 'rural' },
  { id: 'bw-doorway', x: 833, y: 195, w: 113, h: 143, group: 'archive' },
  { id: 'bol-bir-poster', x: 946, y: 195, w: 140, h: 135, group: 'archive' },
  { id: 'fist-man', x: 946, y: 330, w: 140, h: 154, group: 'archive' },
  { id: 'mural-girl', x: 1086, y: 195, w: 217, h: 289, group: 'youth' },
  { id: 'flags-crowd', x: 1303, y: 195, w: 207, h: 185, group: 'youth' },
  { id: 'mother-child-flag', x: 1303, y: 380, w: 207, h: 104, group: 'youth' },
  { id: 'carriers-road', x: 1827, y: 212, w: 403, h: 272, group: 'rural' },
  { id: 'honey-collector', x: 2232, y: 212, w: 340, h: 272, group: 'rural' },
  { id: 'lily-boat-girl', x: 0, y: 340, w: 440, h: 378, group: 'rural' },
  { id: 'flood-women', x: 440, y: 340, w: 506, h: 378, group: 'rural' },
  { id: 'bridge-carriers', x: 946, y: 487, w: 419, h: 231, group: 'rural' },
  { id: 'ox-cart', x: 1365, y: 487, w: 620, h: 231, group: 'rural' },
  { id: 'hill-houses', x: 1985, y: 487, w: 587, h: 231, group: 'rural' },
];

function isGold(r, g, b) {
  return (
    Math.abs(r - GOLD_R) <= COLOR_TOLERANCE &&
    Math.abs(g - GOLD_G) <= COLOR_TOLERANCE &&
    Math.abs(b - GOLD_B) <= COLOR_TOLERANCE
  );
}

/** Group neighbouring indices into clusters, then take each cluster's mean. */
function cluster(values, maxGap = 5) {
  const clusters = [];
  let current = [];
  for (const value of values) {
    if (current.length === 0 || value - current[current.length - 1] <= maxGap) {
      current.push(value);
    } else {
      clusters.push(current);
      current = [value];
    }
  }
  if (current.length > 0) clusters.push(current);
  return clusters.map((c) => Math.round(c.reduce((a, b) => a + b, 0) / c.length));
}

/** The rows and columns that are mostly gold. */
async function detectBorderLines(image) {
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const stride = width * channels;

  const horizontal = [];
  for (let y = 0; y < height; y++) {
    let gold = 0;
    for (let x = 0; x < width; x++) {
      const i = y * stride + x * channels;
      if (isGold(data[i], data[i + 1], data[i + 2])) gold++;
    }
    if (gold > width * LINE_COVERAGE) horizontal.push(y);
  }

  const vertical = [];
  for (let x = 0; x < width; x++) {
    let gold = 0;
    for (let y = 0; y < height; y++) {
      const i = y * stride + x * channels;
      if (isGold(data[i], data[i + 1], data[i + 2])) gold++;
    }
    if (gold > height * LINE_COVERAGE) vertical.push(x);
  }

  return { horizontal: cluster(horizontal), vertical: cluster(vertical) };
}

/** A per-pixel gold map, so the edge search can look at one tile at a time. */
async function goldMap(image) {
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const stride = width * channels;
  const map = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * stride + x * channels;
      map[y * width + x] = isGold(data[i], data[i + 1], data[i + 2]) ? 1 : 0;
    }
  }

  return { map, width, height };
}

/**
 * Find the gold border that marks one edge of one tile.
 *
 * The collage's borders are short segments, not full-width rules, so a
 * global scan cannot separate them from gold in the photographs. Instead
 * each edge is searched in a small window, counting only the gold inside
 * that tile's own span. The edge with the most gold wins, and it is only
 * accepted if enough of it is actually gold.
 */
function findEdge(gold, axis, at, from, to, window = 20) {
  const { map, width, height } = gold;
  const span = Math.abs(to - from);
  if (span < 8) return null;

  const candidates = [];
  for (let offset = -window; offset <= window; offset++) {
    const line = at + offset;
    if (line < 0 || line >= (axis === 'x' ? width : height)) continue;

    let hits = 0;
    if (axis === 'x') {
      // A vertical border: count gold down the rows the tile spans.
      const rowStart = Math.min(from, to);
      const rowEnd = Math.max(from, to);
      for (let y = rowStart; y < rowEnd; y++) {
        if (map[y * width + line]) hits++;
      }
    } else {
      // A horizontal border: count gold across the columns the tile spans.
      const colStart = Math.min(from, to);
      const colEnd = Math.max(from, to);
      for (let x = colStart; x < colEnd; x++) {
        if (map[line * width + x]) hits++;
      }
    }
    candidates.push({ line, hits });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.hits - a.hits);
  const best = candidates[0];

  // The border has to be mostly gold across the tile's own span, or the
  // tile has no border here and the approximation is better.
  if (best.hits / span < 0.55) return null;
  return best.line;
}

/** Pull a rectangle's edges onto the detected borders. */
function snap(rect, gold) {
  const left = findEdge(gold, 'x', rect.x, rect.y, rect.y + rect.h);
  const right = findEdge(gold, 'x', rect.x + rect.w, rect.y, rect.y + rect.h);
  const top = findEdge(gold, 'y', rect.y, rect.x, rect.x + rect.w);
  const bottom = findEdge(gold, 'y', rect.y + rect.h, rect.x, rect.x + rect.w);

  const snapped = {
    x: left ?? rect.x,
    y: top ?? rect.y,
    w: left !== null && right !== null ? right - left : rect.w,
    h: top !== null && bottom !== null ? bottom - top : rect.h,
  };

  // Crop inside the border so no gold pixels survive on the tile edge.
  const inset = 2;
  return {
    x: Math.max(0, snapped.x + inset),
    y: Math.max(0, snapped.y + inset),
    w: Math.max(1, snapped.w - inset * 2),
    h: Math.max(1, snapped.h - inset * 2),
    snapped:
      left !== null && right !== null && top !== null && bottom !== null,
  };
}

async function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`x Source image not found: ${SOURCE_PATH}`);
    console.error('  Put CREATEDhero.jpg in public/hero/ first.');
    process.exit(1);
  }

  console.log('Loading source image...');
  const image = sharp(SOURCE_PATH);
  const metadata = await image.metadata();
  console.log(`  ${metadata.width} x ${metadata.height}`);

  console.log('Detecting the gold border grid...');
  const { horizontal, vertical } = await detectBorderLines(image.clone());
  console.log(`  ${horizontal.length} horizontal, ${vertical.length} vertical borders`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest = [];
  const unclean = [];

  for (const approx of APPROX_TILES) {
    const rect = snap(approx, horizontal, vertical);
    if (!rect.snapped) unclean.push(approx.id);

    const out = path.join(OUTPUT_DIR, `${approx.id}.webp`);
    await image
      .clone()
      .extract({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
      .webp({ quality: 85, effort: 6 })
      .toFile(out);

    manifest.push({
      id: approx.id,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      group: approx.group,
    });

    console.log(
      `  ${approx.id.padEnd(20)} ${String(rect.w).padStart(4)} x ${String(rect.h).padStart(4)}  ${approx.group}${rect.snapped ? '' : '  (approximate)'}`,
    );
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${manifest.length} tiles to ${OUTPUT_DIR}`);
  console.log(`Wrote the manifest to ${MANIFEST_PATH}`);

  if (unclean.length > 0) {
    console.log(
      `\nTiled by the approximate rectangle, no clean border found: ${unclean.join(', ')}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
