/**
 * Server-side replay of a run: the authoritative score for a (config, plan)
 * pair, and a stable run key so XP is never counted twice.
 */

import { digest, stableStringify } from "../rng.ts";
import { simulate } from "./engine.ts";
import { scoreRun, type StrategyId } from "./score.ts";
import { ENGINE_VERSION, RULESET_VERSION, type Plan, type SimConfig } from "./types.ts";

/** Trailing empty turns don't change a run, so they don't change its key. */
export function trimPlan(plan: Plan): Plan {
  const p = plan.map((t) => t ?? []);
  while (p.length && p[p.length - 1].length === 0) p.pop();
  return p;
}

export function runKeyOf(config: SimConfig, plan: Plan): string {
  return digest(stableStringify({ engine: ENGINE_VERSION, ruleset: RULESET_VERSION, config, plan: trimPlan(plan) }));
}

export interface Verified {
  runKey: string;
  total: number;
  finalIndex: number;
  startIndex: number;
  complete: boolean;
  engine: string;
  ruleset: string;
}

export function verifyRun(config: SimConfig, plan: Plan, strategy: StrategyId): Verified {
  const run = simulate(config, plan);
  return {
    runKey: runKeyOf(config, plan),
    total: scoreRun(run, strategy).total,
    finalIndex: run.turns.at(-1)?.outcomeIndex ?? run.start.outcomeIndex,
    startIndex: run.start.outcomeIndex,
    complete: run.turns.length === config.horizon,
    engine: ENGINE_VERSION,
    ruleset: RULESET_VERSION,
  };
}
