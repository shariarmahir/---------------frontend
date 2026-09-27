/**
 * Explainability (Prompt V3 §9.5): turns a run's contribution trace into
 * the results screen's sections — changed values, costs, benefits, side
 * effects, assumptions, uncertainty, dependencies, maintenance and next
 * questions — and diagnoses what to learn from a weak result (§5.3).
 */

import { assumptionValue, launchBlock, scenarioOf, simulate, stateAt } from "./engine.ts";
import type { Contribution, Plan, RunResult, ScenarioDef, SimConfig } from "./types.ts";

const r1 = (v: number) => Math.round(v * 10) / 10;
/** Bangla digits for sentences shown to players and sent to the AI. */
export const bnDigits = (v: number | string) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const signed = (v: number) => bnDigits(`${v > 0 ? "+" : ""}${r1(v)}`);

export function contributionLabel(sc: ScenarioDef, c: Contribution): string {
  switch (c.kind) {
    case "intervention": {
      if (c.ref.includes("+")) {
        const [a, b] = c.ref.split("+");
        return `${sc.interventions.find((i) => i.id === a)?.bn} + ${sc.interventions.find((i) => i.id === b)?.bn} একসাথে`;
      }
      return sc.interventions.find((i) => i.id === c.ref)?.bn ?? c.ref;
    }
    case "edge": {
      const e = sc.edges.find((x) => x.id === c.ref);
      const from = sc.variables.find((v) => v.id === e?.from)?.bn;
      return `${from}-এর প্রভাব`;
    }
    case "reversion":
      return "পুরোনো অবস্থার দিকে ফেরার টান";
    case "event":
      return sc.events.find((e) => e.id === c.ref)?.bn ?? c.ref;
    case "response": {
      const [ev] = c.ref.split(":");
      return sc.events.find((e) => e.id === ev)?.response?.bn ?? c.ref;
    }
    case "clamp":
      return "০–১০০ সীমা";
  }
}

export interface ChangeExplanation {
  v: string;
  bn: string;
  from: number;
  to: number;
  delta: number;
  good: boolean | null;
  parts: { label: string; amount: number; kind: Contribution["kind"]; confidence?: string; basis?: string; assumption?: string; ref: string }[];
  sentence: string;
}

export function explainChange(run: RunResult, turn: number, v: string): ChangeExplanation {
  const sc = scenarioOf(run.config.scenario);
  const t = run.turns[turn];
  const def = sc.variables.find((x) => x.id === v)!;
  const to = t.vars[v];
  const from = r1(to - t.delta[v]);
  const parts = t.contributions[v]
    .filter((c) => Math.abs(c.amount) >= 0.05)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .map((c) => {
      const edge = c.kind === "edge" ? sc.edges.find((e) => e.id === c.ref) : undefined;
      const intv = c.kind === "intervention" ? sc.interventions.find((i) => i.id === c.ref.split("+")[0]) : undefined;
      return {
        label: contributionLabel(sc, c),
        amount: c.amount,
        kind: c.kind,
        confidence: edge?.confidence,
        basis: edge?.basis ?? intv?.basis,
        assumption: edge?.assumption ?? intv?.assumption,
        ref: c.ref,
      };
    });
  const d = t.delta[v];
  const good = d === 0 ? null : (def.good === "up") === d > 0;
  const top = parts.slice(0, 2).map((p) => `${p.label} (${signed(p.amount)})`);
  const assumptions = [...new Set(parts.map((p) => p.assumption).filter(Boolean))].map((id) => sc.assumptions.find((a) => a.id === id)!.bn);
  const sentence =
    d === 0
      ? `${def.bn} বদলায়নি।`
      : `${def.bn} ${signed(d)} হলো, মূলত ${top.join(" আর ")}-এর কারণে।${assumptions.length ? ` এই ফল “${assumptions.join("”, “")}” অনুমানের ওপর নির্ভর করে।` : ""}`;
  return { v, bn: def.bn, from, to, delta: d, good, parts, sentence };
}

export interface TurnReport {
  changes: ChangeExplanation[];
  costs: { upfront: number; upkeepPaid: number; upkeepDue: number; income: number; budgetEnd: number };
  benefits: { label: string; v: string; amount: number }[];
  sideEffects: { label: string; v: string; amount: number; note?: string }[];
  assumptions: { id: string; bn: string; choice: string; value: number; basis: string }[];
  uncertainty: { level: "low" | "medium" | "high"; reason: string };
  dependencies: { id: string; bn: string; note: string }[];
  maintenance: { id: string; bn: string; maintenance: number; note: string }[];
  events: { id: string; bn: string; source: string; explanation: string; shocks: Record<string, number>; mitigation: number; mitigatedBy: string[]; trigger: string }[];
  questions: string[];
}

export function turnReport(run: RunResult, turn: number): TurnReport {
  const sc = scenarioOf(run.config.scenario);
  const t = run.turns[turn];
  const changes = sc.variables.map((v) => explainChange(run, turn, v.id)).filter((c) => c.delta !== 0);
  const good = (v: string, amount: number) => (sc.variables.find((x) => x.id === v)!.good === "up") === amount > 0;

  const benefits: TurnReport["benefits"] = [];
  const sideEffects: TurnReport["sideEffects"] = [];
  for (const v of sc.variables) {
    for (const c of t.contributions[v.id]) {
      if (Math.abs(c.amount) < 0.3) continue;
      if (c.kind === "intervention") {
        (good(v.id, c.amount) ? benefits : sideEffects).push({ label: `${contributionLabel(sc, c)} → ${v.bn}`, v: v.id, amount: c.amount });
      } else if (c.kind === "edge" && !good(v.id, c.amount)) {
        const e = sc.edges.find((x) => x.id === c.ref)!;
        // A harmful knock-on effect is a side effect when the thing driving it is above its baseline because of the plan.
        if (e.sign < 0 && t.vars[e.from] > run.start.vars[e.from]) sideEffects.push({ label: `${contributionLabel(sc, c)} → ${v.bn}`, v: v.id, amount: c.amount, note: e.note });
      }
    }
  }

  const usedAssumptions = new Set<string>();
  for (const v of sc.variables) {
    for (const c of t.contributions[v.id]) {
      const e = c.kind === "edge" ? sc.edges.find((x) => x.id === c.ref) : undefined;
      const i = c.kind === "intervention" ? sc.interventions.find((x) => x.id === c.ref.split("+")[0]) : undefined;
      const a = e?.assumption ?? i?.assumption;
      if (a && Math.abs(c.amount) >= 0.05) usedAssumptions.add(a);
    }
  }
  const assumptions = [...usedAssumptions].map((id) => {
    const a = sc.assumptions.find((x) => x.id === id)!;
    const choice = run.config.assumptions[id] ?? "mid";
    return { id, bn: a.bn, choice: a.optionBn[choice], value: assumptionValue(sc, run.config, id), basis: a.basis };
  });

  // Uncertainty: how much of this turn's movement rests on low-confidence links and assumptions.
  let total = 0;
  let shaky = 0;
  for (const v of sc.variables) {
    for (const c of t.contributions[v.id]) {
      if (c.kind === "reversion" || c.kind === "clamp") continue;
      const amt = Math.abs(c.amount);
      total += amt;
      const e = c.kind === "edge" ? sc.edges.find((x) => x.id === c.ref) : undefined;
      const i = c.kind === "intervention" ? sc.interventions.find((x) => x.id === c.ref.split("+")[0]) : undefined;
      if (e?.confidence === "low" || e?.basis === "assumption" || i?.basis === "assumption" || c.kind === "event") shaky += amt;
    }
  }
  const share = total ? shaky / total : 0;
  const evidenceLow = run.config.evidence === "low";
  const level: TurnReport["uncertainty"]["level"] = share > 0.6 || evidenceLow ? "high" : share > 0.3 ? "medium" : "low";
  const uncertainty = {
    level,
    reason: `এই প্রান্তিকের পরিবর্তনের ${bnDigits(Math.round(share * 100))}% এসেছে খেলার অনুমান, কম-আস্থার সম্পর্ক বা এলোমেলো ঘটনা থেকে${evidenceLow ? "; তার ওপর প্রমাণের প্রাপ্যতা ‘কম’ বাছাই করা" : ""}।`,
  };

  const next = stateAt(run, turn + 1 <= run.turns.length ? turn + 1 : turn);
  const dependencies = sc.interventions
    .filter((i) => i.requires && !next.active.some((a) => a.id === i.id))
    .map((i) => ({ id: i.id, bn: i.bn, note: launchBlock(sc, next, i.id, "pilot") ?? "শর্ত পূরণ হয়েছে — এখন চালু করা যায়।" }));

  const maintenance = t.active
    .filter((a) => a.maintenance < 0.85)
    .map((a) => ({ id: a.id, bn: sc.interventions.find((i) => i.id === a.id)!.bn, maintenance: a.maintenance, note: sc.interventions.find((i) => i.id === a.id)!.maintenance }));

  const events = t.events.map((e) => {
    const d = sc.events.find((x) => x.id === e.id)!;
    return { id: e.id, bn: d.bn, source: d.source, explanation: d.explanation, shocks: e.shocks, mitigation: e.mitigation, mitigatedBy: e.mitigatedBy, trigger: e.trigger };
  });

  const questions: string[] = [];
  const v = t.vars;
  if (v.access < 45) questions.push("পরিবার কেন আসছে না — খরচ, দূরত্ব, না আস্থা? কোনটা আগে মাপবেন?");
  if (v.data < 40) questions.push("কে বাদ পড়ছে তা না জানলে কাকে লক্ষ্য করবেন? তথ্যের মান বাড়ানোর সবচেয়ে সস্তা পথ কী?");
  if (t.workforceCoverage < 1) questions.push("কর্মী কম — কোন হস্তক্ষেপ থামালে বা পাইলটে রাখলে বাকিগুলো ঠিকমতো চলবে?");
  if (t.upkeepPaid < t.upkeepDue) questions.push("চলমান খরচ মেটেনি — কোনটার অর্থায়ন কমাবেন, না বন্ধ করবেন?");
  if (sideEffects.length) questions.push("পার্শ্বপ্রতিক্রিয়া দেখা দিয়েছে — কোন হস্তক্ষেপ দিয়ে তা ভারসাম্যে আনা যায়?");
  if (t.active.some((a) => a.scale === "pilot" && t.turn - a.launchedAt >= 2)) questions.push("পাইলটের ফল দেখা গেছে — বড় করবেন, বদলাবেন, না থামাবেন?");
  if (!questions.length) questions.push("কোন অনুমান ভুল হলে এই সাফল্য টিকবে না? বিজ্ঞানাগারে পরীক্ষা করে দেখুন।");

  return {
    changes,
    costs: { upfront: t.upfront, upkeepPaid: t.upkeepPaid, upkeepDue: t.upkeepDue, income: t.income, budgetEnd: t.budgetEnd },
    benefits: benefits.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    sideEffects: sideEffects.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    assumptions,
    uncertainty,
    dependencies,
    maintenance,
    events,
    questions: questions.slice(0, 4),
  };
}

/* ------------------------------------------------------------------ *
 * Failure as information
 * ------------------------------------------------------------------ */

export interface Diagnosis {
  kind: "assumption" | "dependency" | "stakeholder" | "resource" | "risk" | "alternative";
  bn: string;
  detail: string;
}

export function diagnose(run: RunResult): Diagnosis[] {
  const sc = scenarioOf(run.config.scenario);
  const out: Diagnosis[] = [];
  const endIndex = (r: RunResult) => r.turns.at(-1)?.outcomeIndex ?? r.start.outcomeIndex;
  const base = endIndex(run);

  // Which assumption is this plan most sensitive to?
  let best: { bn: string; spread: number } | null = null;
  for (const a of sc.assumptions) {
    const lo = endIndex(simulate({ ...run.config, assumptions: { ...run.config.assumptions, [a.id]: "low" } }, run.plan));
    const hi = endIndex(simulate({ ...run.config, assumptions: { ...run.config.assumptions, [a.id]: "high" } }, run.plan));
    const spread = Math.abs(hi - lo);
    if (!best || spread > best.spread) best = { bn: a.bn, spread };
  }
  if (best && best.spread >= 0.5) {
    out.push({ kind: "assumption", bn: "কোন অনুমানের ওপর সবচেয়ে নির্ভর", detail: `“${best.bn}” কম থেকে বেশি হলে আপনার শেষ সূচক ${bnDigits(r1(best.spread))} পয়েন্ট বদলায়। বাস্তবে আগে এটাই মাপুন।` });
  }

  const rejected = run.turns.flatMap((t) => t.actions.filter((a) => !a.ok && a.action.type === "launch"));
  if (rejected.length) {
    const r = rejected[0];
    const name = sc.interventions.find((i) => i.id === (r.action as { id: string }).id)?.bn;
    out.push({ kind: "dependency", bn: "কোন নির্ভরতা কম ধরা হয়েছিল", detail: `${name}: ${r.reason}` });
  }

  const last = run.turns.at(-1);
  if (last && run.config.stakeholders === "full") {
    const [id, v] = Object.entries(last.stakeholders).sort((a, b) => a[1] - b[1])[0];
    if (v < 50) {
      const s = sc.stakeholders.find((x) => x.id === id)!;
      out.push({ kind: "stakeholder", bn: "কোন অংশীজন বাদ পড়েছেন", detail: `${s.bn}-এর সমর্থন ${bnDigits(Math.round(v))}-এ নেমেছে। ${s.description}` });
    }
  }

  const short = run.turns.filter((t) => t.upkeepPaid < t.upkeepDue - 0.01).length;
  const thin = run.turns.filter((t) => t.workforceCoverage < 1).length;
  if (short || thin) {
    out.push({
      kind: "resource",
      bn: "কোন সম্পদ যথেষ্ট ছিল না",
      detail: [short ? `${bnDigits(short)}টি প্রান্তিকে চলমান খরচ পুরো মেটেনি` : "", thin ? `${bnDigits(thin)}টি প্রান্তিকে কর্মী কম ছিল` : ""].filter(Boolean).join("; ") + "।",
    });
  }

  const unmitigated = run.turns.flatMap((t) => t.events).filter((e) => e.mitigation === 0 && Object.values(e.shocks).some((s) => s < -4));
  if (unmitigated.length) {
    const e = sc.events.find((x) => x.id === unmitigated[0].id)!;
    const guard = e.mitigatedBy.map((m) => sc.interventions.find((i) => i.id === m.intervention)?.bn).filter(Boolean);
    out.push({ kind: "risk", bn: "কোন ঝুঁকি উপেক্ষিত ছিল", detail: `${e.bn} কোনো প্রস্তুতি ছাড়াই আঘাত করেছে।${guard.length ? ` ${guard.join(" বা ")} আগে থাকলে ধাক্কা কম হতো।` : ""}` });
  }

  // The single untried intervention that would have helped most, piloted in turn 1.
  const tried = new Set(run.turns.flatMap((t) => t.actions.filter((a) => a.ok && a.action.type === "launch").map((a) => (a.action as { id: string }).id)));
  let alt: { bn: string; gain: number } | null = null;
  for (const i of sc.interventions) {
    if (tried.has(i.id)) continue;
    const plan: Plan = run.plan.map((p) => [...p]);
    plan[0] = [...(plan[0] ?? []), { type: "launch", id: i.id, scale: "pilot" }];
    const r = simulate(run.config, plan);
    if (!r.turns[0].actions.at(-1)?.ok) continue;
    const gain = endIndex(r) - base;
    if (!alt || gain > alt.gain) alt = { bn: i.bn, gain };
  }
  if (alt && alt.gain > 0.3) {
    out.push({ kind: "alternative", bn: "কোন বিকল্প পরীক্ষা করা যায়", detail: `একই বীজে প্রথম প্রান্তিকে “${alt.bn}” পাইলট যোগ করলে শেষ সূচক আনুমানিক +${bnDigits(r1(alt.gain))} হতো — খেলার মডেলে।` });
  }
  return out;
}

/** One-line description of a config for saved-run lists. */
export function configSummary(sc: ScenarioDef, c: SimConfig): string {
  const ctx = sc.contexts.find((x) => x.id === c.context)?.bn;
  return `${ctx} · ${bnDigits(c.horizon)} ${c.turnMonths === 12 ? "বছর" : "প্রান্তিক"} · বীজ ${c.seed}`;
}
