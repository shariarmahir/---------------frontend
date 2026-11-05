/**
 * “আপনি হয়তো চেনেন”: who to suggest, and why. Shared skills count most,
 * then the same district, then the same field; popularity only breaks ties,
 * so a famous stranger never outranks a neighbour. Pure, tested in
 * suggest.test.ts.
 */

export interface Candidate {
  handle: string;
  district: string;
  categories: string[];
  skills: string[];
  followers: number;
}

export type Reason = { kind: "skill" | "district" | "category" | "popular"; value: string };

/** handle → the handles they follow. */
export type FollowGraph = Record<string, readonly string[]>;

export function followersOf(handle: string, graph: FollowGraph): string[] {
  return Object.keys(graph).filter((h) => h !== handle && graph[h].includes(handle));
}

/** People the viewer follows who also follow `target` — the mutual line. */
export function mutualsOf(target: string, following: Iterable<string>, graph: FollowGraph): string[] {
  return [...following].filter((h) => h !== target && graph[h]?.includes(target));
}

export function suggestPeople(
  viewer: Candidate,
  pool: Candidate[],
  { following, dismissed, exclude = [], mutuals }: { following: Set<string>; dismissed: Set<string>; exclude?: string[]; mutuals?: (handle: string) => number },
): { handle: string; score: number; reason: Reason }[] {
  const skip = new Set([viewer.handle, ...exclude]);
  return pool
    .filter((p) => !skip.has(p.handle) && !following.has(p.handle) && !dismissed.has(p.handle))
    .map((p) => {
      const skills = p.skills.filter((s) => viewer.skills.includes(s));
      const fields = p.categories.filter((c) => viewer.categories.includes(c));
      const near = p.district === viewer.district;
      // Friends of friends count like a shared skill, capped so a crowd can't drown the rest.
      const shared = Math.min(mutuals?.(p.handle) ?? 0, 3);
      const score = 5 * Math.min(skills.length, 2) + 4 * shared + 3 * fields.length + (near ? 4 : 0) + Math.log10(p.followers + 1) / 2;
      const reason: Reason = skills.length
        ? { kind: "skill", value: skills[0] }
        : near
          ? { kind: "district", value: p.district }
          : fields.length
            ? { kind: "category", value: fields[0] }
            : { kind: "popular", value: "" };
      return { handle: p.handle, score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * A fixed shuffle per seed (Fisher–Yates on a small PRNG), so a row deeper
 * in the feed shows other faces, and server and browser agree on the order.
 * Seed 0 keeps the ranking.
 */
export function shuffled<T>(list: T[], seed: number): T[] {
  const out = [...list];
  if (seed === 0) return out;
  let h = seed >>> 0;
  const rand = () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
