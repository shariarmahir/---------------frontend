/**
 * The scientific lab's experiment: baseline vs. one intervention, paired on
 * the same seeds (so events and true effects match), many trials. Results
 * describe the GAME MODEL only — the model is not validated against the
 * real world.
 */

import { band, scenarioOf, simulate, trialSeeds, type Band } from "./engine.ts";
import type { Plan, SimConfig } from "./types.ts";

export interface Experiment {
  intervention: string;
  scale: "pilot" | "full";
  variable: string;
  direction: "up" | "down";
  trials: number;
}

export interface ExperimentResult {
  baseline: Band;
  treated: Band;
  diff: Band;
  verdict: "supported" | "refuted" | "inconclusive";
  /** Mean per turn, for the chart; `lo`/`hi` are the 10th/90th percentiles. */
  series: { turn: number; base: number; baseLo: number; baseHi: number; treat: number; treatLo: number; treatHi: number }[];
  launchOk: boolean;
}

export function runExperiment(config: SimConfig, e: Experiment): ExperimentResult {
  const sc = scenarioOf(config.scenario);
  if (!sc.variables.some((v) => v.id === e.variable)) throw new Error("unknown variable");
  const treatedPlan: Plan = [[{ type: "launch", id: e.intervention, scale: e.scale }]];
  const seeds = trialSeeds(config.seed, e.trials);
  const pairs = seeds.map((seed) => ({ b: simulate({ ...config, seed }, []), t: simulate({ ...config, seed }, treatedPlan) }));
  const launchOk = pairs.every((p) => p.t.turns[0]?.actions[0]?.ok);
  const end = (r: (typeof pairs)[number]["b"]) => r.turns.at(-1)?.vars[e.variable] ?? r.start.vars[e.variable];
  const baseline = band(pairs.map((p) => end(p.b)));
  const treated = band(pairs.map((p) => end(p.t)));
  const diff = band(pairs.map((p) => end(p.t) - end(p.b)));
  const sign = e.direction === "up" ? 1 : -1;
  const lo = Math.min(sign * diff.p10, sign * diff.p90);
  const hi = Math.max(sign * diff.p10, sign * diff.p90);
  const verdict = lo > 0 ? "supported" : hi < 0 ? "refuted" : "inconclusive";
  const series = Array.from({ length: config.horizon + 1 }, (_, t) => {
    const at = (r: (typeof pairs)[number]["b"]) => (t === 0 ? r.start.vars[e.variable] : r.turns[t - 1].vars[e.variable]);
    const b = band(pairs.map((p) => at(p.b)));
    const tr = band(pairs.map((p) => at(p.t)));
    return { turn: t, base: b.mean, baseLo: b.p10, baseHi: b.p90, treat: tr.mean, treatLo: tr.p10, treatHi: tr.p90 };
  });
  return { baseline, treated, diff, verdict, series, launchOk };
}
