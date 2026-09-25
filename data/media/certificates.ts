import { skillStatus } from "@/lib/media/skill";
import type { Person, SkillRating } from "./types";

export interface Certificate {
  /** Index into person.skills — the URL segment. */
  n: number;
  id: string;
  skill: SkillRating;
}

/**
 * A certificate per community-verified skill. No exam, no fee: five or more
 * verified people rated the work within half a star of the claim. The ID
 * lets anyone look it up.
 */
export function certificatesFor(p: Person): Certificate[] {
  return p.skills.flatMap((skill, n) =>
    skillStatus(skill.self, skill.communityAvg, skill.raters) === "verified"
      ? [{ n, skill, id: `SM-${p.handle.toUpperCase()}-${String(n + 1).padStart(2, "0")}` }]
      : [],
  );
}
