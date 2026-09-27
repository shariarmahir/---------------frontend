/**
 * The simulation engine — pure and seeded.
 *
 * Model (all numbers are game coefficients, see the scenario file):
 *   target(v) = base(v) + Σ intervention levels on v + Σ edges sign·w·(from − base(from))
 *   v(t+1)    = v(t) + α·(target(v) − v(t)) + event shocks + one-off responses
 * so every change splits exactly into named contributions (interventions,
 * causal edges, reversion toward the old state, events), which is what the
 * results screen explains.
 *
 * Randomness uses separate streams keyed by the seed — one per intervention
 * (its true effect) and one per turn (events) — so two strategies on the
 * same seed face the same weather and the same true effects. That makes
 * comparisons fair ("common random numbers").
 */

import { healthAccess } from "../../../data/gori/scenarios/health-access.ts";
import { createRng } from "../rng.ts";
import {
  ENGINE_VERSION,
  RULESET_VERSION,
  type Action,
  type ActionResult,
  type ActiveIntervention,
  type Contribution,
  type EventDef,
  type FiredEvent,
  type InterventionDef,
  type Level,
  type Mode,
  type Plan,
  type RunResult,
  type ScenarioDef,
  type SimConfig,
  type TurnRecord,
} from "./types.ts";

export const scenarios: Record<string, ScenarioDef> = { [healthAccess.id]: healthAccess };

export function scenarioOf(id: string): ScenarioDef {
  const s = scenarios[id];
  if (!s) throw new Error(`Unknown scenario ${id}`);
  return s;
}

/* ------------------------------------------------------------------ *
 * Rule constants — documented in the ADR and shown in the rules panel
 * ------------------------------------------------------------------ */

export const RULES = {
  pilotCostShare: 0.4,
  pilotEffectShare: 0.35,
  pilotWorkforceShare: 0.5,
  scaleCostShare: 0.65,
  rolloutRisk: { low: 0.4, mid: 0.3, high: 0.2 } as Record<Level, number>,
  rolloutPenaltyTurns: 2,
  rolloutEfficiency: 0.7,
  maintenanceMult: { low: 0.5, mid: 1, high: 1.6 } as Record<Level, number>,
  wear: 0.04,
  recovery: 0.06,
  shortfallLoss: 0.5,
  eventIntensity: { off: 0, low: 0.5, normal: 1, high: 1.6 } as Record<SimConfig["events"], number>,
  difficultyBudget: { easy: 1.25, normal: 1, hard: 0.8 } as Record<SimConfig["difficulty"], number>,
  difficultyEvents: { easy: 0.75, normal: 1, hard: 1.3 } as Record<SimConfig["difficulty"], number>,
  evidenceShift: { low: -6, mid: 0, high: 6 } as Record<Level, number>,
  simpleSupport: 60,
  mitigationCap: 0.9,
  /** Oct–Dec of the start year is turn 0. Quarters: 0 Jan–Mar, 1 Apr–Jun, 2 Jul–Sep (monsoon), 3 Oct–Dec. */
  startQuarter: 3,
} as const;

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const r2 = (v: number) => Math.round(v * 100) / 100;

/* ------------------------------------------------------------------ *
 * Configs and presets
 * ------------------------------------------------------------------ */

export function defaultConfig(overrides: Partial<SimConfig> = {}): SimConfig {
  return {
    scenario: "health-access",
    ruleset: RULESET_VERSION,
    mode: "campaign",
    context: "rural",
    budget: "mid",
    workforce: "mid",
    horizon: 8,
    turnMonths: 3,
    startYear: 2026,
    difficulty: "normal",
    events: "normal",
    stakeholders: "full",
    evidence: "mid",
    maintenance: "mid",
    seed: "bd-2026",
    assumptions: {},
    ...overrides,
  };
}

/** Starting configuration for each game mode. */
export function presetFor(mode: Mode, seed: string): SimConfig {
  switch (mode) {
    case "crisis":
      return defaultConfig({ mode, seed, horizon: 4, budget: "low", context: "char", events: "high", difficulty: "hard" });
    case "future":
      return defaultConfig({ mode, seed, turnMonths: 12, horizon: 9, startYear: 2027 });
    default:
      return defaultConfig({ mode, seed });
  }
}

/** Events a mode forces on a fixed turn (crisis mode: the flood arrives in turn 2). */
export function scheduledEvents(config: SimConfig): { id: string; turn: number }[] {
  return config.mode === "crisis" ? [{ id: "flood", turn: 1 }] : [];
}

export const timeScale = (c: SimConfig) => c.turnMonths / 3;
const alphaOf = (speed: number, ts: number) => 1 - Math.pow(1 - speed, ts);
const turnsOf = (quarters: number, ts: number) => Math.ceil(quarters / ts);

export function quarterOf(c: SimConfig, turn: number): number {
  return (RULES.startQuarter + turn * timeScale(c)) % 4;
}

/** Calendar label for a turn: the year and, for quarterly turns, the quarter. */
export function periodOf(c: SimConfig, turn: number): { year: number; quarter: number | null } {
  if (c.turnMonths === 12) return { year: c.startYear + turn, quarter: null };
  const q = RULES.startQuarter + turn;
  return { year: c.startYear + Math.floor(q / 4), quarter: q % 4 };
}

export function assumptionValue(sc: ScenarioDef, c: SimConfig, id: string | undefined): number {
  if (!id) return 1;
  const a = sc.assumptions.find((x) => x.id === id);
  if (!a) return 1;
  return a.values[c.assumptions[id] ?? "mid"];
}

export function startingVars(sc: ScenarioDef, c: SimConfig): Record<string, number> {
  const ctx = sc.contexts.find((x) => x.id === c.context);
  const out: Record<string, number> = {};
  for (const v of sc.variables) {
    let x = v.base + (ctx?.varShift[v.id] ?? 0);
    if (v.id === "data") x += RULES.evidenceShift[c.evidence];
    if (c.mode === "crisis" && v.id === "meds") x -= 10;
    out[v.id] = clamp(x);
  }
  return out;
}

export function outcomeIndexOf(sc: ScenarioDef, vars: Record<string, number>): number {
  const total = sc.outcomeIndex.reduce((s, o) => s + o.weight, 0);
  const sum = sc.outcomeIndex.reduce((s, o) => s + o.weight * (o.invert ? 100 - vars[o.v] : vars[o.v]), 0);
  return r2(sum / total);
}

/** Effect range after the evidence-availability setting widens or narrows it. */
export function effectRange(c: SimConfig, range: [number, number]): [number, number] {
  const [lo, hi] = range;
  if (c.evidence === "low") return [Math.max(0.1, lo - 0.15), hi + 0.15];
  if (c.evidence === "high") return [1 - (1 - lo) * 0.5, 1 + (hi - 1) * 0.5];
  return [lo, hi];
}

export function eventProbability(sc: ScenarioDef, c: SimConfig, ev: EventDef, turn: number): number {
  if (ev.trigger.kind !== "random") return 0;
  const ctx = sc.contexts.find((x) => x.id === c.context);
  const base = ev.trigger.p * RULES.eventIntensity[c.events] * RULES.difficultyEvents[c.difficulty] * (ctx?.eventMult[ev.id] ?? 1);
  const seasonal = ev.trigger.seasons !== undefined;
  let p: number;
  if (c.turnMonths === 12) p = seasonal ? base : 1 - Math.pow(1 - Math.min(base, 0.95), 4);
  else p = !seasonal || ev.trigger.seasons!.includes(quarterOf(c, turn)) ? base : 0;
  return Math.min(0.95, Math.max(0, p));
}

/* ------------------------------------------------------------------ *
 * State between turns
 * ------------------------------------------------------------------ */

export interface TurnStart {
  turn: number;
  vars: Record<string, number>;
  budget: number;
  stakeholders: Record<string, number>;
  active: ActiveIntervention[];
  /** Events from last turn that still accept a one-off response. */
  responses: { event: string; bn: string; cost: number; note: string }[];
}

export function stateAt(run: RunResult, turn: number): TurnStart {
  const sc = scenarioOf(run.config.scenario);
  const prev = turn > 0 ? run.turns[turn - 1] : undefined;
  const responses = (prev?.events ?? [])
    .map((e) => sc.events.find((d) => d.id === e.id))
    .filter((d): d is EventDef => !!d?.response)
    .map((d) => ({ event: d.id, bn: d.response!.bn, cost: d.response!.cost, note: d.response!.note }));
  return {
    turn,
    vars: prev ? prev.vars : run.start.vars,
    budget: prev ? prev.budgetEnd : run.start.budget,
    stakeholders: prev ? prev.stakeholders : run.start.stakeholders,
    active: prev ? prev.active : [],
    responses,
  };
}

/** Why an intervention cannot be launched right now, or null if it can. */
export function launchBlock(
  sc: ScenarioDef,
  state: Pick<TurnStart, "vars" | "budget" | "active">,
  id: string,
  scale: "pilot" | "full",
): string | null {
  const def = sc.interventions.find((i) => i.id === id);
  if (!def) return "অজানা হস্তক্ষেপ।";
  if (state.active.some((a) => a.id === id)) return "ইতিমধ্যে চলছে।";
  const missing = (def.requires?.interventions ?? []).filter((r) => !state.active.some((a) => a.id === r));
  if (missing.length) return def.requires!.note;
  const low = (def.requires?.vars ?? []).filter((r) => state.vars[r.v] < r.min);
  if (low.length) return def.requires!.note;
  const cost = def.cost * (scale === "pilot" ? RULES.pilotCostShare : 1);
  if (state.budget < cost) return `বাজেট কম — লাগবে ${Math.ceil(cost)}, আছে ${Math.floor(state.budget)}।`;
  return null;
}

/**
 * What this turn's draft actions would cost and whether each is allowed —
 * the same checks `simulate` applies, without running the turn (so no
 * event or effect is revealed before the player commits).
 */
export function previewDraft(sc: ScenarioDef, state: TurnStart, draft: Action[]): { results: ActionResult[]; budget: number; active: ActiveIntervention[] } {
  let budget = state.budget;
  const active = state.active.map((a) => ({ ...a }));
  const responded = new Set<string>();
  const results = draft.map<ActionResult>((a) => {
    const fail = (reason: string): ActionResult => ({ action: a, ok: false, reason, cost: 0 });
    if (a.type === "launch") {
      const block = launchBlock(sc, { vars: state.vars, budget, active }, a.id, a.scale);
      if (block) return fail(block);
      const cost = r2(sc.interventions.find((i) => i.id === a.id)!.cost * (a.scale === "pilot" ? RULES.pilotCostShare : 1));
      budget = r2(budget - cost);
      active.push({ id: a.id, scale: a.scale, launchedAt: state.turn, piloted: a.scale === "pilot", funding: 1, maintenance: 1, draws: {}, rolloutPenalty: 0 });
      return { action: a, ok: true, cost };
    }
    const i = active.findIndex((x) => x.id === ("id" in a ? a.id : ""));
    if (a.type === "scale") {
      if (i < 0) return fail("চালু নেই।");
      if (active[i].scale === "full") return fail("ইতিমধ্যে পূর্ণ পরিসরে।");
      const cost = r2(sc.interventions.find((x) => x.id === a.id)!.cost * RULES.scaleCostShare);
      if (budget < cost) return fail(`বাজেট কম — লাগবে ${Math.ceil(cost)}।`);
      budget = r2(budget - cost);
      active[i] = { ...active[i], scale: "full" };
      return { action: a, ok: true, cost };
    }
    if (a.type === "stop") {
      if (i < 0) return fail("চালু নেই।");
      active.splice(i, 1);
      return { action: a, ok: true, cost: 0 };
    }
    if (a.type === "fund") {
      if (i < 0) return fail("চালু নেই।");
      active[i] = { ...active[i], funding: a.level };
      return { action: a, ok: true, cost: 0 };
    }
    const r = state.responses.find((x) => x.event === a.event);
    if (!r) return fail("এই ঘটনায় এখন সাড়া দেওয়ার সুযোগ নেই।");
    if (responded.has(a.event)) return fail("ইতিমধ্যে সাড়া দেওয়া হয়েছে।");
    if (budget < r.cost) return fail(`বাজেট কম — লাগবে ${r.cost}।`);
    budget = r2(budget - r.cost);
    responded.add(a.event);
    return { action: a, ok: true, cost: r.cost };
  });
  return { results, budget, active };
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

export function simulate(config: SimConfig, plan: Plan, opts: { turns?: number } = {}): RunResult {
  const sc = scenarioOf(config.scenario);
  const ctx = sc.contexts.find((x) => x.id === config.context);
  const ts = timeScale(config);
  const vars0 = startingVars(sc, config);
  const base = { ...vars0 };
  const alpha = Object.fromEntries(sc.variables.map((v) => [v.id, alphaOf(v.speed, ts)]));
  const full = config.stakeholders === "full";
  const maintMult = RULES.maintenanceMult[config.maintenance];
  const budgetMult = RULES.difficultyBudget[config.difficulty];
  const income = r2(sc.budget[config.budget].income * budgetMult * ts);
  const W = sc.workforce[config.workforce];
  const horizon = Math.min(opts.turns ?? config.horizon, config.horizon);
  const forced = scheduledEvents(config);

  let vars = { ...vars0 };
  let budget = r2(sc.budget[config.budget].start * budgetMult);
  let stakeholders: Record<string, number> = Object.fromEntries(sc.stakeholders.map((s) => [s.id, full ? s.base : RULES.simpleSupport]));
  const active = new Map<string, ActiveIntervention>();
  const history: Record<string, number>[] = [{ ...vars0 }];
  const counters: Record<string, number> = {};
  const cooldownUntil: Record<string, number> = {};
  const turns: TurnRecord[] = [];
  const start = { vars: { ...vars0 }, stakeholders: { ...stakeholders }, budget, outcomeIndex: outcomeIndexOf(sc, vars0) };

  const defOf = (id: string) => sc.interventions.find((i) => i.id === id) as InterventionDef;

  for (let t = 0; t < horizon; t++) {
    const budgetStart = budget;
    const results: ActionResult[] = [];
    let upfront = 0;
    const responseEffects: Record<string, { ref: string; amount: number }[]> = {};
    const prevEvents = t > 0 ? turns[t - 1].events : [];
    const responded = new Set<string>();

    // 1. Actions, in the order given.
    for (const action of plan[t] ?? []) {
      const res = applyAction(action);
      results.push(res);
      upfront += res.cost;
    }

    function applyAction(a: Action): ActionResult {
      const fail = (reason: string): ActionResult => ({ action: a, ok: false, reason, cost: 0 });
      if (a.type === "launch") {
        const def = sc.interventions.find((i) => i.id === a.id);
        if (!def) return fail("অজানা হস্তক্ষেপ।");
        const block = launchBlock(sc, { vars, budget, active: [...active.values()] }, a.id, a.scale);
        if (block) return fail(block);
        const cost = r2(def.cost * (a.scale === "pilot" ? RULES.pilotCostShare : 1));
        budget = r2(budget - cost);
        const rng = createRng(`${config.seed}:int:${def.id}`);
        const draws: Record<string, number> = {};
        for (const e of def.effects) {
          const [lo, hi] = effectRange(config, e.range);
          draws[e.v] = r2(rng.range(lo, hi));
        }
        let rolloutPenalty = 0;
        if (a.scale === "full" && createRng(`${config.seed}:rollout:${def.id}:${t}`).chance(RULES.rolloutRisk[config.evidence])) {
          rolloutPenalty = RULES.rolloutPenaltyTurns;
        }
        active.set(def.id, { id: def.id, scale: a.scale, launchedAt: t, piloted: a.scale === "pilot", funding: 1, maintenance: 1, draws, rolloutPenalty });
        if (full) {
          for (const [s, d] of Object.entries(def.reactions ?? {})) {
            stakeholders[s] = clamp(stakeholders[s] + d * (a.scale === "pilot" ? 0.5 : 1));
          }
        }
        return { action: a, ok: true, cost };
      }
      if (a.type === "scale") {
        const cur = active.get(a.id);
        if (!cur) return fail("চালু নেই।");
        if (cur.scale === "full") return fail("ইতিমধ্যে পূর্ণ পরিসরে।");
        const def = defOf(a.id);
        const cost = r2(def.cost * RULES.scaleCostShare);
        if (budget < cost) return fail(`বাজেট কম — লাগবে ${Math.ceil(cost)}।`);
        budget = r2(budget - cost);
        active.set(a.id, { ...cur, scale: "full", scaledAt: t });
        if (full) for (const [s, d] of Object.entries(def.reactions ?? {})) stakeholders[s] = clamp(stakeholders[s] + d * 0.5);
        return { action: a, ok: true, cost };
      }
      if (a.type === "stop") {
        if (!active.has(a.id)) return fail("চালু নেই।");
        active.delete(a.id);
        return { action: a, ok: true, cost: 0 };
      }
      if (a.type === "fund") {
        const cur = active.get(a.id);
        if (!cur) return fail("চালু নেই।");
        active.set(a.id, { ...cur, funding: a.level });
        return { action: a, ok: true, cost: 0 };
      }
      // respond
      const fired = prevEvents.find((e) => e.id === a.event);
      const def = sc.events.find((e) => e.id === a.event);
      if (!fired || !def?.response) return fail("এই ঘটনায় এখন সাড়া দেওয়ার সুযোগ নেই।");
      if (responded.has(a.event)) return fail("ইতিমধ্যে সাড়া দেওয়া হয়েছে।");
      if (budget < def.response.cost) return fail(`বাজেট কম — লাগবে ${def.response.cost}।`);
      budget = r2(budget - def.response.cost);
      responded.add(a.event);
      for (const [v, amount] of Object.entries(def.response.effect)) {
        (responseEffects[v] ??= []).push({ ref: `${def.id}:${def.response.id}`, amount });
      }
      return { action: a, ok: true, cost: def.response.cost };
    }

    // 2. Income and upkeep.
    budget = r2(budget + income);
    const scaleCost = (a: ActiveIntervention) => (a.scale === "pilot" ? RULES.pilotCostShare : 1);
    const upkeepDue = r2([...active.values()].reduce((s, a) => s + defOf(a.id).upkeep * scaleCost(a) * a.funding * ts, 0));
    const upkeepPaid = r2(Math.min(Math.max(budget, 0), upkeepDue));
    budget = r2(budget - upkeepPaid);
    const paidShare = upkeepDue > 0 ? upkeepPaid / upkeepDue : 1;

    // 3. Maintenance.
    for (const a of active.values()) {
      const wear = (RULES.wear * maintMult * ts) / a.funding;
      const gain = paidShare >= 0.999 ? RULES.recovery * ts * a.funding : 0;
      const shortfall = (1 - paidShare) * RULES.shortfallLoss * maintMult * ts;
      a.maintenance = r2(clamp01(a.maintenance + gain - wear - shortfall));
    }

    // 4. Workforce.
    const demand = r2([...active.values()].reduce((s, a) => s + defOf(a.id).workforce * (a.scale === "pilot" ? RULES.pilotWorkforceShare : 1), 0));
    const coverage = demand > W ? W / demand : 1;

    // 5. Intervention levels.
    const levels: Record<string, { ref: string; amount: number }[]> = {};
    const ramped: Record<string, number> = {};
    for (const a of active.values()) {
      const def = defOf(a.id);
      const age = t - a.launchedAt;
      const d = turnsOf(def.delay, ts);
      const rampT = Math.max(1, turnsOf(def.ramp, ts));
      ramped[a.id] = age < d ? 0 : Math.min(1, (age - d + 1) / rampT);
    }
    for (const a of active.values()) {
      const def = defOf(a.id);
      const r = ramped[a.id];
      if (r === 0) continue;
      const support = def.actors.length ? def.actors.reduce((s, id) => s + (stakeholders[id] ?? 50), 0) / def.actors.length : 60;
      const eff =
        coverage *
        (0.6 + (0.4 * support) / 100) *
        a.maintenance *
        (a.rolloutPenalty > 0 ? RULES.rolloutEfficiency : 1) *
        (ctx?.interventionMult[def.id] ?? 1);
      const scaleEff = a.scale === "pilot" ? RULES.pilotEffectShare : 1;
      const k = scaleEff * Math.sqrt(a.funding) * eff * r * assumptionValue(sc, config, def.assumption);
      for (const e of def.effects) (levels[e.v] ??= []).push({ ref: def.id, amount: e.amount * a.draws[e.v] * k });
      for (const x of def.interactions ?? []) {
        if ((ramped[x.with] ?? 0) > 0) (levels[x.v] ??= []).push({ ref: `${def.id}+${x.with}`, amount: x.amount * scaleEff * eff * r });
      }
    }

    // 6. Dynamics.
    const next: Record<string, number> = {};
    const contributions: Record<string, Contribution[]> = {};
    for (const v of sc.variables) {
      const a = alpha[v.id];
      const cs: Contribution[] = [];
      for (const l of levels[v.id] ?? []) cs.push({ kind: "intervention", ref: l.ref, amount: a * l.amount });
      for (const e of sc.edges) {
        if (e.to !== v.id) continue;
        const lag = turnsOf(e.delay, ts);
        const past = history[Math.max(0, t - lag)];
        const dev = past[e.from] - base[e.from];
        if (dev === 0) continue;
        cs.push({ kind: "edge", ref: e.id, amount: a * e.sign * e.weight * assumptionValue(sc, config, e.assumption) * dev });
      }
      const drift = vars[v.id] - base[v.id];
      if (drift !== 0) cs.push({ kind: "reversion", ref: v.id, amount: -a * drift });
      for (const r of responseEffects[v.id] ?? []) cs.push({ kind: "response", ref: r.ref, amount: r.amount });
      next[v.id] = vars[v.id] + cs.reduce((s, c) => s + c.amount, 0);
      contributions[v.id] = cs;
    }

    // 7. Events — one draw per event per turn, always taken, so the stream never shifts.
    const rng = createRng(`${config.seed}:events:${t}`);
    const fired: FiredEvent[] = [];
    for (const ev of sc.events) {
      const draw = rng.next();
      if ((cooldownUntil[ev.id] ?? -1) >= t) {
        if (ev.trigger.kind === "threshold") counters[ev.id] = 0;
        continue;
      }
      let fires = false;
      let trigger = "";
      if (ev.trigger.kind === "random") {
        const p = eventProbability(sc, config, ev, t);
        fires = draw < p;
        trigger = `সম্ভাবনা ${Math.round(p * 100)}%`;
      } else if (ev.trigger.kind === "threshold") {
        const x = next[ev.trigger.v];
        const breach = (ev.trigger.below !== undefined && x < ev.trigger.below) || (ev.trigger.above !== undefined && x > ev.trigger.above);
        counters[ev.id] = breach ? (counters[ev.id] ?? 0) + 1 : 0;
        fires = counters[ev.id] >= turnsOf(ev.trigger.forTurns, ts);
        trigger = "সীমা পার";
      } else {
        fires = ev.trigger.turn === t;
        trigger = "নির্ধারিত";
      }
      if (!fires && forced.some((f) => f.id === ev.id && f.turn === t)) {
        fires = true;
        trigger = "সংকট মোডে নির্ধারিত";
      }
      if (!fires || config.events === "off") continue;

      const by = ev.mitigatedBy.filter((m) => active.has(m.intervention) && (ramped[m.intervention] ?? 0) > 0);
      const mitigation = Math.min(
        RULES.mitigationCap,
        by.reduce((s, m) => {
          const a = active.get(m.intervention)!;
          return s + m.factor * a.maintenance * (a.scale === "pilot" ? 0.5 : 1);
        }, 0),
      );
      const shocks: Record<string, number> = {};
      for (const [v, amt] of Object.entries(ev.shocks)) {
        const hit = amt * (1 - mitigation);
        shocks[v] = r2(hit);
        next[v] += hit;
        contributions[v].push({ kind: "event", ref: ev.id, amount: hit });
      }
      fired.push({ id: ev.id, turn: t, shocks, mitigation: r2(mitigation), mitigatedBy: by.map((m) => m.intervention), trigger });
      cooldownUntil[ev.id] = t + turnsOf(ev.cooldown, ts);
      if (ev.trigger.kind === "threshold") counters[ev.id] = 0;
    }

    // 8. Clamp, record.
    const delta: Record<string, number> = {};
    for (const v of sc.variables) {
      const raw = next[v.id];
      const c = clamp(raw);
      if (c !== raw) contributions[v.id].push({ kind: "clamp", ref: v.id, amount: c - raw });
      delta[v.id] = r2(c - vars[v.id]);
      next[v.id] = r2(c);
      contributions[v.id] = contributions[v.id].map((x) => ({ ...x, amount: r2(x.amount) }));
    }

    // 9. Stakeholders drift with what they care about.
    if (full) {
      stakeholders = { ...stakeholders };
      for (const s of sc.stakeholders) {
        const d = Object.entries(s.cares).reduce((sum, [v, w]) => sum + w * (delta[v] ?? 0), 0);
        stakeholders[s.id] = r2(clamp(stakeholders[s.id] + d));
      }
    }

    for (const a of active.values()) if (a.rolloutPenalty > 0) a.rolloutPenalty -= 1;

    vars = next;
    history.push({ ...vars });
    turns.push({
      turn: t,
      vars: { ...vars },
      delta,
      contributions,
      budgetStart,
      budgetEnd: budget,
      income,
      upfront: r2(upfront),
      upkeepDue,
      upkeepPaid,
      workforceDemand: demand,
      workforceCoverage: r2(coverage),
      stakeholders: { ...stakeholders },
      active: [...active.values()].map((a) => ({ ...a, draws: { ...a.draws } })),
      actions: results,
      events: fired,
      outcomeIndex: outcomeIndexOf(sc, vars),
    });
  }

  return { config, plan, start, turns, engine: ENGINE_VERSION, ruleset: RULESET_VERSION };
}

/* ------------------------------------------------------------------ *
 * Many seeds — the scientific lab and the uncertainty bands
 * ------------------------------------------------------------------ */

export function trialSeeds(seed: string, n: number): string[] {
  return Array.from({ length: n }, (_, k) => `${seed}-t${k + 1}`.slice(0, 24));
}

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export interface Band {
  mean: number;
  p10: number;
  p50: number;
  p90: number;
}

export function band(values: number[]): Band {
  const s = [...values].sort((a, b) => a - b);
  return {
    mean: r2(values.reduce((a, b) => a + b, 0) / values.length),
    p10: r2(quantile(s, 0.1)),
    p50: r2(quantile(s, 0.5)),
    p90: r2(quantile(s, 0.9)),
  };
}

/** The same plan across `n` seeds: bands for every variable at the end of `turn`. */
export function bandsAt(config: SimConfig, plan: Plan, turn: number, n = 24): Record<string, Band> {
  const sc = scenarioOf(config.scenario);
  const runs = trialSeeds(config.seed, n).map((seed) => simulate({ ...config, seed }, plan, { turns: turn + 1 }));
  const out: Record<string, Band> = {};
  for (const v of sc.variables) out[v.id] = band(runs.map((r) => r.turns[turn]?.vars[v.id] ?? r.start.vars[v.id]));
  out.__index = band(runs.map((r) => r.turns[turn]?.outcomeIndex ?? r.start.outcomeIndex));
  return out;
}
