"use client";

import { useMemo } from "react";
import { PUZZLE_TARGET } from "@/lib/gori/progression";
import { periodOf, previewDraft, scenarioOf, simulate, stateAt } from "@/lib/gori/sim/engine";
import type { Action, SimConfig } from "@/lib/gori/sim/types";
import { useGori, type Game } from "../store";

const MONTHS = ["জানু–মার্চ", "এপ্রিল–জুন", "জুলাই–সেপ্টে", "অক্টো–ডিসে"];
const DIGITS = "০১২৩৪৫৬৭৮৯";
const bn = (v: number | string) => String(v).replace(/\d/g, (d) => DIGITS[Number(d)]);

export function periodLabel(c: SimConfig, turn: number): string {
  const p = periodOf(c, turn);
  return p.quarter === null ? `${bn(p.year)} সাল` : `${bn(p.year)} · ${MONTHS[p.quarter]}`;
}

/** Everything a screen needs about the current game, replayed from (config, plan, turn). */
export function useGame(game: Game) {
  const run = useMemo(() => simulate(game.config, game.plan, { turns: game.turn }), [game.config, game.plan, game.turn]);
  const sc = scenarioOf(game.config.scenario);
  const finished = game.turn >= game.config.horizon;
  const state = useMemo(() => stateAt(run, Math.min(game.turn, run.turns.length)), [run, game.turn]);
  const draft: Action[] = useMemo(() => (finished ? [] : (game.plan[game.turn] ?? [])), [finished, game.plan, game.turn]);
  const preview = useMemo(() => previewDraft(sc, state, draft), [sc, state, draft]);
  return { run, sc, state, draft, preview, finished };
}

export const CAMPAIGN_STAGES = [
  { id: "identify", bn: "সমস্যা চিনুন", hint: "সমস্যার বিবরণ আর প্রমাণ পড়ে “বুঝেছি” চাপুন।" },
  { id: "stakeholders", bn: "অংশীজন বুঝুন", hint: "অংশীজন প্যানেল খুলে কে কী চান দেখুন।" },
  { id: "map", bn: "কারণ-মানচিত্র বানান", hint: `মানচিত্রে লুকোনো ${bn(PUZZLE_TARGET)}টি সম্পর্ক খুঁজে বের করুন।` },
  { id: "pilot", bn: "ছোট হস্তক্ষেপ বাছুন", hint: "কোনো হস্তক্ষেপ পাইলট হিসেবে চালু করুন — খরচ কম, ঝুঁকি কম।" },
  { id: "observe", bn: "ফল দেখুন", hint: "অন্তত দুই টার্ন চালান, ফলাফল ট্যাবে কারণসহ পরিবর্তন দেখুন।" },
  { id: "scale", bn: "সমাধান বড় করুন", hint: "যে পাইলট কাজ করছে, তাকে পূর্ণ পরিসরে নিন।" },
  { id: "adapt", bn: "অনাকাঙ্ক্ষিত ফল সামলান", hint: "কোনো ঘটনায় সাড়া দিন, বা অর্থায়ন বদলে পার্শ্বপ্রতিক্রিয়া সামলান।" },
  { id: "national", bn: "জাতীয় স্তরে যুক্ত করুন", hint: "খেলা শেষ করুন — ফল জাতীয় পিক্সেল মানচিত্রে BD-001 পুনর্গঠন করবে।" },
] as const;

export function useStages(game: Game, run: ReturnType<typeof simulate>) {
  const found = useGori((s) => s.progress.puzzleFound);
  const ok = run.turns.flatMap((t) => t.actions.filter((a) => a.ok).map((a) => a.action));
  const done: Record<string, boolean> = {
    identify: game.flags.includes("brief"),
    stakeholders: game.flags.includes("stakeholders"),
    map: found.length >= PUZZLE_TARGET,
    pilot: ok.some((a) => a.type === "launch" && a.scale === "pilot"),
    observe: game.turn >= 2,
    scale: ok.some((a) => a.type === "scale"),
    adapt: ok.some((a) => a.type === "respond" || a.type === "fund" || a.type === "stop"),
    national: !!game.result,
  };
  const current = CAMPAIGN_STAGES.find((s) => !done[s.id]);
  return { done, current };
}
