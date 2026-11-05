/** Which colour reads on the film behind the hero's letters: navy wherever it can, gold where the film is dark. */
export type Tone = "navy" | "gold";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/** The light level where navy #0B1849 and gold #E4B027 read equally, at about 3:1. Above it navy reads better. */
export const NAVY_FROM = 0.133;

/** The size of the map of the film's light that the melt reads. */
export const LIGHT_COLS = 64;
export const LIGHT_ROWS = 36;

/** How many seconds the settled light takes to go most of the way to the film's: the colours' slow change. */
const SETTLE_SECONDS = 1.6;

const linear = (channel: number) => {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const luminance = (rgba: ArrayLike<number>, i: number) => 0.2126 * linear(rgba[i]) + 0.7152 * linear(rgba[i + 1]) + 0.0722 * linear(rgba[i + 2]);

/** The share of RGBA pixels on which navy reads better than gold, with `light` of their light reaching the eye. */
export function navyShare(rgba: ArrayLike<number>, light = 1) {
  let navy = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if (luminance(rgba, i) * light >= NAVY_FROM) navy++;
  }
  return rgba.length ? navy / (rgba.length / 4) : 0;
}

/** A gap between the two thresholds keeps a word from flickering while the film hovers near one. */
export const nextTone = (current: Tone, share: number): Tone => (share > (current === "gold" ? 0.55 : 0.45) ? "navy" : "gold");

/** Where a box on screen falls on a small copy of a film drawn with object-fit: cover. */
export function filmRegion(word: Box, film: Box, source: Size, copy: Size): Box {
  const scale = Math.max(film.width / source.width, film.height / source.height);
  const shownLeft = film.left + (film.width - source.width * scale) / 2;
  const shownTop = film.top + (film.height - source.height * scale) / 2;
  const toCopy = copy.width / (source.width * scale);
  const left = Math.min(copy.width - 1, Math.max(0, Math.floor((word.left - shownLeft) * toCopy)));
  const top = Math.min(copy.height - 1, Math.max(0, Math.floor((word.top - shownTop) * toCopy)));
  return {
    left,
    top,
    width: Math.max(1, Math.min(copy.width - left, Math.ceil(word.width * toCopy))),
    height: Math.max(1, Math.min(copy.height - top, Math.ceil(word.height * toCopy))),
  };
}

/** The film's light as a soft map, each cell averaged with its neighbours so no colour change has a hard edge. */
export function lightMap(rgba: ArrayLike<number>, cols = LIGHT_COLS, rows = LIGHT_ROWS) {
  const raw = new Float32Array(cols * rows);
  for (let i = 0; i < raw.length; i++) raw[i] = luminance(rgba, i * 4);
  const soft = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            sum += raw[ny * cols + nx];
            count++;
          }
        }
      }
      soft[y * cols + x] = sum / count;
    }
  }
  return soft;
}

/** Moves the settled light towards the film's, and writes it for the shader as the square root in bytes. */
export function settleLight(settled: Float32Array, target: Float32Array, seconds: number, bytes: Uint8Array) {
  const step = 1 - Math.exp(-seconds / SETTLE_SECONDS);
  for (let i = 0; i < settled.length; i++) {
    settled[i] += (target[i] - settled[i]) * step;
    bytes[i] = Math.sqrt(settled[i]) * 255;
  }
}
