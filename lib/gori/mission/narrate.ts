/**
 * Bangla sentences for the mission log and screen-reader announcements.
 */

import { codeOf, moduleOf } from "../../../data/gori/modules.ts";
import { pillarDef, policyDef } from "../../../data/gori/mission.ts";
import type { Card, LoggedEvent, MissionState } from "./engine.ts";

export const bn = (v: number | string) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
export const titleOf = (n: number) => moduleOf(codeOf(n))!.titleBn;
export const label = (n: number) => `${codeOf(n)} ${titleOf(n)}`;

export function cardName(c: Card): string {
  if (c.kind === "node") return label(c.n);
  if (c.kind === "policy") return `নীতি: ${policyDef(c.id).bn}`;
  return "মহাসংকট";
}

const VIA = { drive: "সড়কপথে", flight: "কার্ড দিয়ে সরাসরি", charter: "চার্টারে", shuttle: "কেন্দ্র থেকে কেন্দ্রে", summon: "সমন্বয়কের ডাকে", airlift: "দ্রুত মোতায়েনে" } as const;
const SOURCE = { setup: "শুরুর সংকট", crisis: "সংকট", cascade: "ঢেউ", escalation: "মহাসংকট" } as const;

/** One event as a sentence; null for events that need no line of their own. */
export function narrate(s: MissionState, e: LoggedEvent): string | null {
  const name = (i: number) => s.players[i]?.name ?? "";
  switch (e.type) {
    case "turn":
      return `— ${name(e.player)}-এর পালা —`;
    case "move":
      return e.player === e.by
        ? `${name(e.player)} ${VIA[e.via]} গেলেন ${codeOf(e.to)}-এ।`
        : `${name(e.by)} ${name(e.player)}-কে পাঠালেন ${codeOf(e.to)}-এ (${VIA[e.via]})।`;
    case "treat":
      return `${name(e.player)} ${codeOf(e.n)}-এর চাপ কমালেন (−${bn(e.removed)})।`;
    case "hub":
      return `${name(e.player)} ${codeOf(e.n)}-এ সমন্বয় কেন্দ্র বানালেন${e.removed ? ` (${codeOf(e.removed)}-এর কেন্দ্র সরিয়ে)` : ""}।`;
    case "share":
      return `${name(e.from)} ${codeOf(e.n)} কার্ড দিলেন ${name(e.to)}-কে।`;
    case "reform":
      return `জাতীয় সংস্কার চালু: ${pillarDef(e.pillar).reformBn} (${pillarDef(e.pillar).bn}) — ${name(e.player)}।`;
    case "restored":
      return `${pillarDef(e.pillar).bn} পুরোপুরি সুস্থ — এখানে আর নতুন চাপ বসবে না।`;
    case "draw":
      return e.cards.length ? `${name(e.player)} পেলেন: ${e.cards.map(cardName).join(", ")}।` : null;
    case "escalation":
      return `মহাসংকট! ${label(e.n)}-এ একসাথে বড় ধাক্কা; পুরোনো সংকটগুলো আবার ডেকের উপরে।`;
    case "pressure":
      if (e.source === "setup") return null;
      if (e.blocked === "guardian") return `সমাজ রক্ষী ঠেকালেন: ${codeOf(e.n)}-এ ${SOURCE[e.source]} বসল না।`;
      if (e.blocked === "restored") return `${codeOf(e.n)} সুস্থ স্তম্ভে — ${SOURCE[e.source]} বসল না।`;
      return `${SOURCE[e.source]}: ${codeOf(e.n)}-এ চাপ +${bn(e.amount)}।`;
    case "collapse":
      return `ভাঙন! ${label(e.n)} ভেঙে পড়ল${e.from ? ` (${codeOf(e.from)}-এর ঢেউয়ে)` : ""} — জনআস্থা কমল।`;
    case "policy":
      return `${name(e.player)} খেললেন নীতি-কার্ড: ${policyDef(e.id).bn}।`;
    case "discard":
      return `${name(e.player)} ফেলে দিলেন: ${cardName(e.card)}।`;
    case "peek":
      return `${name(e.player)} সংকট-ডেকের উপরের কার্ড দেখলেন${e.buried ? `; ${codeOf(e.buried)} নিচে পাঠালেন` : ""}।`;
    case "quiet":
      return "শান্ত প্রান্তিক — এবার কোনো নতুন সংকট নেই।";
    case "crisis":
      return null;
    case "over":
      return e.result === "win"
        ? "মিশন সফল! চারটি জাতীয় সংস্কারই চালু হয়েছে।"
        : e.reason === "trust"
          ? "মিশন ব্যর্থ — ভাঙনে ভাঙনে জনআস্থা শেষ।"
          : "মিশন ব্যর্থ — সময় ফুরিয়েছে, কার্ডের ডেক শেষ।";
  }
}
