import { Dumbbell, FlaskConical, Gamepad2, Plane, Rocket, UsersRound, type LucideIcon } from "lucide-react";
import type { TeamKind } from "@/data/media/types";

/** One icon per kind of team, used on badges, rooms and the story strip. */
export const KIND_ICON: Record<TeamKind, LucideIcon> = { family: UsersRound, lab: FlaskConical, project: Rocket, travel: Plane, sports: Dumbbell, esports: Gamepad2 };
