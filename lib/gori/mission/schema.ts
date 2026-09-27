/**
 * Input schemas for the mission (server replay). The engine re-checks every
 * action's legality, so these only bound shapes and sizes.
 */

import { z } from "zod";
import { DIFFICULTIES, POLICIES, ROLES } from "../../../data/gori/mission.ts";

const node = z.number().int().min(1).max(32);
const pillar = z.enum(["people", "economy", "state", "nature"]);

export const missionConfigSchema = z.object({
  seed: z.string().min(1).max(40),
  difficulty: z.enum(Object.keys(DIFFICULTIES) as [keyof typeof DIFFICULTIES, ...(keyof typeof DIFFICULTIES)[]]),
  seats: z
    .array(z.object({ name: z.string().min(1).max(40), role: z.enum(ROLES.map((r) => r.id) as [string, ...string[]]), bot: z.boolean() }))
    .min(2)
    .max(4),
});

export const missionActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("drive"), to: node }),
  z.object({ type: z.literal("flight"), to: node }),
  z.object({ type: z.literal("charter"), to: node }),
  z.object({ type: z.literal("shuttle"), to: node }),
  z.object({ type: z.literal("treat") }),
  z.object({ type: z.literal("hub"), remove: node.optional() }),
  z.object({ type: z.literal("share"), with: z.number().int().min(0).max(3), n: node, dir: z.enum(["give", "take"]) }),
  z.object({ type: z.literal("reform"), pillar, cards: z.array(node).max(4) }),
  z.object({ type: z.literal("summon"), player: z.number().int().min(0).max(3), to: node }),
  z.object({ type: z.literal("peek"), bury: z.number().int().min(0).max(2).optional() }),
  z.object({
    type: z.literal("policy"),
    id: z.enum(POLICIES.map((p) => p.id) as [string, ...string[]]),
    n: node.optional(),
    targets: z.array(node).max(2).optional(),
    order: z.array(node).max(6).optional(),
    player: z.number().int().min(0).max(3).optional(),
    to: node.optional(),
  }),
  z.object({ type: z.literal("discard"), index: z.number().int().min(0).max(12) }),
  z.object({ type: z.literal("end") }),
]);

export const missionRunSchema = z.object({
  config: missionConfigSchema,
  actions: z.array(missionActionSchema).max(4000),
});
