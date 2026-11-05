/**
 * A skill's standing, from the owner's self-rating against the community's.
 *
 *  - verified:   enough raters (≥5) and the community lands within half a
 *                star of the owner's claim (or above it)
 *  - challenged: enough raters (≥3) rate it 1.5+ stars below the claim
 *  - rated:      rated, but neither rule applies yet
 *  - unrated:    nobody has rated it
 */
export type SkillStatus = "unrated" | "rated" | "verified" | "challenged";

export const VERIFY_MIN_RATERS = 5;
export const VERIFY_TOLERANCE = 0.5;
export const CHALLENGE_MIN_RATERS = 3;
export const CHALLENGE_GAP = 1.5;

export function skillStatus(self: number, communityAvg: number, count: number): SkillStatus {
  if (count <= 0) return "unrated";
  const gap = self - communityAvg;
  if (count >= CHALLENGE_MIN_RATERS && gap >= CHALLENGE_GAP) return "challenged";
  // Small epsilon so 4 − 3.5 compares as exactly 0.5 despite float error.
  if (count >= VERIFY_MIN_RATERS && gap <= VERIFY_TOLERANCE + 1e-9) return "verified";
  return "rated";
}
