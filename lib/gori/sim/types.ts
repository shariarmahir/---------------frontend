/**
 * Types and input schemas for the simulation engine.
 *
 * A run is fully described by (scenario id, ruleset version, config, plan):
 * the engine is pure, so the same inputs always give the same outputs.
 * Numbers inside a scenario are GAME COEFFICIENTS — tuning values for play,
 * not measured national figures.
 */

import { z } from "zod";

export const RULESET_VERSION = "1.0.0";
export const ENGINE_VERSION = "1.0.0";

export type Confidence = "high" | "medium" | "low";
/** "dossier": restates a mechanism the national dossier describes. "assumption": a game assumption. */
export type Basis = "dossier" | "assumption";
export type Level = "low" | "mid" | "high";

export interface VariableDef {
  id: string;
  bn: string;
  en: string;
  kind: "outcome" | "capacity" | "pressure";
  /** Which direction is better for people. */
  good: "up" | "down";
  /** Starting value before the context shifts it, 0–100. */
  base: number;
  /** Share of the gap to its target closed per quarter. */
  speed: number;
  description: string;
}

export interface CausalEdge {
  id: string;
  from: string;
  to: string;
  sign: 1 | -1;
  /** Target shift in `to` per point `from` sits above its baseline. */
  weight: number;
  /** Quarters before a change in `from` reaches `to`. */
  delay: number;
  confidence: Confidence;
  basis: Basis;
  evidenceRef?: string;
  reversible: boolean;
  note: string;
  /** Scaled by this assumption's chosen value. */
  assumption?: string;
  /** Hidden at the start of the campaign's mind-map puzzle. */
  puzzle?: boolean;
}

export interface AssumptionDef {
  id: string;
  bn: string;
  en: string;
  description: string;
  values: Record<Level, number>;
  optionBn: Record<Level, string>;
  basis: Basis;
  evidenceRef?: string;
}

export interface StakeholderDef {
  id: string;
  bn: string;
  en: string;
  base: number;
  /** Support drift per point of change in these variables (use negative for "bad when it rises"). */
  cares: Record<string, number>;
  description: string;
}

export type Branch = "capacity" | "data" | "finance" | "infra";

export interface InterventionDef {
  id: string;
  bn: string;
  en: string;
  branch: Branch;
  summary: string;
  goal: string;
  target: string;
  /** Stakeholder ids who carry it out; their support moves its efficiency. */
  actors: string[];
  /** Up-front cost at full scale, budget points. */
  cost: number;
  /** Per-quarter running cost at full scale. */
  upkeep: number;
  workforce: number;
  /** Quarters before any effect. */
  delay: number;
  /** Quarters from first effect to full effect. */
  ramp: number;
  effects: { v: string; amount: number; range: [number, number] }[];
  /** Extra effect when another intervention is also running. */
  interactions?: { with: string; v: string; amount: number; note: string }[];
  requires?: { interventions?: string[]; vars?: { v: string; min: number }[]; note: string };
  /** Support change when launched. */
  reactions?: Record<string, number>;
  assumption?: string;
  /** Counts as a measurement / evidence intervention in scoring. */
  measurement?: boolean;
  risks: string[];
  equity: string;
  maintenance: string;
  measurementPlan: string;
  fallback: string;
  /** Conflict-of-interest or sponsorship label, shown wherever it appears. */
  disclosure?: string;
  evidenceRefs: string[];
  basis: Basis;
}

export type EventTrigger =
  | { kind: "random"; p: number; seasons?: number[] }
  | { kind: "threshold"; v: string; below?: number; above?: number; forTurns: number }
  | { kind: "scheduled"; turn: number };

export interface EventDef {
  id: string;
  bn: string;
  en: string;
  source: "fictional" | "context";
  evidenceRef?: string;
  trigger: EventTrigger;
  shocks: Record<string, number>;
  mitigatedBy: { intervention: string; factor: number }[];
  explanation: string;
  response?: { id: string; bn: string; cost: number; effect: Record<string, number>; note: string };
  /** Turns before it can fire again. */
  cooldown: number;
}

export const CONTEXTS = ["rural", "char", "haor", "hill", "coastal", "urban"] as const;
export type ContextId = (typeof CONTEXTS)[number];

export interface ContextDef {
  id: ContextId;
  bn: string;
  en: string;
  description: string;
  varShift: Record<string, number>;
  eventMult: Record<string, number>;
  interventionMult: Record<string, number>;
}

export interface ScenarioDef {
  id: string;
  module: string;
  bn: string;
  en: string;
  place: string;
  brief: string;
  variables: VariableDef[];
  edges: CausalEdge[];
  assumptions: AssumptionDef[];
  stakeholders: StakeholderDef[];
  interventions: InterventionDef[];
  events: EventDef[];
  contexts: ContextDef[];
  /** Weights of the scenario's outcome index; `invert` for "lower is better". */
  outcomeIndex: { v: string; weight: number; invert?: boolean }[];
  budget: Record<Level, { start: number; income: number }>;
  workforce: Record<Level, number>;
}

/* ------------------------------------------------------------------ *
 * Inputs — validated wherever they cross a trust boundary
 * ------------------------------------------------------------------ */

export const MODES = ["campaign", "sandbox", "lab", "crisis", "future"] as const;
export type Mode = (typeof MODES)[number];

const level = z.enum(["low", "mid", "high"]);

export const configSchema = z.object({
  scenario: z.literal("health-access"),
  ruleset: z.literal(RULESET_VERSION),
  mode: z.enum(MODES),
  context: z.enum(CONTEXTS),
  budget: level,
  workforce: level,
  horizon: z.number().int().min(4).max(24),
  turnMonths: z.union([z.literal(3), z.literal(12)]),
  startYear: z.number().int().min(2026).max(2030),
  difficulty: z.enum(["easy", "normal", "hard"]),
  events: z.enum(["off", "low", "normal", "high"]),
  stakeholders: z.enum(["simple", "full"]),
  evidence: level,
  maintenance: level,
  seed: z.string().regex(/^[a-z0-9-]{3,24}$/),
  assumptions: z.record(z.string().max(40), level),
});
export type SimConfig = z.infer<typeof configSchema>;

export const FUNDING_LEVELS = [0.5, 0.75, 1, 1.25, 1.5] as const;

export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("launch"), id: z.string().max(40), scale: z.enum(["pilot", "full"]) }),
  z.object({ type: z.literal("scale"), id: z.string().max(40) }),
  z.object({ type: z.literal("stop"), id: z.string().max(40) }),
  z.object({
    type: z.literal("fund"),
    id: z.string().max(40),
    level: z.number().refine((v) => (FUNDING_LEVELS as readonly number[]).includes(v), "অনুমোদিত অর্থায়ন-মাত্রা নয়"),
  }),
  z.object({ type: z.literal("respond"), event: z.string().max(40) }),
]);
export type Action = z.infer<typeof actionSchema>;

/** Actions taken at the start of each turn; plan[t] applies before turn t runs. */
export const planSchema = z.array(z.array(actionSchema).max(24)).max(24);
export type Plan = z.infer<typeof planSchema>;

/* ------------------------------------------------------------------ *
 * Outputs
 * ------------------------------------------------------------------ */

export interface Contribution {
  kind: "intervention" | "edge" | "reversion" | "event" | "response" | "clamp";
  ref: string;
  amount: number;
}

export interface ActiveIntervention {
  id: string;
  scale: "pilot" | "full";
  launchedAt: number;
  scaledAt?: number;
  piloted: boolean;
  funding: number;
  /** 0–1: how well it is being kept up. */
  maintenance: number;
  /** Fixed uncertainty draw per affected variable. */
  draws: Record<string, number>;
  /** Turns left of a weak-rollout penalty. */
  rolloutPenalty: number;
}

export interface FiredEvent {
  id: string;
  turn: number;
  shocks: Record<string, number>;
  mitigation: number;
  mitigatedBy: string[];
  trigger: string;
}

export interface ActionResult {
  action: Action;
  ok: boolean;
  reason?: string;
  cost: number;
}

export interface TurnRecord {
  turn: number;
  /** Values at the END of the turn. */
  vars: Record<string, number>;
  delta: Record<string, number>;
  contributions: Record<string, Contribution[]>;
  budgetStart: number;
  budgetEnd: number;
  income: number;
  upfront: number;
  upkeepDue: number;
  upkeepPaid: number;
  workforceDemand: number;
  workforceCoverage: number;
  stakeholders: Record<string, number>;
  active: ActiveIntervention[];
  actions: ActionResult[];
  events: FiredEvent[];
  outcomeIndex: number;
}

export interface RunResult {
  config: SimConfig;
  plan: Plan;
  start: { vars: Record<string, number>; stakeholders: Record<string, number>; budget: number; outcomeIndex: number };
  turns: TurnRecord[];
  engine: string;
  ruleset: string;
}
