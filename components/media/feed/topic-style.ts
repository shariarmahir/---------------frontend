import { BadgeCheck, FlaskConical, GraduationCap, LifeBuoy, Megaphone, PartyPopper, Smile, Sparkles, UsersRound, type LucideIcon } from "lucide-react";
import type { PostTopic } from "@/data/media/types";

/** One icon per kind of post, shared by the composer, the feed filter and the post card. */
export const TOPIC_ICON: Record<PostTopic, LucideIcon> = {
  daily: Smile,
  talent: Sparkles,
  skill: BadgeCheck,
  education: GraduationCap,
  research: FlaskConical,
  team: UsersRound,
  entertainment: PartyPopper,
  help: LifeBuoy,
  rights: Megaphone,
};
