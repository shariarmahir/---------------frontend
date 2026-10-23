/**
 * A small deterministic PRNG.
 *
 * The point cloud and the per-tile jitter are generated at render time, so
 * they have to be pure — `Math.random()` is not, and it would also make
 * the scene impossible to reproduce frame for frame when exporting video.
 * mulberry32 is a 32-bit seed generator: fast, and good enough for
 * scattering points.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable seed per tile id, so a tile always jitters the same way. */
export function seedFromString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
