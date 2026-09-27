/**
 * "জাতীয় মিশন" — a co-operative crisis game on the 32-module network.
 *
 * Pure and seeded: a game is (config, actions) and `replay` rebuilds it
 * exactly. The only randomness is the setup shuffle and the reshuffle after
 * each escalation, both drawn from streams of the seed, so the action phase
 * is deterministic and can be undone safely.
 *
 * Crises spread along the dependency links in their causal direction: when
 * a module overflows it collapses and pushes pressure into everything it
 * feeds. Root causes (modules nothing feeds) are never hit by a cascade —
 * but they feed everything else. That is the game's systems lesson.
 */

import { moduleLinks } from "../../../data/gori/modules.ts";
import {
  DIFFICULTIES,
  modulesIn,
  PILLARS,
  pillarOf,
  POLICIES,
  RULES,
  type Difficulty,
  type PillarId,
  type PolicyId,
  type RoleId,
} from "../../../data/gori/mission.ts";
import { createRng, digest, stableStringify } from "../rng.ts";

export const MISSION_ENGINE = "1.0.0";
export const NODES = Array.from({ length: 32 }, (_, i) => i + 1);

/* ------------------------------------------------------------------ *
 * Graph
 * ------------------------------------------------------------------ */

const out: number[][] = NODES.map(() => []);
const adj: number[][] = NODES.map(() => []);
out.unshift([]);
adj.unshift([]);
for (const l of moduleLinks) {
  const a = Number(l.from.slice(3));
  const b = Number(l.to.slice(3));
  if (!out[a].includes(b)) out[a].push(b);
  if (!adj[a].includes(b)) adj[a].push(b);
  if (!adj[b].includes(a)) adj[b].push(a);
}

/** Modules this one feeds (cascade direction). */
export const downstreamOf = (n: number): readonly number[] => out[n];
/** Modules this one depends on. */
export const upstreamOf = (n: number): number[] => NODES.filter((m) => out[m].includes(n));
/** Movement neighbours (links in either direction). */
export const neighboursOf = (n: number): readonly number[] => adj[n];
/** Modules no link feeds: crises never cascade into them, but they feed the rest. */
export const ROOTS = NODES.filter((n) => upstreamOf(n).length === 0);

/** How many modules a collapse here can eventually reach. */
export const REACH: number[] = [0, ...NODES.map((n) => {
  const seen = new Set<number>([n]);
  const q = [n];
  while (q.length)
    for (const m of out[q.shift()!])
      if (!seen.has(m)) {
        seen.add(m);
        q.push(m);
      }
  return seen.size - 1;
})];

const DIST: number[][] = [[], ...NODES.map((n) => {
  const d = new Array(33).fill(Infinity);
  d[n] = 0;
  const q = [n];
  while (q.length) {
    const x = q.shift()!;
    for (const y of adj[x])
      if (d[y] === Infinity) {
        d[y] = d[x] + 1;
        q.push(y);
      }
  }
  return d;
})];

/** Steps between two modules by road (drive only). */
export const roadDistance = (a: number, b: number): number => DIST[a][b];

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

export type Card = { kind: "node"; n: number } | { kind: "policy"; id: PolicyId } | { kind: "escalation" };

export interface Seat {
  name: string;
  role: RoleId;
  bot: boolean;
}

export interface MissionConfig {
  seed: string;
  difficulty: Difficulty;
  seats: Seat[];
}

export interface PlayerStats {
  treated: number;
  reforms: number;
  hubs: number;
  shared: number;
  prevented: number;
  moves: number;
}

export interface Player extends Seat {
  at: number;
  hand: Card[];
  stats: PlayerStats;
}

export type ReformState = "open" | "reformed" | "restored";
export type PressureSource = "setup" | "crisis" | "cascade" | "escalation";

export type GameEvent =
  | { type: "turn"; player: number }
  | { type: "move"; player: number; by: number; from: number; to: number; via: "drive" | "flight" | "charter" | "shuttle" | "summon" | "airlift" }
  | { type: "treat"; player: number; n: number; removed: number }
  | { type: "hub"; player: number; n: number; removed?: number }
  | { type: "share"; from: number; to: number; n: number }
  | { type: "reform"; player: number; pillar: PillarId }
  | { type: "restored"; pillar: PillarId }
  | { type: "draw"; player: number; cards: Card[] }
  | { type: "escalation"; n: number }
  | { type: "pressure"; n: number; amount: number; source: PressureSource; blocked?: "guardian" | "restored" }
  | { type: "collapse"; n: number; from?: number }
  | { type: "policy"; player: number; id: PolicyId; detail?: number[] }
  | { type: "discard"; player: number; card: Card }
  | { type: "peek"; player: number; top: number[]; buried?: number }
  | { type: "quiet" }
  | { type: "crisis"; cards: number[] }
  | { type: "over"; result: "win" | "lose"; reason: Outcome["reason"] };

export type LoggedEvent = GameEvent & { seq: number; turn: number };

export interface Outcome {
  result: "win" | "lose";
  reason: "reforms" | "trust" | "time";
}

export interface MissionState {
  config: MissionConfig;
  /** Pressure per module, index 1–32 (index 0 unused). */
  pressure: number[];
  hubs: number[];
  reforms: Record<PillarId, ReformState>;
  players: Player[];
  current: number;
  actionsLeft: number;
  phase: "actions" | "discard" | "over";
  /** Who must discard, and what happens after. */
  discard: { player: number; resume: "actions" | "crisis" } | null;
  playerDeck: Card[];
  playerDiscard: Card[];
  /** Top of the deck is index 0. */
  crisisDeck: number[];
  crisisDiscard: number[];
  /** Crisis cards taken out of the game by "টেকসই জনগোষ্ঠী". */
  removed: number[];
  escalations: number;
  collapses: number;
  quiet: boolean;
  analystUsed: boolean;
  /** Completed turns. */
  turn: number;
  outcome: Outcome | null;
  events: LoggedEvent[];
}

export type MissionAction =
  | { type: "drive"; to: number }
  | { type: "flight"; to: number }
  | { type: "charter"; to: number }
  | { type: "shuttle"; to: number }
  | { type: "treat" }
  | { type: "hub"; remove?: number }
  | { type: "share"; with: number; n: number; dir: "give" | "take" }
  | { type: "reform"; pillar: PillarId; cards: number[] }
  | { type: "summon"; player: number; to: number }
  | { type: "peek"; bury?: number }
  | { type: "policy"; id: PolicyId; n?: number; targets?: number[]; order?: number[]; player?: number; to?: number }
  | { type: "discard"; index: number }
  | { type: "end" };

/* ------------------------------------------------------------------ *
 * Setup
 * ------------------------------------------------------------------ */

function shuffle<T>(xs: T[], seed: string): T[] {
  const rng = createRng(seed);
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function validateConfig(c: MissionConfig): string | null {
  if (c.seats.length < 2 || c.seats.length > 4) return "২ থেকে ৪ জন খেলোয়াড় লাগবে";
  if (!c.seats.some((s) => !s.bot)) return "অন্তত একজন মানুষ খেলোয়াড় লাগবে";
  if (new Set(c.seats.map((s) => s.role)).size !== c.seats.length) return "প্রত্যেকের ভূমিকা আলাদা হতে হবে";
  if (!(c.difficulty in DIFFICULTIES)) return "অজানা কঠিনতা";
  return null;
}

export function setup(config: MissionConfig): MissionState {
  const err = validateConfig(config);
  if (err) throw new Error(err);
  const s: MissionState = {
    config,
    pressure: new Array(33).fill(0),
    hubs: [RULES.startHub],
    reforms: { people: "open", economy: "open", state: "open", nature: "open" },
    players: config.seats.map((seat) => ({ ...seat, at: RULES.startHub, hand: [], stats: { treated: 0, reforms: 0, hubs: 0, shared: 0, prevented: 0, moves: 0 } })),
    current: 0,
    actionsLeft: RULES.actionsPerTurn,
    phase: "actions",
    discard: null,
    playerDeck: [],
    playerDiscard: [],
    crisisDeck: shuffle(NODES, `${config.seed}:crisis`),
    crisisDiscard: [],
    removed: [],
    escalations: 0,
    collapses: 0,
    quiet: false,
    analystUsed: false,
    turn: 0,
    outcome: null,
    events: [],
  };

  // Nine opening crises: three at 3, three at 2, three at 1.
  for (const amount of [3, 3, 3, 2, 2, 2, 1, 1, 1]) {
    const n = s.crisisDeck.shift()!;
    s.crisisDiscard.push(n);
    s.pressure[n] = amount;
    log(s, { type: "pressure", n, amount, source: "setup" });
  }

  const cards: Card[] = shuffle([...NODES.map((n): Card => ({ kind: "node", n })), ...POLICIES.map((p): Card => ({ kind: "policy", id: p.id }))], `${config.seed}:players`);
  const per = RULES.startingHand[config.seats.length];
  for (const p of s.players) p.hand = cards.splice(0, per);

  // Split the rest into piles, one escalation shuffled into each, stacked.
  const piles = DIFFICULTIES[config.difficulty].escalations;
  const size = Math.floor(cards.length / piles);
  const extra = cards.length % piles;
  const deck: Card[] = [];
  let at = 0;
  for (let i = 0; i < piles; i++) {
    const len = size + (i < extra ? 1 : 0);
    deck.push(...shuffle([...cards.slice(at, at + len), { kind: "escalation" } as Card], `${config.seed}:pile:${i}`));
    at += len;
  }
  s.playerDeck = deck;
  log(s, { type: "turn", player: 0 });
  return s;
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function log(s: MissionState, e: GameEvent) {
  s.events.push({ ...e, seq: s.events.length, turn: s.turn } as LoggedEvent);
}

export function clone(s: MissionState): MissionState {
  return {
    ...s,
    pressure: s.pressure.slice(),
    hubs: s.hubs.slice(),
    reforms: { ...s.reforms },
    players: s.players.map((p) => ({ ...p, hand: p.hand.slice(), stats: { ...p.stats } })),
    discard: s.discard ? { ...s.discard } : null,
    playerDeck: s.playerDeck.slice(),
    playerDiscard: s.playerDiscard.slice(),
    crisisDeck: s.crisisDeck.slice(),
    crisisDiscard: s.crisisDiscard.slice(),
    removed: s.removed.slice(),
    events: s.events.slice(),
  };
}

export const holds = (p: Player, n: number) => p.hand.some((c) => c.kind === "node" && c.n === n);
export const holdsPolicy = (p: Player, id: PolicyId) => p.hand.some((c) => c.kind === "policy" && c.id === id);
export const reformNeed = (p: Player) => RULES.reformCards - (p.role === "researcher" ? 1 : 0);
/** Collapses the public will forgive, by difficulty. */
export const trustOf = (s: MissionState) => DIFFICULTIES[s.config.difficulty].trust;
export const trustLeft = (s: MissionState) => trustOf(s) - s.collapses;
export const crisisRate = (s: MissionState) => RULES.rate[Math.min(s.escalations, RULES.rate.length - 1)];
export const cardsOf = (p: Player, pillar: PillarId) => p.hand.filter((c): c is { kind: "node"; n: number } => c.kind === "node" && pillarOf(c.n) === pillar).map((c) => c.n);

function takeCard(p: Player, match: (c: Card) => boolean): Card {
  const i = p.hand.findIndex(match);
  if (i < 0) throw new Error("card not in hand");
  return p.hand.splice(i, 1)[0];
}

/** Is n shielded from new pressure by a community guardian? Returns the guardian's index. */
export function guardedBy(s: MissionState, n: number): number {
  return s.players.findIndex((p) => p.role === "guardian" && (p.at === n || adj[p.at].includes(n)));
}

function addPressure(s: MissionState, n: number, amount: number, source: PressureSource, chain: Set<number>, from?: number) {
  if (s.outcome) return;
  if (s.reforms[pillarOf(n)] === "restored") {
    log(s, { type: "pressure", n, amount, source, blocked: "restored" });
    return;
  }
  const g = guardedBy(s, n);
  if (g >= 0) {
    s.players[g].stats.prevented += amount;
    log(s, { type: "pressure", n, amount, source, blocked: "guardian" });
    return;
  }
  const next = s.pressure[n] + amount;
  if (next <= RULES.maxPressure) {
    s.pressure[n] = next;
    log(s, { type: "pressure", n, amount, source });
    return;
  }
  const added = RULES.maxPressure - s.pressure[n];
  s.pressure[n] = RULES.maxPressure;
  if (added > 0) log(s, { type: "pressure", n, amount: added, source });
  collapse(s, n, chain, from);
}

function collapse(s: MissionState, n: number, chain: Set<number>, from?: number) {
  if (chain.has(n) || s.outcome) return;
  chain.add(n);
  s.collapses++;
  log(s, { type: "collapse", n, from });
  if (s.collapses >= trustOf(s)) return finish(s, "lose", "trust");
  for (const t of out[n]) addPressure(s, t, 1, "cascade", chain, n);
}

function finish(s: MissionState, result: Outcome["result"], reason: Outcome["reason"]) {
  if (s.outcome) return;
  s.outcome = { result, reason };
  s.phase = "over";
  log(s, { type: "over", result, reason });
}

function checkRestored(s: MissionState, pillar: PillarId) {
  if (s.reforms[pillar] === "reformed" && modulesIn(pillar).every((n) => s.pressure[n] === 0)) {
    s.reforms[pillar] = "restored";
    log(s, { type: "restored", pillar });
  }
}

/** The field organiser clears reformed pillars wherever they stand. */
function organizerSweep(s: MissionState) {
  for (const p of s.players) {
    if (p.role !== "organizer") continue;
    const pillar = pillarOf(p.at);
    if (s.reforms[pillar] !== "open" && s.pressure[p.at] > 0) {
      const removed = s.pressure[p.at];
      s.pressure[p.at] = 0;
      p.stats.treated += removed;
      log(s, { type: "treat", player: s.players.indexOf(p), n: p.at, removed });
      checkRestored(s, pillar);
    }
  }
}

function checkHand(s: MissionState, i: number, resume: "actions" | "crisis"): boolean {
  if (s.players[i].hand.length > RULES.handLimit) {
    s.phase = "discard";
    s.discard = { player: i, resume };
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

/** Why an action is not allowed right now, or null if it is. */
export function whyNot(s: MissionState, a: MissionAction): string | null {
  if (s.outcome) return "খেলা শেষ";
  if (s.phase === "discard") {
    if (a.type === "discard") return a.index >= 0 && a.index < s.players[s.discard!.player].hand.length ? null : "কার্ড নেই";
    if (a.type === "policy" && s.discard!.player === s.current) return whyNotPolicy(s, a, s.players[s.current]);
    return "আগে হাতের বাড়তি কার্ড ফেলুন";
  }
  if (a.type === "discard") return "এখন কার্ড ফেলার সময় নয়";
  const me = s.players[s.current];
  if (a.type === "policy") return whyNotPolicy(s, a, me);
  if (a.type === "end") return null;
  if (s.actionsLeft <= 0) return "এই টার্নের অ্যাকশন শেষ";
  switch (a.type) {
    case "drive":
      return adj[me.at].includes(a.to) ? null : "সরাসরি সংযোগ নেই";
    case "flight":
      return a.to !== me.at && holds(me, a.to) ? null : "গন্তব্যের কার্ড হাতে নেই";
    case "charter":
      return a.to !== me.at && holds(me, me.at) ? null : "এই মডিউলের কার্ড হাতে নেই";
    case "shuttle":
      return a.to !== me.at && s.hubs.includes(me.at) && s.hubs.includes(a.to) ? null : "দুই দিকেই সমন্বয় কেন্দ্র লাগবে";
    case "treat":
      return s.pressure[me.at] > 0 ? null : "এখানে চাপ নেই";
    case "hub":
      if (s.hubs.includes(me.at)) return "এখানে আগেই কেন্দ্র আছে";
      if (me.role !== "engineer" && !holds(me, me.at)) return "এই মডিউলের কার্ড হাতে নেই";
      if (s.hubs.length >= RULES.maxHubs && (a.remove === undefined || !s.hubs.includes(a.remove))) return "সর্বোচ্চ কেন্দ্র — একটি সরাতে হবে";
      return null;
    case "share": {
      const other = s.players[a.with];
      if (!other || a.with === s.current) return "সঙ্গী বাছুন";
      if (other.at !== me.at) return "দুজনকে একই মডিউলে থাকতে হবে";
      const giver = a.dir === "give" ? me : other;
      if (!holds(giver, a.n)) return "কার্ডটি নেই";
      if (a.n !== me.at && giver.role !== "researcher") return "কেবল এই মডিউলের কার্ড দেওয়া-নেওয়া যায় (গবেষক ছাড়া)";
      return null;
    }
    case "reform": {
      if (!s.hubs.includes(me.at)) return "সমন্বয় কেন্দ্রে থাকতে হবে";
      if (s.reforms[a.pillar] !== "open") return "এই স্তম্ভের সংস্কার হয়ে গেছে";
      const need = reformNeed(me);
      if (new Set(a.cards).size !== need) return `একই স্তম্ভের ${"০১২৩৪৫৬৭৮৯"[need]}টি কার্ড লাগবে`;
      if (!a.cards.every((n) => pillarOf(n) === a.pillar && holds(me, n))) return "কার্ডগুলো এই স্তম্ভের নয়";
      return null;
    }
    case "summon": {
      if (me.role !== "coordinator") return "কেবল সমন্বয়ক পারেন";
      const p = s.players[a.player];
      if (!p) return "খেলোয়াড় নেই";
      if (p.at === a.to) return "সেখানেই আছেন";
      return s.players.some((q, i) => i !== a.player && q.at === a.to) ? null : "গন্তব্যে অন্য কোনো খেলোয়াড় থাকতে হবে";
    }
    case "peek":
      if (me.role !== "analyst") return "কেবল তথ্য বিশ্লেষক পারেন";
      if (s.analystUsed) return "এই টার্নে একবার হয়ে গেছে";
      if (a.bury !== undefined && (a.bury < 0 || a.bury > 2 || a.bury >= s.crisisDeck.length)) return "উপরের ৩টির একটি বাছুন";
      return null;
  }
  return "অজানা অ্যাকশন";
}

function whyNotPolicy(s: MissionState, a: Extract<MissionAction, { type: "policy" }>, me: Player): string | null {
  if (!holdsPolicy(me, a.id)) return "কার্ডটি হাতে নেই";
  switch (a.id) {
    case "fund":
      return a.n && !s.hubs.includes(a.n) && s.hubs.length < RULES.maxHubs ? null : "নতুন কেন্দ্রের জায়গা বাছুন";
    case "forecast": {
      const top = s.crisisDeck.slice(0, 6);
      const o = a.order ?? [];
      return o.length === top.length && top.every((n) => o.includes(n)) ? null : "উপরের কার্ডগুলো নতুন ক্রমে দিন";
    }
    case "volunteers": {
      const t = a.targets ?? [];
      if (!t.length || t.length > 2) return "১–২টি জায়গা বাছুন";
      const need = new Map<number, number>();
      for (const n of t) need.set(n, (need.get(n) ?? 0) + 1);
      return [...need].every(([n, k]) => s.pressure[n] >= k) ? null : "সেখানে এত চাপ নেই";
    }
    case "quiet":
      return s.quiet ? "আগেই চালু আছে" : null;
    case "resilience":
      return a.n !== undefined && s.crisisDiscard.includes(a.n) ? null : "বাতিল স্তূপ থেকে একটি কার্ড বাছুন";
    case "airlift":
      return a.player !== undefined && s.players[a.player] && a.to && s.players[a.player].at !== a.to ? null : "খেলোয়াড় ও গন্তব্য বাছুন";
  }
}

/* ------------------------------------------------------------------ *
 * Apply
 * ------------------------------------------------------------------ */

/** Apply one action. Throws if it is not allowed; returns a new state. */
export function apply(prev: MissionState, a: MissionAction): MissionState {
  const err = whyNot(prev, a);
  if (err) throw new Error(err);
  const s = clone(prev);
  const me = s.players[s.current];
  const i = s.current;

  const move = (p: Player, to: number, via: Extract<GameEvent, { type: "move" }>["via"], by = i) => {
    const from = p.at;
    p.at = to;
    s.players[by].stats.moves++;
    log(s, { type: "move", player: s.players.indexOf(p), by, from, to, via });
    organizerSweep(s);
  };

  switch (a.type) {
    case "drive":
      move(me, a.to, "drive");
      break;
    case "flight":
      s.playerDiscard.push(takeCard(me, (c) => c.kind === "node" && c.n === a.to));
      move(me, a.to, "flight");
      break;
    case "charter":
      s.playerDiscard.push(takeCard(me, (c) => c.kind === "node" && c.n === me.at));
      move(me, a.to, "charter");
      break;
    case "shuttle":
      move(me, a.to, "shuttle");
      break;
    case "treat": {
      const pillar = pillarOf(me.at);
      const all = me.role === "organizer" || s.reforms[pillar] !== "open";
      const removed = all ? s.pressure[me.at] : 1;
      s.pressure[me.at] -= removed;
      me.stats.treated += removed;
      log(s, { type: "treat", player: i, n: me.at, removed });
      checkRestored(s, pillar);
      break;
    }
    case "hub":
    {
      if (me.role !== "engineer") s.playerDiscard.push(takeCard(me, (c) => c.kind === "node" && c.n === me.at));
      const removed = s.hubs.length >= RULES.maxHubs ? a.remove : undefined;
      if (removed !== undefined) s.hubs = s.hubs.filter((h) => h !== removed);
      s.hubs.push(me.at);
      me.stats.hubs++;
      log(s, { type: "hub", player: i, n: me.at, removed });
      break;
    }
    case "share": {
      const other = s.players[a.with];
      const [giver, taker, gi, ti] = a.dir === "give" ? [me, other, i, a.with] : [other, me, a.with, i];
      taker.hand.push(takeCard(giver, (c) => c.kind === "node" && c.n === a.n));
      me.stats.shared++;
      log(s, { type: "share", from: gi, to: ti, n: a.n });
      break;
    }
    case "reform":
      for (const n of a.cards) s.playerDiscard.push(takeCard(me, (c) => c.kind === "node" && c.n === n));
      s.reforms[a.pillar] = "reformed";
      me.stats.reforms++;
      log(s, { type: "reform", player: i, pillar: a.pillar });
      organizerSweep(s);
      checkRestored(s, a.pillar);
      break;
    case "summon":
      move(s.players[a.player], a.to, "summon");
      break;
    case "peek": {
      const top = s.crisisDeck.slice(0, 3);
      if (a.bury !== undefined) s.crisisDeck.push(...s.crisisDeck.splice(a.bury, 1));
      s.analystUsed = true;
      log(s, { type: "peek", player: i, top, buried: a.bury !== undefined ? top[a.bury] : undefined });
      break;
    }
    case "policy":
      playPolicy(s, a);
      break;
    case "discard": {
      const d = s.discard!;
      const card = s.players[d.player].hand.splice(a.index, 1)[0];
      s.playerDiscard.push(card);
      log(s, { type: "discard", player: d.player, card });
      if (s.players[d.player].hand.length <= RULES.handLimit) resolveDiscard(s);
      return s;
    }
    case "end":
      s.actionsLeft = 0;
      break;
  }

  if (s.outcome) return s;
  if (PILLARS.every((p) => s.reforms[p.id] !== "open")) {
    finish(s, "win", "reforms");
    return s;
  }
  if (a.type !== "policy" && a.type !== "end") s.actionsLeft--;
  if (a.type === "share" && checkHand(s, a.dir === "give" ? a.with : i, "actions")) return s;
  if (s.actionsLeft <= 0 && s.phase === "actions") endTurn(s);
  return s;
}

function playPolicy(s: MissionState, a: Extract<MissionAction, { type: "policy" }>) {
  const holder = s.phase === "discard" ? s.discard!.player : s.current;
  const me = s.players[holder];
  s.playerDiscard.push(takeCard(me, (c) => c.kind === "policy" && c.id === a.id));
  switch (a.id) {
    case "fund":
      s.hubs.push(a.n!);
      me.stats.hubs++;
      log(s, { type: "policy", player: holder, id: a.id, detail: [a.n!] });
      break;
    case "forecast":
      s.crisisDeck.splice(0, a.order!.length, ...a.order!);
      log(s, { type: "policy", player: holder, id: a.id });
      break;
    case "volunteers":
      for (const n of a.targets!) s.pressure[n]--;
      me.stats.treated += a.targets!.length;
      log(s, { type: "policy", player: holder, id: a.id, detail: a.targets });
      for (const n of new Set(a.targets)) checkRestored(s, pillarOf(n));
      break;
    case "quiet":
      s.quiet = true;
      log(s, { type: "policy", player: holder, id: a.id });
      break;
    case "resilience":
      s.crisisDiscard = s.crisisDiscard.filter((n) => n !== a.n);
      s.removed.push(a.n!);
      log(s, { type: "policy", player: holder, id: a.id, detail: [a.n!] });
      break;
    case "airlift": {
      const p = s.players[a.player!];
      log(s, { type: "policy", player: holder, id: a.id, detail: [a.player!, a.to!] });
      const from = p.at;
      p.at = a.to!;
      log(s, { type: "move", player: a.player!, by: holder, from, to: a.to!, via: "airlift" });
      organizerSweep(s);
      break;
    }
  }
  if (s.phase === "discard" && me.hand.length <= RULES.handLimit) resolveDiscard(s);
}

/** The hand is back under the limit: carry on where the game paused. */
function resolveDiscard(s: MissionState) {
  const d = s.discard!;
  s.discard = null;
  s.phase = "actions";
  if (d.resume === "crisis") crisisAndNext(s);
  else if (s.actionsLeft <= 0) endTurn(s);
}

/** Draw two player cards (escalations resolve at once), then the crisis phase. */
function endTurn(s: MissionState) {
  const me = s.players[s.current];
  const drawn: Card[] = [];
  for (let k = 0; k < 2; k++) {
    const card = s.playerDeck.shift();
    if (!card) return finish(s, "lose", "time");
    if (card.kind === "escalation") {
      escalate(s);
      if (s.outcome) return;
    } else {
      me.hand.push(card);
      drawn.push(card);
    }
  }
  log(s, { type: "draw", player: s.current, cards: drawn });
  if (checkHand(s, s.current, "crisis")) return;
  crisisAndNext(s);
}

function escalate(s: MissionState) {
  s.escalations++;
  const n = s.crisisDeck.pop();
  if (n === undefined) return;
  log(s, { type: "escalation", n });
  addPressure(s, n, 3, "escalation", new Set());
  s.crisisDiscard.push(n);
  s.crisisDeck = [...shuffle(s.crisisDiscard, `${s.config.seed}:intensify:${s.escalations}`), ...s.crisisDeck];
  s.crisisDiscard = [];
}

function crisisAndNext(s: MissionState) {
  if (s.outcome) return;
  if (s.quiet) {
    s.quiet = false;
    log(s, { type: "quiet" });
  } else {
    const cards: number[] = [];
    for (let k = 0; k < crisisRate(s) && !s.outcome; k++) {
      if (!s.crisisDeck.length) s.crisisDeck = shuffle(s.crisisDiscard.splice(0), `${s.config.seed}:refill:${s.turn}`);
      const n = s.crisisDeck.shift();
      if (n === undefined) break;
      s.crisisDiscard.push(n);
      cards.push(n);
      addPressure(s, n, 1, "crisis", new Set());
    }
    log(s, { type: "crisis", cards });
  }
  if (s.outcome) return;
  s.turn++;
  s.current = (s.current + 1) % s.players.length;
  s.actionsLeft = RULES.actionsPerTurn;
  s.analystUsed = false;
  s.phase = "actions";
  log(s, { type: "turn", player: s.current });
}

/* ------------------------------------------------------------------ *
 * Replay, analysis, score
 * ------------------------------------------------------------------ */

export function replay(config: MissionConfig, actions: MissionAction[]): MissionState {
  return actions.reduce(apply, setup(config));
}

/** What would happen if module n overflowed now: the chain of collapses and everything hit. */
export function cascadePreview(s: MissionState, n: number): { collapsed: number[]; hit: number[] } {
  const t = clone(s);
  t.events = [];
  t.outcome = null;
  t.collapses = -1e6; // never end the preview game
  t.pressure[n] = RULES.maxPressure;
  addPressure(t, n, 1, "cascade", new Set());
  const collapsed = t.events.filter((e) => e.type === "collapse").map((e) => (e as { n: number }).n);
  const hit = [...new Set(t.events.filter((e) => e.type === "pressure" && !(e as { blocked?: string }).blocked).map((e) => (e as { n: number }).n))].filter((m) => m !== n);
  return { collapsed, hit };
}

/** Every legal non-policy action for the current player (for bots and hints). */
export function legalActions(s: MissionState): MissionAction[] {
  if (s.outcome || s.phase !== "actions" || s.actionsLeft <= 0) return [];
  const me = s.players[s.current];
  const xs: MissionAction[] = [];
  for (const to of adj[me.at]) xs.push({ type: "drive", to });
  for (const c of me.hand) if (c.kind === "node" && c.n !== me.at) xs.push({ type: "flight", to: c.n });
  if (holds(me, me.at)) for (const to of NODES) if (to !== me.at && !adj[me.at].includes(to)) xs.push({ type: "charter", to });
  if (s.hubs.includes(me.at)) for (const to of s.hubs) if (to !== me.at) xs.push({ type: "shuttle", to });
  xs.push({ type: "treat" });
  xs.push({ type: "hub", remove: s.hubs.length >= RULES.maxHubs ? s.hubs[0] : undefined });
  s.players.forEach((p, j) => {
    if (j === s.current || p.at !== me.at) return;
    for (const c of me.hand) if (c.kind === "node") xs.push({ type: "share", with: j, n: c.n, dir: "give" });
    for (const c of p.hand) if (c.kind === "node") xs.push({ type: "share", with: j, n: c.n, dir: "take" });
  });
  for (const pl of PILLARS) {
    const have = cardsOf(me, pl.id);
    if (have.length >= reformNeed(me)) xs.push({ type: "reform", pillar: pl.id, cards: have.slice(0, reformNeed(me)) });
  }
  if (me.role === "coordinator")
    s.players.forEach((p, j) => {
      for (const q of s.players) if (q !== p && q.at !== p.at) xs.push({ type: "summon", player: j, to: q.at });
    });
  if (me.role === "analyst") xs.push({ type: "peek" });
  return xs.filter((a) => whyNot(s, a) === null);
}

export interface MissionScore {
  total: number;
  parts: { id: string; bn: string; points: number }[];
}

export function scoreMission(s: MissionState): MissionScore {
  const reformed = PILLARS.filter((p) => s.reforms[p.id] !== "open").length;
  const restored = PILLARS.filter((p) => s.reforms[p.id] === "restored").length;
  const win = s.outcome?.result === "win";
  const parts = [
    { id: "reforms", bn: "জাতীয় সংস্কার (প্রতিটি ১৫)", points: reformed * 15 },
    { id: "restored", bn: "পুরোপুরি সুস্থ স্তম্ভ (প্রতিটি ৪)", points: restored * 4 },
    { id: "trust", bn: "বাকি জনআস্থা (প্রতিটি ২)", points: Math.max(0, trustLeft(s)) * 2 },
    { id: "win", bn: "মিশন সফল", points: win ? 6 : 0 },
    { id: "time", bn: "হাতে থাকা সময় (সর্বোচ্চ ৮)", points: win ? Math.min(8, s.playerDeck.length) : 0 },
  ];
  return { total: Math.min(100, parts.reduce((a, p) => a + p.points, 0)), parts };
}

export const missionKey = (config: MissionConfig, actions: MissionAction[]) =>
  digest(stableStringify({ engine: MISSION_ENGINE, config, actions }));

/** Personal contribution, for the end-of-game table. */
export const contribution = (p: PlayerStats) => p.treated + p.reforms * 6 + p.hubs * 2 + p.shared * 2 + p.prevented;
