"use client";

import type { Post } from "@/data/media/types";
import { useMediaState } from "@/lib/media/store";
import { RatingPair } from "../ui/trust";

/** Community side of a post's rating including the viewer's own vote. */
export function useLiveSkill(postId: string, skill: Post["skill"]) {
  const mine = useMediaState((s) => s.ratings[postId]);
  if (!mine) return { ...skill, mine: undefined };
  const raters = skill.raters + 1;
  const communityAvg = (skill.communityAvg * skill.raters + mine.stars) / raters;
  return { ...skill, raters, communityAvg, mine };
}

export function LiveRatingPair({ postId, skill }: { postId: string; skill: Post["skill"] }) {
  const live = useLiveSkill(postId, skill);
  return <RatingPair self={live.self} communityAvg={live.communityAvg} raters={live.raters} animate />;
}
