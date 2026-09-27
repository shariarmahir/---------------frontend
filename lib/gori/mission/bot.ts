/**
 * AI teammates for the mission ("বট মন্ত্রী"). A transparent heuristic, not
 * a model: it scores a position by risk (pressure weighted by how far a
 * collapse would spread), reform progress and positioning, and looks two
 * actions ahead. The same scorer powers the "পরামর্শ" hint for humans, and
 * its reasons are written so a player can check them against the board.
 */

import { codeOf } from "../../../data/gori/modules.ts";
import { PILLARS, pillarDef, pillarOf, RULES, type PillarId } from "../../../data/gori/mission.ts";
import {
  apply,
  cardsOf,
  cascadePreview,
  guardedBy,
  holdsPolicy,
  legalActions,
  NODES,
  REACH,
  reformNeed,
  roadDistance,
  whyNot,
  type Card,
  type MissionAction,
  type MissionState,
  type Player,
} from "./engine.ts";

const bn = (v: number) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const code = (n: number) => codeOf(n);

/** Travel cost from a to b using roads and, where they help, the hub shuttle. */
export function travel(s: MissionState, a: number, b: number): number {
  const road = roadDistance(a, b);
  if (!s.hubs.length) return road;
  const toHub = Math.min(...s.hubs.map((h) => roadDistance(a, h)));
  const fromHub = Math.min(...s.hubs.map((h) => roadDistance(h, b)));
  return Math.min(road, toHub + 1 + fromHub);
}

/** How dangerous pressure on n is: collapses here reach REACH[n] modules. */
export function weightOf(s: MissionState, n: number): number {
  let w = 1 + 0.35 * REACH[n];
  // Cards in the crisis discard come back on top after the next escalation.
  if (s.crisisDiscard.includes(n)) w *= 1.3;
  if (s.crisisDeck.slice(0, 3).includes(n) && s.events.some((e) => e.type === "peek" || (e.type === "policy" && e.id === "forecast"))) w *= 1.2;
  return w;
}

export function evaluate(s: MissionState): number {
  if (s.outcome) return s.outcome.result === "win" ? 1e7 : -1e7;
  let v = 0;
  for (const p of PILLARS) v += s.reforms[p.id] === "restored" ? 3600 : s.reforms[p.id] === "reformed" ? 3000 : 0;
  v -= s.collapses * 900;

  for (const n of NODES) {
    const p = s.pressure[n];
    if (!p) continue;
    const w = weightOf(s, n);
    v -= p * p * w * 12;
    if (p === RULES.maxPressure) v -= 70 * w;
    if (guardedBy(s, n) >= 0) v += p * w * 6;
  }

  // Cards: concentrated in one hand is what launches a reform.
  for (const pl of PILLARS) {
    if (s.reforms[pl.id] !== "open") continue;
    let best = 0;
    let holder: Player | null = null;
    let team = 0;
    for (const p of s.players) {
      const c = cardsOf(p, pl.id).length;
      team += c;
      const ratio = c / reformNeed(p);
      if (ratio > best) {
        best = ratio;
        holder = p;
      }
    }
    v += team * 40 + Math.min(1, best) ** 2 * 900;
    if (holder && best >= 1) v -= 150 * Math.min(...s.hubs.map((h) => travel(s, holder!.at, h)));
  }
  for (const p of s.players) for (const c of p.hand) if (c.kind === "policy") v += 160;

  v += Math.min(s.hubs.length, 4) * 220 + Math.max(0, s.hubs.length - 4) * 40;

  // Stand near trouble.
  const hot = NODES.filter((n) => s.pressure[n] >= 2);
  for (const p of s.players) if (hot.length) v -= 14 * Math.min(...hot.map((n) => travel(s, p.at, n)));
  return v;
}

/** Value of a card to the team, lowest first when discarding. */
function cardValue(s: MissionState, p: Player, c: Card): number {
  if (c.kind === "escalation") return -1;
  if (c.kind === "policy") return 60;
  const pillar = pillarOf(c.n);
  if (s.reforms[pillar] !== "open") return 5;
  return 20 + cardsOf(p, pillar).length * 10;
}

function discardIndex(s: MissionState): number {
  const p = s.players[s.discard!.player];
  let best = 0;
  p.hand.forEach((c, i) => {
    if (cardValue(s, p, c) < cardValue(s, p, p.hand[best])) best = i;
  });
  return best;
}

/** Free policy plays worth making now, if any. */
function policyPlay(s: MissionState): MissionAction | null {
  const me = s.players[s.current];
  const risky = NODES.filter((n) => s.pressure[n] > 0).sort((a, b) => s.pressure[b] * weightOf(s, b) - s.pressure[a] * weightOf(s, a));
  const at3 = NODES.filter((n) => s.pressure[n] === RULES.maxPressure);
  const tries: MissionAction[] = [];
  if (holdsPolicy(me, "volunteers") && at3.length) {
    const t = risky.slice(0, 2);
    tries.push({ type: "policy", id: "volunteers", targets: t.length === 1 && s.pressure[t[0]] >= 2 ? [t[0], t[0]] : t });
  }
  if (holdsPolicy(me, "resilience")) {
    const worst = s.crisisDiscard.slice().sort((a, b) => weightOf(s, b) * (s.pressure[b] + 1) - weightOf(s, a) * (s.pressure[a] + 1))[0];
    if (worst !== undefined && s.pressure[worst] >= 2) tries.push({ type: "policy", id: "resilience", n: worst });
  }
  if (holdsPolicy(me, "fund") && s.hubs.length < 3) {
    const score = (n: number) => REACH[n] + Math.min(...s.hubs.map((h) => roadDistance(n, h)));
    const spot = NODES.filter((n) => !s.hubs.includes(n)).sort((a, b) => score(b) - score(a))[0];
    tries.push({ type: "policy", id: "fund", n: spot });
  }
  if (holdsPolicy(me, "quiet") && s.actionsLeft === 1 && at3.length >= 3) tries.push({ type: "policy", id: "quiet" });
  if (holdsPolicy(me, "forecast") && s.crisisDeck.length >= 2) {
    const top = s.crisisDeck.slice(0, 6);
    // Safest first: modules with room, shielded or already fixed.
    const danger = (n: number) => (s.reforms[pillarOf(n)] === "restored" || guardedBy(s, n) >= 0 ? -1 : s.pressure[n] * weightOf(s, n));
    const order = top.slice().sort((a, b) => danger(a) - danger(b));
    if (order.some((n, i) => n !== top[i]) && at3.length) tries.push({ type: "policy", id: "forecast", order });
  }
  return tries.find((a) => whyNot(s, a) === null) ?? null;
}

/** The bot's next action for whoever must act now. */
export function botStep(s: MissionState): MissionAction {
  if (s.phase === "discard") return { type: "discard", index: discardIndex(s) };
  const policy = policyPlay(s);
  if (policy) return policy;
  return bestAction(s)?.action ?? { type: "end" };
}

function bestAction(s: MissionState): { action: MissionAction; value: number } | null {
  const first = legalActions(s);
  if (!first.length) return null;
  let best: { action: MissionAction; value: number } | null = null;
  for (const a of first) {
    const t = apply(s, a);
    let v = evaluate(t);
    if (!t.outcome && t.phase === "actions" && t.current === s.current && t.actionsLeft > 0) {
      for (const b of legalActions(t)) v = Math.max(v, evaluate(apply(t, b)) - 1);
    }
    if (!best || v > best.value) best = { action: a, value: v };
  }
  return best;
}

export interface Hint {
  action: MissionAction;
  reason: string;
}

/** A suggestion for a human player, with the reasoning spelled out. */
export function suggest(s: MissionState): Hint | null {
  if (s.outcome) return null;
  const action = botStep(s);
  return { action, reason: explain(s, action) };
}

export function explain(s: MissionState, a: MissionAction): string {
  const me = s.players[s.phase === "discard" ? s.discard!.player : s.current];
  switch (a.type) {
    case "treat": {
      const n = me.at;
      const prev = cascadePreview(s, n);
      return s.pressure[n] >= RULES.maxPressure && prev.hit.length
        ? `${code(n)}-এ চাপ ${bn(s.pressure[n])} — আর একটি এলেই ভাঙবে, ঢেউ যাবে ${prev.hit.map(code).join(", ")}-এ।`
        : `${code(n)}-এর চাপ কমান — এখান থেকে ${bn(REACH[n])}টি মডিউলে প্রভাব পৌঁছাতে পারে।`;
    }
    case "reform":
      return `${pillarDef(a.pillar).bn}-এর ${bn(a.cards.length)}টি কার্ড হাতে, কেন্দ্রেও আছেন — এখনই জাতীয় সংস্কার চালু করুন।`;
    case "hub":
      return `${code(me.at)}-এ সমন্বয় কেন্দ্র হলে এক অ্যাকশনে যেকোনো কেন্দ্রে যাওয়া যাবে, সংস্কারও এখানে চালু করা যাবে।`;
    case "share":
      return `${code(a.n)} কার্ডটি ${a.dir === "give" ? "দিন" : "নিন"} — একই স্তম্ভের কার্ড এক হাতে জমলে সংস্কার দ্রুত হয়।`;
    case "peek":
      return "সংকট-ডেকের উপরের তিনটি দেখে নিন — সবচেয়ে বিপজ্জনকটি নিচে পাঠান।";
    case "summon":
      return `${s.players[a.player].name}-কে ${code(a.to)}-এ ডেকে আনুন — একসাথে থাকলে কার্ড দেওয়া-নেওয়া যায়।`;
    case "policy":
      return `নীতি-কার্ড খেলার ঠিক সময় — ${a.id === "volunteers" ? "ভাঙনের মুখে থাকা মডিউল থেকে চাপ সরান" : a.id === "fund" ? "কেন্দ্রের জাল বাড়ান" : a.id === "resilience" ? "বিপজ্জনক কার্ডটি চিরতরে সরান" : a.id === "quiet" ? "এই সংকট-পর্ব বাদ দিন" : "নিরাপদগুলো আগে আসুক"}।`;
    case "discard":
      return "যে কার্ড সবচেয়ে কম কাজে লাগবে সেটি ফেলুন।";
    case "end":
      return "আর কোনো অ্যাকশন অবস্থা ভালো করে না — টার্ন শেষ করুন।";
    default: {
      const to = a.to;
      const need = PILLARS.find((pl) => s.reforms[pl.id] === "open" && cardsOf(me, pl.id).length >= reformNeed(me));
      if (need && s.hubs.includes(to)) return `${pillarDef(need.id).bn}-এর কার্ড হাতে — সংস্কারের জন্য কেন্দ্র ${code(to)}-এ যান।`;
      if (s.pressure[to] >= 2) return `${code(to)}-এ চাপ ${bn(s.pressure[to])} — সেখানে গিয়ে সামলান।`;
      return `${code(to)}-এর দিকে এগোন — ঝুঁকিপূর্ণ এলাকার কাছাকাছি থাকা ভালো।`;
    }
  }
}

/** Play a whole game with bots in every seat (tests and balance checks). */
export function autoplay(s: MissionState, maxSteps = 4000): MissionState {
  let t = s;
  for (let i = 0; i < maxSteps && !t.outcome; i++) t = apply(t, botStep(t));
  return t;
}

export type { PillarId };
