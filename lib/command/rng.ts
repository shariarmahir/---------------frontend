/** Small seeded generator so a simulated world replays the same way. */
export interface Rng { next(): number }

export function mulberry32(state: number): { next(): number; state(): number } {
  let s = state >>> 0;
  return {
    next(): number {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state(): number {
      return s;
    },
  };
}

export function pick<T>(r: Rng, items: readonly T[]): T {
  return items[Math.floor(r.next() * items.length)];
}

export function weighted<T>(r: Rng, items: readonly { item: T; weight: number }[]): T {
  let total = 0;
  for (const i of items) total += i.weight;
  let x = r.next() * total;
  for (const i of items) {
    x -= i.weight;
    if (x < 0) return i.item;
  }
  return items[items.length - 1].item;
}

/** Exponential gap with the given mean, never below 1.5 seconds. */
export function expGap(r: Rng, meanMs: number): number {
  const u = Math.max(r.next(), 1e-9);
  return Math.max(1500, Math.round(-Math.log(u) * meanMs));
}
